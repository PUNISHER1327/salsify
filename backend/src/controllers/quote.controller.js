const Quote = require('../models/Quote.model');
const Invoice = require('../models/Invoice.model');

// @desc    Get quotes
// @route   GET /api/quotes
// @access  Private
const getQuotes = async (req, res) => {
    const quotes = await Quote.find({ user: req.user.id }).populate('client', 'name email');
    res.status(200).json(quotes);
};

// @desc    Create quote
// @route   POST /api/quotes
// @access  Private
const createQuote = async (req, res) => {
    if (!req.body.amount || !req.body.client || !req.body.validUntil) {
        return res.status(400).json({ message: 'Please add required fields' });
    }

    const quote = await Quote.create({
        user: req.user.id,
        client: req.body.client,
        amount: req.body.amount,
        validUntil: req.body.validUntil,
        status: 'pending',
        items: req.body.items,
    });

    res.status(200).json(quote);
};

// @desc    Convert Quote to Invoice
// @route   POST /api/quotes/:id/convert
// @access  Private
const convertToInvoice = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);

        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        if (quote.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Create Invoice
        const invoice = await Invoice.create({
            user: req.user.id,
            client: quote.client,
            amount: quote.amount,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
            status: 'unpaid',
            items: quote.items,
        });

        // Update Quote status
        quote.status = 'accepted';
        await quote.save();

        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update quote
// @route   PUT /api/quotes/:id
// @access  Private
const updateQuote = async (req, res) => {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
        return res.status(404).json({ message: 'Quote not found' });
    }

    if (quote.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedQuote = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedQuote);
};

// @desc    Delete quote
// @route   DELETE /api/quotes/:id
// @access  Private
const deleteQuote = async (req, res) => {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
        return res.status(404).json({ message: 'Quote not found' });
    }

    if (quote.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    await quote.deleteOne();
    res.status(200).json({ id: req.params.id });
};

module.exports = {
    getQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
    convertToInvoice,
};
