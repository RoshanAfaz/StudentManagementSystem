const express = require('express');
const router = express.Router();
const { addMarks, getStudentMarks, getAdvancedMarksReport, getUniqueExamTypes } = require('../controllers/marksController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Teacher', 'Principal'), addMarks);
router.get('/advanced-report', protect, authorize('Teacher', 'Principal', 'Admin'), getAdvancedMarksReport);
router.get('/exam-types', protect, authorize('Teacher', 'Principal', 'Admin'), getUniqueExamTypes);
router.get('/student/:id', protect, getStudentMarks);

module.exports = router;
