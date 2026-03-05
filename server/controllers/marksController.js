const Marks = require('../models/Marks');

// @desc    Add marks for a student
// @route   POST /api/marks
// @access  Private (Teacher)
const addMarks = async (req, res) => {
    const { studentId, examType, subjects } = req.body;

    // Subjects should be an array: [{ subjectName, marksObtained, maxMarks }, ...]
    console.log("Adding Marks - Request Body:", req.body);

    try {
        let grandTotalObtained = 0;
        let grandTotalMax = 0;

        subjects.forEach(sub => {
            grandTotalObtained += Number(sub.marksObtained);
            grandTotalMax += Number(sub.maxMarks);
        });

        const marks = await Marks.create({
            student: studentId,
            examType,
            subjects,
            grandTotalObtained,
            grandTotalMax,
            teacher: req.user._id
        });

        res.status(201).json(marks);
    } catch (error) {
        console.error("Error adding marks:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get marks for a student
// @route   GET /api/marks/student/:id
// @access  Private (Principal/Teacher/Parent/Student)
const getStudentMarks = async (req, res) => {
    try {
        const marks = await Marks.find({ student: req.params.id }).sort({ date: -1 });
        res.json(marks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addMarks,
    getStudentMarks
};
