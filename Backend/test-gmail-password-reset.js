// test-gmail-password-reset.js
require('dotenv').config();
const { sendEmail } = require('./config/nodemailer');

// Force use of real Gmail, regardless of environment
process.env.USE_REAL_EMAIL = 'true';

async function testGmailPasswordReset() {
  try {
    console.log('=== GMAIL PASSWORD RESET EMAIL TEST ===');
    console.log('Using email configuration:');
    console.log(`- Service: ${process.env.EMAIL_SERVICE || 'gmail'}`);
    console.log(`- Username: ${process.env.EMAIL_USERNAME}`);
    console.log(`- Password: ${process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set'}`);
    console.log(`- From: ${process.env.EMAIL_FROM || '"B2B ERP System" <noreply@b2berp.com>'}`);
    console.log(`- USE_REAL_EMAIL: ${process.env.USE_REAL_EMAIL}`);
    
    // Generate a test reset token
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    
    // Test recipient - change this to your email address
    const testEmail = 'zagroubayassin189@gmail.com';
    
    console.log(`\nSending test password reset email to: ${testEmail}`);
    
    // Create the same email content as in the auth.js route
    const mailOptions = {
      to: testEmail,
      subject: 'Password Reset Request - TEST',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        This link will expire in 1 hour.\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n
        TEST TOKEN: ${resetToken}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Request - TEST</h2>
          <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
          <p>Please click on the button below, or copy the link into your browser to complete the process:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </p>
          <p style="margin-top: 30px;"><strong>This link will expire in 1 hour.</strong></p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p><strong>TEST TOKEN:</strong> ${resetToken}</p>
        </div>
      `
    };

    // Send the test email
    const result = await sendEmail(mailOptions);
    
    if (result.success) {
      console.log('\n✅ SUCCESS! Password reset email sent successfully.');
      
      if (result.previewUrl) {
        console.log(`⚠️ WARNING: Email sent to Ethereal test account, not Gmail!`);
        console.log(`Ethereal Preview URL: ${result.previewUrl}`);
        console.log('This indicates your Gmail configuration is not being used.');
      } else {
        console.log('✅ Email successfully delivered to Gmail.');
        console.log(`Message ID: ${result.info?.messageId || 'Not available'}`);
      }
    } else {
      console.error('\n❌ ERROR: Failed to send password reset email.');
      console.error('Error details:', result.error);
      
      if (result.error?.code === 'EAUTH') {
        console.error('\n🔑 AUTHENTICATION PROBLEM:');
        console.error('1. Verify your EMAIL_PASSWORD in .env is an App Password (16 characters, no spaces)');
        console.error('2. Make sure 2-Step Verification is enabled on your Google account');
        console.error('3. Check that you created an App Password specifically for "Mail"');
      }
    }
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err);
  }
}

testGmailPasswordReset();