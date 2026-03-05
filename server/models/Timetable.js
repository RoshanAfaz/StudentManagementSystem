const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true,
        unique: true // One timetable per class
    },
    // Type of timetable: 'image' or 'manual'
    type: {
        type: String,
        enum: ['image', 'manual'],
        required: true
    },
    // If type is 'image'
    imageUrl: {
        type: String
    },
    // If type is 'manual', store structured data
    // Structure: { "Monday": ["Math", "English", ...], "Tuesday": [...] }
    schedule: {
        type: Map,
        of: [String]
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const Timetable = mongoose.model('Timetable', timetableSchema);
module.exports = Timetable;
