const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentProfile,
    createStudent,
    bulkUploadStudents
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('Principal', 'Teacher'), getAllStudents)
    .post(protect, authorize('Principal', 'Teacher'), createStudent);

router.post('/bulk', protect, authorize('Principal', 'Teacher'), upload.single('file'), bulkUploadStudents);

// This must be before /:id to assure "profile" isn't treated as an ID
router.route('/profile')
    .get(protect, authorize('Student', 'Parent'), getStudentProfile);

router.route('/:id')
    .get(protect, getStudentById)
    .put(protect, authorize('Principal', 'Teacher'), updateStudent)
    .delete(protect, authorize('Principal'), deleteStudent);

module.exports = router;
