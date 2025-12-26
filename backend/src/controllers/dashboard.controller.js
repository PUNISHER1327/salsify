const Client = require('../models/Client.model');
const Task = require('../models/Task.model');
const Invoice = require('../models/Invoice.model');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Total Clients
        const totalClients = await Client.countDocuments({ user: userId });

        // 2. Pending Tasks
        const pendingTasks = await Task.countDocuments({ user: userId, status: 'pending' });
        const totalTasks = await Task.countDocuments({ user: userId });

        // 3. Completion Rate
        const completionRate = totalTasks === 0 ? 0 : Math.round(((totalTasks - pendingTasks) / totalTasks) * 100);

        // 4. Monthly Revenue (Paid invoices this month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const invoices = await Invoice.find({
            user: userId,
            status: 'paid',
            createdAt: { $gte: startOfMonth },
        });

        const monthlyRevenue = invoices.reduce((acc, curr) => acc + curr.amount, 0);

        // Latest Pending Tasks (for the dashboard list)
        const latestTasks = await Task.find({ user: userId, status: 'pending' })
            .sort({ dueDate: 1 })
            .limit(5)
            .populate('client', 'name');

        const statsData = {
            totalClients,
            pendingTasks,
            completionRate,
            monthlyRevenue,
            latestTasks
        };

        // Log to file for debugging
        const fs = require('fs');
        const path = require('path');
        const logEntry = `[${new Date().toISOString()}] User: ${userId}, Stats: ${JSON.stringify(statsData)}\n`;
        fs.appendFileSync(path.join(process.cwd(), 'debug_dashboard.log'), logEntry);

        res.status(200).json(statsData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
};
