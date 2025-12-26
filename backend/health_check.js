const axios = require('axios');

async function checkHealth() {
    try {
        console.log('Checking Backend Health...');
        const response = await axios.get('http://localhost:5001/api/users/profile');
        // This endpoint might need auth, so expected 401 is actually GOOD (means server is running)
        // A connection refused or timeout is BAD.
        console.log('Response Status:', response.status);
    } catch (error) {
        if (error.response) {
            console.log('Server Responded:', error.response.status, error.response.statusText);
            console.log('This means Backend IS running (which is good).');
        } else {
            console.error('Network Error - Backend might be DOWN:', error.message);
        }
    }
}

checkHealth();
