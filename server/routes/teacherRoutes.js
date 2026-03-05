const express = require('express');
const router = express.Router();
const {
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getTeachersByClass
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/class/:className', protect, authorize('Principal', 'Parent', 'Student'), getTeachersByClass);

router.route('/')
    .get(protect, authorize('Principal'), getAllTeachers)
    .post(protect, authorize('Principal'), createTeacher);

router.route('/:id')
    .put(protect, authorize('Principal'), updateTeacher)
    .delete(protect, authorize('Principal'), deleteTeacher);

module.exports = router;
