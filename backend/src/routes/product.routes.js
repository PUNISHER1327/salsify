const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
    .get(protect, getProducts)
    .post(protect, createProduct);

router.route('/:id')
    .get(protect, getProductById)
    .put(protect, updateProduct)
    .delete(protect, deleteProduct);

module.exports = router;
