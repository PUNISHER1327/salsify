const asyncHandler = require('express-async-handler');
const Task = require('../models/Task.model');
const Invoice = require('../models/Invoice.model');
const emailService = require('../utils/emailService');

// @desc    Trigger task reminders for the logged-in user
// @route   POST /api/reminders/tasks
// @access  Private
const sendTaskReminders = asyncHandler(async (req, res) => {
    // Find pending tasks for the user
    // We can filter by due date if needed, but for now let's send all pending
    const tasks = await Task.find({
        user: req.user.id,
        status: { $ne: 'Completed' }
    }).sort({ dueDate: 1 });

    if (tasks.length === 0) {
        return res.status(200).json({ message: 'No pending tasks found.' });
    }

    const emailResult = await emailService.sendTaskReminderEmail(req.user, tasks);

    if (emailResult) {
        res.status(200).json({
            message: `Reminder sent for ${tasks.length} tasks.`,
            preview: emailResult.messageId // Log ID for debug
        });
    } else {
        res.status(500);
        throw new Error('Failed to send email.');
    }
});

// @desc    Trigger invoice reminders for all unpaid invoices
// @route   POST /api/reminders/invoices
// @access  Private
const sendInvoiceReminders = asyncHandler(async (req, res) => {
    // Find all unpaid invoices
    // Populate client to get email
    const invoices = await Invoice.find({ status: { $ne: 'paid' } }).populate('client');

    let sentCount = 0;

    // In a real app, you might want to batch this or use a queue
    for (const invoice of invoices) {
        if (invoice.client && invoice.client.email) {
            await emailService.sendInvoiceReminderEmail(invoice.client, invoice);
            sentCount++;
        }
    }

    res.status(200).json({
        message: `Reminders sent for ${sentCount} unpaid invoices.`,
        totalUnpaid: invoices.length
    });
});

module.exports = {
    sendTaskReminders,
    sendInvoiceReminders
};
