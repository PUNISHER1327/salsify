
const ClientModel = require('../models/Client.model');
const TaskModel = require('../models/Task.model');
const InvoiceModel = require('../models/Invoice.model');
const ProductModel = require('../models/Product.model');

// @desc    Search across all resources
// @route   GET /api/search
// @access  Private
const search = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(200).json([]);
    }

    try {
        const regex = new RegExp(query, 'i');

        // Search Clients
        const clients = await ClientModel.find({
            user: req.user.id,
            $or: [{ name: regex }, { email: regex }]
        }).limit(5);

        // Search Tasks
        const tasks = await TaskModel.find({
            user: req.user.id,
            title: regex
        }).limit(5);

        // Search Products
        const products = await ProductModel.find({
            user: req.user.id,
            name: regex
        }).limit(5);

        // Search Invoices (search by client name or amount - tough for amount in regex)
        // Let's search invoices by ID or Client Name population? 
        // Searching by ID is common.
        // Also populated client match.

        // For simplicity, let's just search clients, tasks, products. Invoices are hard to search by text mostly.

        const results = [
            ...clients.map(c => ({ type: 'client', id: c._id, title: c.name, subtitle: c.email })),
            ...tasks.map(t => ({ type: 'task', id: t._id, title: t.title, subtitle: t.status })),
            ...products.map(p => ({ type: 'product', id: p._id, title: p.name, subtitle: `$${p.price}` }))
        ];

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { search };
