const express = require('express');
const router = express.Router();
const { sendTaskReminders, sendInvoiceReminders } = require('../controllers/reminder.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/tasks', protect, sendTaskReminders);
// In a real app, invoice reminders might be an admin-only route or run by cron only
// For this demo, any authenticated user can trigger the batch process
router.post('/invoices', protect, sendInvoiceReminders);

module.exports = router;
