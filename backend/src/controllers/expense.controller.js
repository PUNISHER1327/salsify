const Expense = require('../models/Expense.model');

// @desc    Get expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
    try {
        if (!req.body.description || !req.body.amount || !req.body.category) {
            res.status(400);
            throw new Error('Please add all fields');
        }

        const expense = await Expense.create({
            user: req.user.id,
            description: req.body.description,
            amount: req.body.amount,
            category: req.body.category,
            date: req.body.date || Date.now(),
            isRecurring: req.body.isRecurring,
            frequency: req.body.frequency,
            nextRunDate: req.body.isRecurring ? (req.body.date || Date.now()) : null,
        });

        if (expense.isRecurring) {
            const nextDate = new Date(expense.date);
            if (expense.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
            else if (expense.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
            else nextDate.setMonth(nextDate.getMonth() + 1);

            expense.nextRunDate = nextDate;
            await expense.save();
        }

        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            res.status(404);
            throw new Error('Expense not found');
        }

        if (expense.user.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            res.status(404);
            throw new Error('Expense not found');
        }

        if (expense.user.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        await expense.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
};
