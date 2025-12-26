const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./src/models/User.model');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        users.forEach(u => {
            console.log(`User: ${u.name}, Email: ${u.email}, ID: ${u._id}`);
        });
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

checkUsers();
