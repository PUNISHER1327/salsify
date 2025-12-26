const cron = require('node-cron');
const Invoice = require('../models/Invoice.model');
const Expense = require('../models/Expense.model');

const initCronJobs = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running recurring jobs...');
        const today = new Date();

        // --- Recurring Invoices ---
        try {
            console.log('Checking recurring invoices...');
            const invoices = await Invoice.find({
                isRecurring: true,
                nextRunDate: { $lte: today },
            });

            for (const invoice of invoices) {
                const newDueDate = new Date();
                newDueDate.setDate(newDueDate.getDate() + 30); // Default 30 days due

                await Invoice.create({
                    user: invoice.user,
                    client: invoice.client,
                    amount: invoice.amount,
                    dueDate: newDueDate,
                    items: invoice.items,
                    status: 'unpaid',
                    isRecurring: false,
                });

                const nextDate = new Date(invoice.nextRunDate);
                if (invoice.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                else if (invoice.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
                else nextDate.setMonth(nextDate.getMonth() + 1);

                invoice.nextRunDate = nextDate;
                await invoice.save();
                console.log(`Generated recurring invoice for client ${invoice.client}`);
            }
        } catch (error) {
            console.error('Error in recurring invoice cron:', error);
        }

        // --- Recurring Expenses ---
        try {
            console.log('Checking recurring expenses...');
            const expenses = await Expense.find({
                isRecurring: true,
                nextRunDate: { $lte: today },
            });

            for (const expense of expenses) {
                await Expense.create({
                    user: expense.user,
                    description: expense.description,
                    amount: expense.amount,
                    category: expense.category,
                    date: new Date(),
                    isRecurring: false,
                });

                const nextDate = new Date(expense.nextRunDate);
                if (expense.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                else if (expense.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
                else nextDate.setMonth(nextDate.getMonth() + 1);

                expense.nextRunDate = nextDate;
                await expense.save();
                console.log(`Generated recurring expense: ${expense.description}`);
            }
        } catch (error) {
            console.error('Error in recurring expense cron:', error);
        }
    });

    console.log('Cron Jobs Initialized');
};

module.exports = initCronJobs;
