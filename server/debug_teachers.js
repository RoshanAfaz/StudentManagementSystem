const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const User = require('./models/User');
require('dotenv').config();

const debugTeachers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const teachers = await Teacher.find({}).populate('user', 'name email');

        console.log('\n--- All Teachers ---');
        teachers.forEach(t => {
            console.log(`Name: ${t.user?.name || 'UNKNOWN'}`);
            console.log(`Email: ${t.user?.email}`);
            console.log(`Assigned Classes: ${JSON.stringify(t.assignedClasses)}`);
            console.log('-------------------');
        });

        const lkgTeachers = await Teacher.find({ assignedClasses: 'LKG-A' }).populate('user');
        console.log(`\nTeachers found via query { assignedClasses: 'LKG-A' }: ${lkgTeachers.length}`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugTeachers();
