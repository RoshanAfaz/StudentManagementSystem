const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');

// @desc    Get dashboard stats (Principal)
// @route   GET /api/dashboard/stats
// @access  Private (Principal)
const getDashboardStats = async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const teacherCount = await Teacher.countDocuments();
        const userCount = await User.countDocuments();

        res.json({
            students: studentCount,
            teachers: teacherCount,
            users: userCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats (Admin)
// @route   GET /api/dashboard/admin/stats
// @access  Private (Admin, Principal)
const getAdminDashboardStats = async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const teacherCount = await Teacher.countDocuments();
        const parentCount = await User.countDocuments({ role: 'Parent' });
        const principalCount = await User.countDocuments({ role: 'Principal' });
        const adminCount = await User.countDocuments({ role: 'Admin' });
        const userCount = await User.countDocuments();

        res.json({
            students: studentCount,
            teachers: teacherCount,
            parents: parentCount,
            principals: principalCount,
            admins: adminCount,
            users: userCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all admins and principals
// @route   GET /api/dashboard/admins
// @access  Private (Principal, Admin)
const getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: { $in: ['Principal', 'Admin'] } }).select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');
const Marks = require('../models/Marks');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');

// @desc    Reset entire system (Admin only)
// @route   DELETE /api/dashboard/admin/reset
// @access  Private (Admin)
const resetSystem = async (req, res) => {
    try {
        // Delete all data except Admin users
        await Promise.all([
            Student.deleteMany({}),
            Teacher.deleteMany({}),
            Timetable.deleteMany({}),
            Notification.deleteMany({}),
            Marks.deleteMany({}),
            Event.deleteMany({}),
            Attendance.deleteMany({}),
            User.deleteMany({ role: { $ne: 'Admin' } })
        ]);

        res.json({ message: 'System has been successfully reset. All non-Admin data is cleared.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAdmins,
    getAdminDashboardStats,
    resetSystem
};

