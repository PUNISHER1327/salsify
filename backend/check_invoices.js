const mongoose = require('mongoose');
require('dotenv').config();
const Invoice = require('./src/models/Invoice.model');
const User = require('./src/models/User.model');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({ email: 'john12snow@gmail.com' });
        if (!user) { console.log('User not found'); return; }

        console.log(`Checking invoices for: ${user.email}`);

        const invoices = await Invoice.find({ user: user._id });

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        console.log(`Start of month: ${startOfMonth}`);

        invoices.forEach(inv => {
            console.log(`Invoice ${inv._id}:`);
            console.log(` - Status: '${inv.status}'`);
            console.log(` - CreatedAt: ${inv.createdAt}`);
            console.log(` - Amount: ${inv.amount}`);

            const isPaid = inv.status.toLowerCase() === 'paid';
            const isThisMonth = inv.createdAt >= startOfMonth;
            console.log(` - Counts for Stats? ${isPaid && isThisMonth}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
