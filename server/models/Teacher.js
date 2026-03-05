const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    qualification: {
        type: String
    },
    assignedClasses: [{
        type: String
    }]
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
