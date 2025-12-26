const mongoose = require('mongoose');

const quoteSchema = mongoose.Schema(
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
        validUntil: {
            type: Date,
            required: [true, 'Please add a validity date'],
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Quote', quoteSchema);
