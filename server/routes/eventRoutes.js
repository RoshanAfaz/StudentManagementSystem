const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getEvents, createEvent, deleteEvent } = require('../controllers/eventController');

router.get('/', protect, getEvents);
router.post('/', protect, authorize('Principal', 'Teacher'), createEvent);
router.delete('/:id', protect, authorize('Principal'), deleteEvent);

module.exports = router;
