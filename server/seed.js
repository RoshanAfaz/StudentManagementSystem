const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
// const connectDB = require('./server'); // Removed to avoid starting server
// Better to just connect directly here.

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school-management')
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Student.deleteMany({});
        await Teacher.deleteMany({});
        console.log('Data Cleared');

        // 1. Create Principal
        const principalUser = await User.create({
            name: 'Principal Skinner',
            email: 'principal@school.com',
            password: 'password123',
            role: 'Principal'
        });
        console.log('Principal Created');

        // 2. Create Teacher
        const teacherUser = await User.create({
            name: 'Edna Krabappel',
            email: 'teacher@school.com',
            password: 'password123',
            role: 'Teacher'
        });

        const teacherProfile = await Teacher.create({
            user: teacherUser._id,
            subject: 'Mathematics',
            qualification: 'M.Sc, B.Ed',
            assignedClasses: ['Class 10-A']
        });
        console.log('Teacher Created');

        // 3. Create Student
        const studentUser = await User.create({
            name: 'Bart Simpson',
            email: 'student@school.com', // Optional for student login
            studentId: 'STU001',
            password: 'password123',
            role: 'Student'
        });

        const studentProfile = await Student.create({
            user: studentUser._id,
            className: 'Class 10-A',
            rollNumber: '101',
            parentName: 'Homer Simpson',
            parentEmail: 'parent@school.com', // KEY for linking
            parentPhone: '555-0101'
        });
        console.log('Student Created');

        // 4. Create Parent
        const parentUser = await User.create({
            name: 'Homer Simpson',
            email: 'parent@school.com', // Matches student.parentEmail
            password: 'password123',
            role: 'Parent'
        });
        console.log('Parent Created');

        console.log('Seeding Completed!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
