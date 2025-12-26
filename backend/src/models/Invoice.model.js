const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Client',
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
        },
        dueDate: {
            type: Date,
            required: [true, 'Please add a due date'],
        },
        status: {
            type: String,
            enum: ['paid', 'unpaid'],
            default: 'unpaid',
        },
        // Simple items array for invoice details
        items: [
            {
                description: String,
                price: Number,
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product'
                }
            },
        ],
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

module.exports = mongoose.model('Invoice', invoiceSchema);
