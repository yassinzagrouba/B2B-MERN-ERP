// test-reset-password.js
const axios = require('axios');
require('dotenv').config();

async function testResetPassword() {
  try {
    console.log('======================================');
    console.log('TESTING RESET PASSWORD FUNCTIONALITY');
    console.log('======================================');
    
    const API_URL = 'http://localhost:5000/api/auth';
    const TEST_EMAIL = 'zagroubayassin189@gmail.com';
    
    console.log('Step 1: Request a password reset token');
    console.log(`Email: ${TEST_EMAIL}`);
    
    // First, request a password reset token
    const forgotResponse = await axios.post(`${API_URL}/forgot-password`, {
      email: TEST_EMAIL
    });
    
    if (!forgotResponse.data.token) {
      console.error('❌ No token received in the response. Cannot continue test.');
      console.log('Response:', forgotResponse.data);
      return;
    }
    
    const resetToken = forgotResponse.data.token;
    console.log('✅ Reset token received:', resetToken);
    console.log(`Reset URL: http://localhost:5173/reset-password/${resetToken}`);
    
    // Create a new test password
    const newPassword = 'TestPassword123!';
    
    console.log('\nStep 2: Resetting password with token');
    console.log('Token:', resetToken);
    console.log('New Password:', newPassword);
    
    // Try to reset password with the token
    const resetResponse = await axios.post(`${API_URL}/reset-password`, {
      token: resetToken,
      password: newPassword
    });
    
    console.log('✅ Password reset successful!');
    console.log('Status:', resetResponse.status);
    console.log('Response:', resetResponse.data);
    
    console.log('\nStep 3: Testing login with new password');
    
    // Try to login with the new password
    try {
      const loginResponse = await axios.post(`${API_URL}/login`, {
        email: TEST_EMAIL,
        password: newPassword
      });
      
      console.log('✅ Login with new password successful!');
      console.log('Login Status:', loginResponse.status);
      console.log('User authenticated:', loginResponse.data.user?.name || 'Unknown');
    } catch (loginError) {
      console.error('❌ Login with new password failed:');
      console.error('Status:', loginError.response?.status);
      console.error('Message:', loginError.response?.data.message || loginError.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error executing test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testResetPassword();