const Student = require('../models/Student');
const User = require('../models/User');
const xlsx = require('xlsx');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Principal/Teacher)
// @desc    Get all students
// @route   GET /api/students
// @access  Private (Principal/Teacher)
const getAllStudents = async (req, res) => {
    try {
        let query = {};

        // If the requester is a Teacher, filter by their assigned classes
        if (req.user && req.user.role === 'Teacher') {
            const Teacher = require('../models/Teacher'); // Import locally to avoid circular dep issues if any
            const teacherProfile = await Teacher.findOne({ user: req.user._id });

            if (teacherProfile && teacherProfile.assignedClasses && teacherProfile.assignedClasses.length > 0) {
                query.className = { $in: teacherProfile.assignedClasses };
            } else {
                // If teacher has no assigned classes, they see ALL students
                // This allows new teachers to see students they just added or students they might need to manage.
                // query.className = { $in: [] }; // OLD logic: returned nothing
            }
        }

        const students = await Student.find(query).populate('user', '-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new student (User + Profile)
// @route   POST /api/students
// @access  Private (Principal/Teacher)
const createStudent = async (req, res) => {
    try {
        const { name, email, password, studentId, className, rollNumber, parentName, parentEmail, parentPhone } = req.body;

        // 1. Check if user exists (by email or studentId)
        const checkQuery = [];
        if (email && email.trim() !== '') checkQuery.push({ email: email.toLowerCase() });
        if (studentId && studentId.trim() !== '') checkQuery.push({ studentId });

        if (checkQuery.length > 0) {
            const userExists = await User.findOne({ $or: checkQuery });

            if (userExists) {
                return res.status(400).json({ message: 'User already exists with this email or ID' });
            }
        }

        // 1.5 Handle Parent User Creation/Linkage
        if (parentPhone) {
            const existingParent = await User.findOne({ phone: parentPhone });
            if (!existingParent) {
                try {
                    await User.create({
                        name: parentName || 'Parent',
                        email: (parentEmail && parentEmail.trim() !== '') ? parentEmail : undefined,
                        phone: parentPhone,
                        password: 'parent123', // Default password
                        role: 'Parent'
                    });
                } catch (err) {
                    console.error('Error creating parent user:', err.message);
                    // Continue even if parent creation fails? Ideally yes, but maybe warn.
                    // For now, logging error but proceeding to create student.
                }
            }
        }

        // 2. Create User (Student)
        const user = await User.create({
            name,
            email: (email && email.trim() !== '') ? email : undefined,
            password: password || 'student123',
            studentId: (studentId && studentId.trim() !== '') ? studentId : undefined,
            role: 'Student'
        });

        // 3. Create Student Profile
        if (user) {
            const student = await Student.create({
                user: user._id,
                className,
                rollNumber,
                parentName,
                parentEmail,
                parentPhone
            });

            // 4. Automatically Assign Class to Teacher (if applicable)
            if (req.user && req.user.role === 'Teacher') {
                const Teacher = require('../models/Teacher');
                const teacherProfile = await Teacher.findOne({ user: req.user._id });
                if (teacherProfile && className && !teacherProfile.assignedClasses.includes(className)) {
                    teacherProfile.assignedClasses.push(className);
                    await teacherProfile.save();
                }
            }

            res.status(201).json(student);
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk Upload Students
// @route   POST /api/students/bulk
// @access  Private (Principal/Teacher)
const bulkUploadStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        let successCount = 0;
        let errors = [];

        for (const row of data) {
            // Expected Row: Name, Email, Password, StudentID, Class, RollNo, ParentName, ParentEmail, ParentPhone
            // Map keys loosely (case insensitive handling is hard here, assume standard headers)
            const name = row['Name'];
            const email = row['Email'];
            const password = row['Password'] || 'password123';
            const studentId = row['Student ID'] || row['StudentID'];
            const className = row['Class'];
            const rollNumber = row['Roll No'];
            const parentName = row['Parent Name'];
            const parentEmail = row['Parent Email'];
            const parentPhone = row['Parent Phone'];

            if (!name || !email || !className) {
                errors.push(`Skipped ${name || 'Unknown'}: Missing required fields`);
                continue;
            }

            try {
                // Check if user exists
                const userExists = await User.findOne({ $or: [{ email }, { studentId }] });
                if (userExists) {
                    errors.push(`Skipped ${name}: User already exists`);
                    continue;
                }

                const user = await User.create({
                    name,
                    email,
                    password,
                    studentId,
                    role: 'Student'
                });

                if (user) {
                    await Student.create({
                        user: user._id,
                        className,
                        rollNumber,
                        parentName,
                        parentEmail,
                        parentPhone
                    });

                    // Auto-assign class to teacher if not already assigned
                    if (req.user && req.user.role === 'Teacher') {
                        const Teacher = require('../models/Teacher');
                        const teacherProfile = await Teacher.findOne({ user: req.user._id });
                        if (teacherProfile && className && !teacherProfile.assignedClasses.includes(className)) {
                            teacherProfile.assignedClasses.push(className);
                            await teacherProfile.save();
                        }
                    }

                    successCount++;
                }
            } catch (err) {
                errors.push(`Error adding ${name}: ${err.message}`);
            }
        }

        res.json({
            message: `Processed ${data.length} rows`,
            successCount,
            errors
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get student profile (Self or Linked)
// @route   GET /api/students/profile
// @access  Private (Student/Parent)
const getStudentProfile = async (req, res) => {
    try {
        let student;

        // Workaround for undefined req.user if auth middleware fails (should be caught by protect)
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });

        if (req.user.role === 'Student') {
            student = await Student.findOne({ user: req.user._id }).populate('user', '-password');
        } else if (req.user.role === 'Parent') {
            // Find valid student linked to this parent email OR phone
            student = await Student.findOne({
                $or: [
                    { parentEmail: req.user.email },
                    { parentPhone: req.user.phone }
                ]
            }).populate('user', '-password');
        }

        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student profile not found for this user' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student profile by ID
// @route   GET /api/students/:id
// @access  Private (Principal/Teacher/Parent/Student)
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', '-password');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Teacher Security Check
        if (req.user && req.user.role === 'Teacher') {
            const Teacher = require('../models/Teacher');
            const teacherProfile = await Teacher.findOne({ user: req.user._id });
            if (teacherProfile && teacherProfile.assignedClasses) {
                if (!teacherProfile.assignedClasses.includes(student.className)) {
                    return res.status(403).json({ message: 'Not authorized to view students from this class' });
                }
            }
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Principal/Teacher)
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            student.className = req.body.className || student.className;
            student.section = req.body.section || student.section;
            student.rollNumber = req.body.rollNumber || student.rollNumber;
            student.address = req.body.address || student.address;
            student.parentName = req.body.parentName || student.parentName;
            student.parentPhone = req.body.parentPhone || student.parentPhone;
            student.parentEmail = req.body.parentEmail || student.parentEmail;

            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Principal)
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            // Also delete the associated User
            await User.findByIdAndDelete(student.user);
            await student.deleteOne();
            res.json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentProfile,
    createStudent,
    bulkUploadStudents
};
