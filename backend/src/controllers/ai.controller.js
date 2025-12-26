const Invoice = require('../models/Invoice.model');
const Client = require('../models/Client.model');
const Expense = require('../models/Expense.model');
const Product = require('../models/Product.model');

// @desc    Process AI Chat Query
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
        return res.status(400).json({ message: 'Please provide a message' });
    }

    const lowerMsg = message.toLowerCase();

    try {
        let responseText = "I'm not sure I understand that. Try asking about 'revenue', 'clients', 'expenses', or 'pending invoices'.";

        // --- REVENUE ---
        if (lowerMsg.includes('revenue') || lowerMsg.includes('income') || lowerMsg.includes('earned')) {
            const invoices = await Invoice.find({ user: userId, status: { $ne: 'cancelled' } }); // Include unpaid/paid for total potential or strictly paid? Let's go with Paid + Unpaid as general "Sales" or maybe strictly Paid for "Revenue". Let's stick to "paid" for strict revenue.

            // Actually, let's do strictly PAID for Revenue
            const paidInvoices = invoices.filter(inv => inv.status === 'paid');
            const totalRevenue = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0);

            responseText = `Your total revenue from paid invoices is $${totalRevenue.toFixed(2)}.`;

            // --- EXPENSES ---
        } else if (lowerMsg.includes('expense') || lowerMsg.includes('spending') || lowerMsg.includes('cost')) {
            const expenses = await Expense.find({ user: userId });
            const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

            responseText = `Your total recorded expenses amount to $${totalExpenses.toFixed(2)}.`;

            // --- PROFIT ---
        } else if (lowerMsg.includes('profit') || lowerMsg.includes('net')) {
            const invoices = await Invoice.find({ user: userId, status: 'paid' });
            const totalRevenue = invoices.reduce((acc, curr) => acc + curr.amount, 0);

            const expenses = await Expense.find({ user: userId });
            const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

            const profit = totalRevenue - totalExpenses;
            responseText = `Your estimated net profit is $${profit.toFixed(2)} (Revenue: $${totalRevenue} - Expenses: $${totalExpenses}).`;

            // --- CLIENTS ---
        } else if (lowerMsg.includes('client') || lowerMsg.includes('customer')) {
            const clientCount = await Client.countDocuments({ user: userId });

            // Maybe get latest client
            const latestClient = await Client.findOne({ user: userId }).sort({ createdAt: -1 });

            responseText = `You have ${clientCount} active clients.${latestClient ? ` The most recent addition is ${latestClient.name}.` : ''}`;

            // --- PENDING / UNPAID ---
        } else if (lowerMsg.includes('pending') || lowerMsg.includes('unpaid') || lowerMsg.includes('due')) {
            const unpaidInvoices = await Invoice.find({ user: userId, status: 'unpaid' });
            const totalUnpaid = unpaidInvoices.reduce((acc, curr) => acc + curr.amount, 0);
            const count = unpaidInvoices.length;

            responseText = `You have ${count} unpaid invoices totaling $${totalUnpaid.toFixed(2)}.`;

            // --- PRODUCTS / INVENTORY ---
        } else if (lowerMsg.includes('product') || lowerMsg.includes('stock') || lowerMsg.includes('inventory')) {
            const lowStockProducts = await Product.find({
                user: userId,
                $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
            });

            if (lowStockProducts.length > 0) {
                const names = lowStockProducts.map(p => p.name).join(', ');
                responseText = `Warning: You have ${lowStockProducts.length} items low on stock: ${names}.`;
            } else {
                responseText = "Your inventory looks good. No items are currently low on stock.";
            }
        }

        res.status(200).json({ response: responseText });

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ message: 'Error processing your request' });
    }
};

module.exports = {
    chatWithAI,
};
