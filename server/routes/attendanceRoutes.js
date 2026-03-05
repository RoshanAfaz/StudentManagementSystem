const express = require('express');
const router = express.Router();
const { markAttendance, getStudentAttendance, saveBulkAttendance, getClassAttendanceReport } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Teacher', 'Principal'), markAttendance);
router.post('/bulk', protect, authorize('Teacher', 'Principal'), saveBulkAttendance);
router.get('/report/:className', protect, authorize('Teacher', 'Principal'), getClassAttendanceReport);
router.get('/student/:id', protect, getStudentAttendance);

module.exports = router;
