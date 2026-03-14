const Marks = require('../models/Marks');

// @desc    Add marks for a student
// @route   POST /api/marks
// @access  Private (Teacher)
const addMarks = async (req, res) => {
    const { studentId, examType, subjects } = req.body;

    // Subjects should be an array: [{ subjectName, marksObtained, maxMarks }, ...]


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

// @desc    Get advanced marks report with custom filters
// @route   GET /api/marks/advanced-report
// @access  Private (Teacher/Principal)
const getAdvancedMarksReport = async (req, res) => {
    const { className, studentId, examType, startDate, endDate } = req.query;

    try {
        let query = {};

        if (className) {
            const Student = require('../models/Student');
            const students = await Student.find({ className });
            const studentIds = students.map(s => s._id);
            query.student = { $in: studentIds };
        }

        if (studentId) {
            query.student = studentId;
        }

        if (examType) {
            query.examType = examType;
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const marksRecords = await Marks.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name studentId' }
            })
            .sort({ date: 1 });

        res.json(marksRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all unique exam types added so far
// @route   GET /api/marks/exam-types
// @access  Private (Teacher/Principal)
const getUniqueExamTypes = async (req, res) => {
    try {
        const examTypes = await Marks.distinct('examType');
        res.json(examTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addMarks,
    getStudentMarks,
    getAdvancedMarksReport,
    getUniqueExamTypes
};
