const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dob: {
        type: Date
    },
    address: {
        type: String
    },
    className: {
        type: String,
        required: true
    },
    section: {
        type: String
    },
    rollNumber: {
        type: String
    },
    parentName: {
        type: String
    },
    parentPhone: {
        type: String
    },
    parentEmail: {
        type: String
    }
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
