const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
    const users = await User.find({ name: { $regex: 'shallu', $options: 'i' } });
    users.forEach(u => console.log('Name: ' + u.name + ', Student ID: ' + u.studentId));
    mongoose.disconnect();
})
.catch(err => console.error(err));
