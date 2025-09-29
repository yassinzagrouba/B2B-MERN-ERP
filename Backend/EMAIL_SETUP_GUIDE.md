# Gmail Authentication Setup for Password Reset

## The Problem
Your application is configured to send password reset emails using Gmail, but the emails aren't being sent. This is because Google blocks "less secure apps" from accessing Gmail accounts with regular passwords. Instead, you need to use an "App Password".

## Solution: Set up a Gmail App Password

1. **Enable 2-Step Verification on your Google Account**
   - Go to https://myaccount.google.com/security
   - Find "2-Step Verification" and enable it if not already enabled
   - Follow the prompts to set up 2-Step Verification

2. **Generate an App Password**
   - Go to https://myaccount.google.com/apppasswords
   - You might need to sign in again
   - Under "Select app", choose "Mail" (or "Other" and name it "B2B ERP App")
   - Under "Select device", choose your device type or "Other"
   - Click "Generate"
   - Google will display a 16-character app password (no spaces)
   - **Copy this password immediately** (it will only be shown once)

3. **Update Your .env File**
   - Open your `.env` file in the Backend folder
   - Replace the current EMAIL_PASSWORD value with the App Password you just generated
   - Make sure the EMAIL_USERNAME is your complete Gmail address

Example `.env` configuration:
```
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your.email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # Your 16-character App Password (no spaces)
```

4. **Restart Your Server**
   - Stop your server if it's running
   - Start it again with `npm start` or your usual command

5. **Test the Password Reset**
   - Try the "Forgot Password" feature again
   - You should now receive the password reset email

## Troubleshooting
- If you're still having issues, check if your antivirus or firewall is blocking the connection
- Make sure you're using the exact Gmail address associated with the App Password
- The App Password should be 16 characters with no spaces
- Try running the `test-email.js` script to diagnose specific issues

## Note for Production
For a production application, consider using a dedicated email service like:
- SendGrid
- Mailgun
- Amazon SES
These services provide better deliverability and monitoring for transactional emails.