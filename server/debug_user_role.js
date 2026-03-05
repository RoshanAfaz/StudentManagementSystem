const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const debugUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ name: { $regex: 'Fairoze', $options: 'i' } });
        console.log('--- Users matching "Fairoze" ---');
        users.forEach(u => {
            console.log(`Name: '${u.name}', Email: '${u.email}', Role: '${u.role}'`);
        });
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
debugUser();
