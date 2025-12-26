const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/chat', protect, chatWithAI);

module.exports = router;
