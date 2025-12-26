const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
        },
        title: {
            type: String,
            required: [true, 'Please add a task title'],
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending',
        },
        dueDate: {
            type: Date,
        },
        comments: [
            {
                text: String,
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                userName: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Task', taskSchema);
