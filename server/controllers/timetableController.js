const Timetable = require('../models/Timetable');
const path = require('path');
const fs = require('fs');

// @desc    Create or Update Timetable
// @route   POST /api/timetable
// @access  Private (Teacher/Principal)
const createTimetable = async (req, res) => {
    try {
        const { className, type, schedule } = req.body;

        let updateData = {
            className,
            type,
            lastUpdated: Date.now()
        };

        if (type === 'manual') {
            // schedule comes as a JSON string if manually sent via multipart, or object if json
            // But since we might use FormData for image upload, let's handle flexibility.
            // If it's a pure JSON request, req.body.schedule is object.
            updateData.schedule = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
        } else if (type === 'image') {
            if (!req.file) {
                return res.status(400).json({ message: 'No image uploaded' });
            }
            // In a real app, upload to S3/Cloudinary. Here, serve locally.
            // Assuming multer saved it to 'uploads/'
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Upsert: Update if exists, else create
        const timetable = await Timetable.findOneAndUpdate(
            { className },
            updateData,
            { new: true, upsert: true }
        );

        res.json(timetable);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Timetable by Class
// @route   GET /api/timetable/:className
// @access  Private
const getTimetable = async (req, res) => {
    try {
        const { className } = req.params;
        const timetable = await Timetable.findOne({ className });

        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found for this class' });
        }
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTimetable, getTimetable };
