const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            
            // Sensitive fields locking for students
            if (user.role === 'Student') {
                // Students cannot change email or phone
                if (req.body.email || req.body.phone) {
                    return res.status(400).json({ 
                        message: 'Students are not allowed to update email or phone number. Please contact administration.' 
                    });
                }
            } else {
                user.email = req.body.email || user.email;
                user.phone = req.body.phone || user.phone;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                avatarUrl: updatedUser.avatarUrl,
                token: req.headers.authorization.split(' ')[1] // Send back same token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update profile photo
// @route   POST /api/users/profile/photo
// @access  Private
const updateProfilePhoto = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            if (!req.file) {
                return res.status(400).json({ message: 'Please upload a file' });
            }

            // In a real app we'd delete old photo if exists
            user.avatarUrl = `/uploads/${req.file.filename}`;
            await user.save();

            res.json({
                message: 'Profile photo updated successfully',
                avatarUrl: user.avatarUrl
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfile, updateProfile, updateProfilePhoto };
