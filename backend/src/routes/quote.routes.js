const express = require('express');
const router = express.Router();
const {
    getQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
    convertToInvoice,
} = require('../controllers/quote.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/').get(protect, getQuotes).post(protect, createQuote);
router.route('/:id').put(protect, updateQuote).delete(protect, deleteQuote);
router.route('/:id/convert').post(protect, convertToInvoice);

module.exports = router;
