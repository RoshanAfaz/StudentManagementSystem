const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'roshan@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`Updating password for ${user.name} (${user.role})...`);
            user.password = 'teacher123';
            await user.save();
            console.log('Password updated to: teacher123');
        } else {
            console.log('User NOT found with email:', email);
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetPassword();
