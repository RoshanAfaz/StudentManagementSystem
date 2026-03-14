const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Mark attendance for a student
// @route   POST /api/attendance
// @access  Private (Teacher)
const markAttendance = async (req, res) => {
    const { studentId, date, status } = req.body;

    try {
        // Check if attendance already exists for this student on this date
        // Note: Date passing should be handled carefully (ISO string or YYYY-MM-DD)
        // Here assuming basic date match or allowing multiple entries if time differs? 
        // Schema says unique per student+date.

        // Convert date to start of day to ensure uniqueness per day
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const existingAttendance = await Attendance.findOne({
            student: studentId,
            date: { $gte: dayStart, $lte: dayEnd }
        });

        if (existingAttendance) {
            existingAttendance.status = status;
            await existingAttendance.save();
            return res.json(existingAttendance);
        }

        const attendance = await Attendance.create({
            student: studentId,
            date: date || Date.now(),
            status,
            teacher: req.user._id // Provided by protect middleware
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance for a student
// @route   GET /api/attendance/student/:id
// @access  Private (Principal/Teacher/Parent/Student)
const getStudentAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ student: req.params.id }).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk save attendance for multiple students
// @route   POST /api/attendance/bulk
// @access  Private (Teacher/Principal)
const saveBulkAttendance = async (req, res) => {
    const { attendanceData, date } = req.body; // attendanceData: [{ studentId, status }]

    try {
        if (!attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({ message: 'Invalid attendance data provided' });
        }

        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const results = await Promise.all(attendanceData.map(async (item) => {
            const { studentId, status } = item;

            // Use findOneAndUpdate with upsert for efficiency
            return await Attendance.findOneAndUpdate(
                {
                    student: studentId,
                    date: dayStart
                },
                {
                    status,
                    teacher: req.user._id,
                    date: dayStart
                },
                { upsert: true, new: true }
            );
        }));

        res.status(200).json({ message: 'Attendance saved successfully', count: results.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get consolidated attendance report for a class
// @route   GET /api/attendance/report/:className
// @access  Private (Teacher/Principal)
const getClassAttendanceReport = async (req, res) => {
    const { className } = req.params;
    const { month, year } = req.query; // Optional filters

    try {
        // Find all students in this class
        const students = await Student.find({ className }).populate('user', 'name studentId');
        const studentIds = students.map(s => s._id);

        let query = { student: { $in: studentIds } };

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const attendanceRecords = await Attendance.find(query).sort({ date: 1 });

        // Group by student for the report
        const report = students.map(student => {
            const records = attendanceRecords.filter(r => r.student.toString() === student._id.toString());
            const present = records.filter(r => r.status === 'Present').length;
            const absent = records.filter(r => r.status === 'Absent').length;
            const total = records.length;

            return {
                studentId: student._id,
                name: student.user?.name,
                rollNumber: student.rollNumber,
                present,
                absent,
                total,
                percentage: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
                records: records.map(r => ({ date: r.date, status: r.status }))
            };
        });

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get advanced attendance report with custom date range
// @route   GET /api/attendance/advanced-report
// @access  Private (Teacher/Principal)
const getAdvancedAttendanceReport = async (req, res) => {
    const { className, startDate, endDate, studentId } = req.query;

    try {
        let query = {};

        if (className) {
            const students = await Student.find({ className });
            const studentIds = students.map(s => s._id);
            query.student = { $in: studentIds };
        }

        if (studentId) {
            query.student = studentId;
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendanceRecords = await Attendance.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name studentId' }
            })
            .sort({ date: 1 });

        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    getStudentAttendance,
    saveBulkAttendance,
    getClassAttendanceReport,
    getAdvancedAttendanceReport
};
