# Email Setup Guide for FitTrack

This guide will help you set up email functionality for the FitTrack application using Gmail.

## Setting Up Gmail for Application Use

Gmail requires special setup to allow third-party applications to send emails through your account. Follow these steps:

### 1. Enable 2-Step Verification

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google," find "2-Step Verification" and click on it
4. Follow the steps to turn on 2-Step Verification

### 2. Generate an App Password

1. After enabling 2-Step Verification, go back to the Security page
2. Under "Signing in to Google," find "App passwords" and click on it
3. Select "Mail" as the app and "Other (Custom name)" as the device
4. Enter "FitTrack" as the name
5. Click "Generate"
6. Google will display a 16-character password. **Copy this password**

### 3. Update Your .env File

1. Open the `.env` file in the backend directory
2. Update the following values:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your-gmail-address@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   EMAIL_FROM=your-gmail-address@gmail.com
   ```

## Testing Email Functionality

After setting up your email credentials, you can test the email functionality:

1. Start the backend server:
   ```
   npm run dev
   ```

2. Use the login or registration feature in the app
3. Check your email for the verification code

## Troubleshooting

If emails are not being sent:

1. Check the server console for error messages
2. Verify that your app password is correct
3. Make sure your Gmail account doesn't have additional security restrictions
4. Check if your Gmail account has reached its sending limits

## Using Other Email Providers

### SendGrid (Free tier: 100 emails/day)

1. Create a SendGrid account: https://sendgrid.com/
2. Create an API Key in the SendGrid dashboard
3. Update your `.env` file:
   ```
   EMAIL_SERVICE=sendgrid
   EMAIL_USERNAME=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   EMAIL_FROM=your-verified-sender-email
   ```

### Mailgun (Free tier: 5,000 emails/month for 3 months)

1. Create a Mailgun account: https://www.mailgun.com/
2. Get your API key and domain from the dashboard
3. Update your `.env` file:
   ```
   EMAIL_SERVICE=mailgun
   EMAIL_USERNAME=api
   EMAIL_PASSWORD=your-mailgun-api-key
   EMAIL_FROM=your-verified-sender-email
   ```

## Security Considerations

- Never commit your `.env` file to version control
- Regularly rotate your app passwords or API keys
- Monitor your email sending activity for unusual patterns
- Consider implementing rate limiting for email verification requests
