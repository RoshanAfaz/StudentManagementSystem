const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, studentId, password, phone } = req.body;

    try {
        let query;
        if (studentId) {
            query = { studentId };
        } else {
            // "email" in body might be email OR phone now from the frontend logic
            // We can check both if we treat the input as a generic identifier
            const identifier = email || phone;
            query = {
                $or: [
                    { email: identifier },
                    { phone: identifier }
                ]
            };
        }

        // Find user
        const user = await User.findOne(query);

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                studentId: user.studentId,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email/ID or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (for initial setup) / Protected (later)
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (for initial setup) / Protected (later)
const registerUser = async (req, res) => {
    const { name, email, password, role, studentId, phone } = req.body;

    try {
        // Construct query to check for existing user
        const orConditions = [{ email }];
        if (studentId && studentId.trim() !== '') {
            orConditions.push({ studentId });
        }

        const userExists = await User.findOne({ $or: orConditions });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            studentId: (studentId && studentId.trim() !== '') ? studentId : undefined,
            phone
        });

        if (user) {
            // Create profile based on role
            if (role === 'Student') {
                await Student.create({ user: user._id, className: 'TBD' }); // Default placeholder
            } else if (role === 'Teacher') {
                await Teacher.create({ user: user._id, subject: 'TBD' }); // Default placeholder
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser, registerUser, changePassword };
