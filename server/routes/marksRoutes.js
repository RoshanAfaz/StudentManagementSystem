const express = require('express');
const router = express.Router();
const { addMarks, getStudentMarks } = require('../controllers/marksController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Teacher', 'Principal'), addMarks);
router.get('/student/:id', protect, getStudentMarks);

module.exports = router;
