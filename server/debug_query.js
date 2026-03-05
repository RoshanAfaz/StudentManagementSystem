const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
require('dotenv').config();

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const searchInput = "LKG-A";
        console.log(`Search Input: '${searchInput}' Codes: ${[...searchInput].map(c => c.charCodeAt(0))}`);

        // Dump what IS in DB
        const all = await Teacher.find({});
        console.log('\n--- Actual DB Values ---');
        all.forEach(t => {
            console.log(`Teacher: ${t._id}`);
            if (t.assignedClasses && t.assignedClasses.length > 0) {
                t.assignedClasses.forEach(c => {
                    console.log(`  Class: '${c}' Codes: ${[...c].map(char => char.charCodeAt(0))}`);
                });
            }
        });

        const regexMatch = await Teacher.find({
            assignedClasses: { $regex: new RegExp(`^\\s*${searchInput}\\s*$`, 'i') }
        });
        console.log(`\nVerified Regex Query Match Count: ${regexMatch.length}`);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

runDebug();
