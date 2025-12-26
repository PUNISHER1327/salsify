const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User.model');
const Client = require('./src/models/Client.model');
const Task = require('./src/models/Task.model');
const Invoice = require('./src/models/Invoice.model');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find();
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            const clientCount = await Client.countDocuments({ user: user._id });
            const taskCount = await Task.countDocuments({ user: user._id });
            const invoiceCount = await Invoice.countDocuments({ user: user._id });

            console.log(`User: ${user.email} (${user._id})`);
            console.log(`   - Clients: ${clientCount}`);
            console.log(`   - Tasks: ${taskCount}`);
            console.log(`   - Invoices: ${invoiceCount}`);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
