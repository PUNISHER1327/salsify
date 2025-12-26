const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
let token = '';
let userId = '';
let clientId = '';
let taskId = '';

const runTests = async () => {
    console.log('--- Starting Backend Verification ---');

    try {
        // 1. Register User
        console.log('\n1. Testing Registration...');
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
        });
        console.log('✅ Registration Successful:', regRes.data.email);
        token = regRes.data.token;
        userId = regRes.data._id;

        // 2. Login User
        console.log('\n2. Testing Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: regRes.data.email,
            password: 'password123',
        });
        console.log('✅ Login Successful. Token received.');
        token = loginRes.data.token; // Update token just in case

        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        // 3. Create Client
        console.log('\n3. Testing Create Client...');
        const clientRes = await axios.post(
            `${API_URL}/clients`,
            {
                name: 'Acme Corp',
                email: 'contact@acme.com',
                phone: '555-0199',
                address: '123 Acme Way',
            },
            config
        );
        console.log('✅ Client Created:', clientRes.data.name);
        clientId = clientRes.data._id;

        // 4. Create Task
        console.log('\n4. Testing Create Task...');
        const taskRes = await axios.post(
            `${API_URL}/tasks`,
            {
                title: 'Design Logo',
                description: 'Create a new logo for Acme Corp',
                dueDate: new Date(),
                client: clientId,
            },
            config
        );
        console.log('✅ Task Created:', taskRes.data.title);
        taskId = taskRes.data._id;

        // 5. Create Invoice
        console.log('\n5. Testing Create Invoice...');
        const invoiceRes = await axios.post(
            `${API_URL}/invoices`,
            {
                client: clientId,
                amount: 500,
                dueDate: new Date(),
                items: [{ description: 'Logo Design', price: 500 }],
            },
            config
        );
        console.log('✅ Invoice Created:', invoiceRes.data.amount);

        // 6. Get Dashboard Stats
        console.log('\n6. Testing Dashboard Stats...');
        const statsRes = await axios.get(`${API_URL}/dashboard/stats`, config);
        console.log('✅ Dashboard Stats:', statsRes.data);

        console.log('\n--- ALL TESTS PASSED ---');
    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
    }
};

// Wait for server to start (manual delay or just run this after starting server)
// For this script effectively, we assume server is running.
runTests();
