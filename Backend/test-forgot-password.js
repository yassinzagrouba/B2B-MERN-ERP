// test-forgot-password.js
const axios = require('axios');
require('dotenv').config();

async function testForgotPassword() {
  try {
    console.log('======================================');
    console.log('TESTING FORGOT PASSWORD FUNCTIONALITY');
    console.log('======================================');
    
    // Your email address
    const emailToTest = 'zagroubayassin189@gmail.com';
    
    console.log('API URL:', 'http://localhost:5000/api/auth/forgot-password');
    console.log('Test Email:', emailToTest);
    console.log('--------------------------------------');
    
    // First check if server is available
    console.log('Checking server availability...');
    
    try {
      await axios.get('http://localhost:5000');
      console.log('✅ Server is running\n');
    } catch (error) {
      console.error('❌ Server is not running or not accessible');
      console.error('Please start the server with: npm run dev');
      return;
    }
    
    console.log('Sending forgot password request...');
    
    // Send the forgot password request
    const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      email: emailToTest
    });
    
    console.log('✅ Request successful!');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    
    // Check for debug tokens in dev mode
    if (response.data.token) {
      console.log('\n🔑 Reset token (development only):', response.data.token);
      console.log('Reset URL would be:');
      console.log(`http://localhost:5173/reset-password/${response.data.token}`);
    }
    
    // Check for email preview URL (Ethereal)
    if (response.data.previewUrl) {
      console.log('\n📧 Email preview available at:');
      console.log(response.data.previewUrl);
    }
    
    // Check for email errors
    if (response.data.emailError) {
      console.log('\n⚠️ Email sending error reported:');
      console.log(response.data.emailError);
      console.log('\nPlease check:');
      console.log('1. Email configuration in .env file');
      console.log('2. Server logs for detailed error messages');
      console.log('3. Follow instructions in EMAIL_SETUP_GUIDE.md');
    }
    
  } catch (error) {
    console.error('\n❌ Error executing test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testForgotPassword();