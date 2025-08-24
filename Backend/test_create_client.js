// test_create_client.js - Test client creation API
require('dotenv').config();
const axios = require('axios');

const testCreateClient = async () => {
  try {
    console.log('🚀 Testing client creation API...\n');

    // First, let's get a token by logging in
    console.log('🔐 Step 1: Getting authentication token...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });

    console.log('📨 Login response:', JSON.stringify(loginResponse.data, null, 2));
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful, token received');
    console.log('🔑 Token preview:', token.substring(0, 50) + '...');

    // Now test creating a client IMMEDIATELY
    console.log('\n👤 Step 2: Creating test client...');
    
    const clientData = {
      name: 'Test Client',
      adresse: '123 Test Street',
      email: 'testclient@example.com',
      phone: '+1234567890',
      company: '68934ad8584a8be3ed7e1de4' // Using DataFlow Systems Premium ID
    };

    console.log('📤 Sending client data:', JSON.stringify(clientData, null, 2));

    const response = await axios.post('http://localhost:5000/api/clients', clientData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Client created successfully!');
    console.log('📨 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Request made but no response received');
      console.error('Request:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
};

testCreateClient();
