const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Private (All roles)
const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private (Principal, Teacher)
const createEvent = async (req, res) => {
    try {
        const { title, description, date } = req.body;

        const event = new Event({
            title,
            description,
            date: date || Date.now(),
            authorName: req.user.name,
            authorRole: req.user.role
        });

        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Principal)
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await event.deleteOne();

        res.json({ message: 'Event removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getEvents, createEvent, deleteEvent };
