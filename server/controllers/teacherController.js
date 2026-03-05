const Teacher = require('../models/Teacher');
const User = require('../models/User');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Principal)
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find().populate('user', '-password');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new teacher (User + Profile)
// @route   POST /api/teachers
// @access  Private (Principal)
// @desc    Create a new teacher (User + Profile)
// @route   POST /api/teachers
// @access  Private (Principal)
const createTeacher = async (req, res) => {
    try {
        const { name, email, password, phone, subject, qualification, assignedClasses } = req.body;

        // 1. Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Check if this user is a Teacher without a profile (Orphan)
            if (user.role === 'Teacher') {
                const existingProfile = await Teacher.findOne({ user: user._id });
                if (existingProfile) {
                    return res.status(400).json({ message: 'Teacher already exists' });
                }
                // Orphan found: Continue to create profile for existing user
            } else {
                return res.status(400).json({ message: 'User already exists with a different role' });
            }
        } else {
            // 2. Create New User
            user = await User.create({
                name,
                email,
                password,
                phone,
                role: 'Teacher'
            });
        }

        // 3. Create Teacher Profile (for new or orphan user)
        if (user) {
            try {
                // Parse assignedClasses if it's a string
                let classesToAssign = assignedClasses;
                if (typeof assignedClasses === 'string') {
                    classesToAssign = assignedClasses.split(',').map(c => c.trim()).filter(c => c !== '');
                }

                const teacher = await Teacher.create({
                    user: user._id,
                    subject,
                    qualification,
                    assignedClasses: classesToAssign || []
                });

                res.status(201).json({
                    _id: teacher._id,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone
                    },
                    subject: teacher.subject,
                    qualification: teacher.qualification,
                    assignedClasses: teacher.assignedClasses
                });
            } catch (profileError) {
                res.status(400).json({ message: 'Error creating teacher profile: ' + profileError.message });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }

    } catch (error) {
        // If User.create failed (e.g. race condition), it goes here
        res.status(500).json({ message: error.message });
    }
};


// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Principal)
const updateTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (teacher) {
            teacher.subject = req.body.subject || teacher.subject;
            teacher.qualification = req.body.qualification || teacher.qualification;

            if (req.body.assignedClasses !== undefined) {
                let classesToAssign = req.body.assignedClasses;
                if (typeof req.body.assignedClasses === 'string') {
                    classesToAssign = req.body.assignedClasses.split(',').map(c => c.trim()).filter(c => c !== '');
                }
                teacher.assignedClasses = classesToAssign;
            }

            if (req.body.phone !== undefined) {
                const user = await User.findById(teacher.user);
                if (user) {
                    user.phone = req.body.phone;
                    await user.save();
                }
            }

            const updatedTeacher = await teacher.save();
            const populatedTeacher = await Teacher.findById(updatedTeacher._id).populate('user', '-password');
            res.json(populatedTeacher);
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Principal)
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (teacher) {
            await User.findByIdAndDelete(teacher.user);
            await teacher.deleteOne();
            res.json({ message: 'Teacher removed' });
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get teachers by assigned class
// @route   GET /api/teachers/class/:className
// @access  Private (Principal, Parent, Student)
const getTeachersByClass = async (req, res) => {
    try {
        const className = req.params.className.trim();
        // Use regex for case-insensitive matching in the array
        const teachers = await Teacher.find({
            assignedClasses: { $regex: new RegExp(`^\\s*${className}\\s*$`, 'i') }
        }).populate('user', 'name email phone');

        console.log(`Fetching teachers for class: ${className}, Found: ${teachers.length}`);
        res.json(teachers);
    } catch (error) {
        console.error("Error fetching teachers:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getTeachersByClass
};
