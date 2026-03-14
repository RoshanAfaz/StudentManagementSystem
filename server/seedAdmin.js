const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Default Admin Credentials
const DEFAULT_ADMIN = {
    name: 'Roshan Afaz',
    email: 'roshanafazf@gmail.com',
    password: 'Roshan@27',
    role: 'Admin',
    phone: '1234567890'
};

const seedAdmin = async () => {
    try {
        // Connect to MongoDB using the URI in .env
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-management';
        console.log(`Connecting to database at: ${mongoUri.substring(0, 20)}...`);
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('MongoDB Connected successfully.');

        // Check if any Admin already exists
        const adminExists = await User.findOne({ role: 'Admin' });
        
        if (adminExists) {
            console.log('\n❌ An Admin user already exists in this database.');
            console.log(`Email: ${adminExists.email}`);
            console.log('Seeding aborted to prevent overwriting.');
            process.exit();
        }

        // Create the new Admin
        console.log('\nCreating new Admin user...');
        const newAdmin = await User.create(DEFAULT_ADMIN);
        
        console.log('\n✅ Admin Created Successfully!');
        console.log('--------------------------------');
        console.log(`Email: ${newAdmin.email}`);
        console.log(`Password: ${DEFAULT_ADMIN.password}`);
        console.log('--------------------------------');
        console.log('You can now log in and start setting up your school.');

        process.exit();
    } catch (error) {
        console.error('\n❌ Error seeding Admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
