const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

const run = async () => {
    try {
        // 1. Login to get token
        console.log('Attempting login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@example.com', // Use a known test user or create one if needed. 
            // Wait, I don't know a valid user. I should probably register one first to be safe.
            password: 'password123'
        });

        // If login fails, try register
    } catch (error) {
        if (error.response && error.response.status === 401 || error.response.status === 404) {
            console.log('Login failed, attempting registration...');
            try {
                const regRes = await axios.post(`${API_URL}/auth/register`, {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });
                console.log('Registration successful, token received.');
                return testCreateClient(regRes.data.token);
            } catch (regError) {
                console.error('Registration failed:', regError.response ? regError.response.data : regError.message);
                return;
            }
        }
        console.error('Login error:', error.response ? error.response.data : error.message);
        return;
    }

    // If login worked (which implies I need the response data from the first try block, but I structured it safely to fall through? No, the catch block handles the register fallback.
    // Let's rewrite for clarity.
};

const main = async () => {
    let token;

    // 1. Try Login
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'debug_user@test.com',
            password: 'password123'
        });
        token = res.data.token;
        console.log('Login successful.');
    } catch (e) {
        // 2. If Login fails, Register
        console.log('Login failed, registering new user...');
        try {
            const res = await axios.post(`${API_URL}/auth/register`, {
                name: 'Debug User',
                email: 'debug_user@test.com',
                password: 'password123'
            });
            token = res.data.token;
            console.log('Registration successful.');
        } catch (regError) {
            console.error('Registration failed:', regError.message);
            if (regError.response) {
                console.error('Status:', regError.response.status);
                console.error('Data:', JSON.stringify(regError.response.data, null, 2));
            }
            return;
        }
    }

    // 3. Create Client
    console.log('Attempting to create client...');
    try {
        const clientRes = await axios.post(
            `${API_URL}/clients`,
            {
                name: 'Debug Client',
                email: 'client@debug.com',
                phone: '1234567890',
                address: '123 Debug Lane'
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        console.log('SUCCESS: Client created:', clientRes.data);
    } catch (error) {
        console.error('FAILURE: Could not create client.');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
    }
};

main();
