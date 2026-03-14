const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    examType: {
        type: String, // e.g., "Midterm", "Final", "Unit Test 1"
        required: true
    },
    subjects: [
        {
            subjectName: { type: String, required: true },
            marksObtained: { type: Number, required: true },
            maxMarks: { type: Number, required: true },
            passMarks: { type: Number, default: 35 } // Default pass marks
        }
    ],
    grandTotalObtained: {
        type: Number,
        required: true
    },
    grandTotalMax: {
        type: Number,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId, // Graded by
        ref: 'Teacher'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Marks = mongoose.model('Marks', marksSchema);
module.exports = Marks;
