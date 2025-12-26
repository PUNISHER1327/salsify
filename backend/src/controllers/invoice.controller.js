const Invoice = require('../models/Invoice.model');
const Product = require('../models/Product.model');

// @desc    Get invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
    const invoices = await Invoice.find({ user: req.user.id }).populate('client', 'name email');
    res.status(200).json(invoices);
};

// @desc    Create invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res) => {
    if (!req.body.amount || !req.body.client || !req.body.dueDate) {
        return res.status(400).json({ message: 'Please add required fields' });
    }

    // Check stock for all items
    if (req.body.items && req.body.items.length > 0) {
        for (const item of req.body.items) {
            if (item.product) {
                const product = await Product.findById(item.product);
                if (product) {
                    if (product.stockQuantity < 1) { // Assuming 1 unit per item line for simplicity? Or should we check quantity? 
                        // The items array has { product, price, description }. It DOES NOT have quantity.
                        // Assuming 1 quantity per line item effectively.
                        return res.status(400).json({ message: `Product ${product.name} is out of stock` });
                    }
                }
            }
        }
    }

    console.log('Creating Invoice Body:', req.body);
    const invoice = await Invoice.create({
        user: req.user.id,
        client: req.body.client,
        amount: req.body.amount,
        dueDate: req.body.dueDate,
        status: req.body.status,
        items: req.body.items,
        isRecurring: req.body.isRecurring,
        frequency: req.body.frequency,
        nextRunDate: req.body.isRecurring ? req.body.dueDate : null,
    });

    // Decrement stock
    if (req.body.items && req.body.items.length > 0) {
        for (const item of req.body.items) {
            if (item.product) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stockQuantity -= 1;
                    await product.save();
                }
            }
        }
    }

    if (invoice.isRecurring) {
        const nextDate = new Date(invoice.dueDate);
        if (invoice.frequency === 'weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
        } else if (invoice.frequency === 'yearly') {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
        } else {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }
        invoice.nextRunDate = nextDate;
        await invoice.save();
    }

    res.status(200).json(invoice);
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check for user
    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the invoice user
    if (invoice.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
        }
    );

    res.status(200).json(updatedInvoice);
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check for user
    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the invoice user
    if (invoice.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    await invoice.deleteOne();

    res.status(200).json({ id: req.params.id });
};

module.exports = {
    getInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
};
