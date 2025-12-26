const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
            enum: ['Office', 'Software', 'Marketing', 'Personnel', 'Utilities', 'Other'],
        },
        date: {
            type: Date,
            default: Date.now,
        },
        isRecurring: {
            type: Boolean,
            default: false,
        },
        frequency: {
            type: String,
            enum: ['weekly', 'monthly', 'yearly'],
            default: 'monthly',
        },
        nextRunDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Expense', expenseSchema);
