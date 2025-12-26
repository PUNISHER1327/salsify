const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
// Allow both local and potential production domains
app.use(cors({
    origin: '*', // For development/demonstration ease. In production, restrict to specific domains.
    credentials: true
}));
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/clients', require('./routes/client.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/expenses', require('./routes/expense.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/quotes', require('./routes/quote.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/reminders', require('./routes/reminder.routes'));

// Default Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

module.exports = app;
