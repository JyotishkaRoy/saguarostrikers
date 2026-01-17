# Gmail Email Setup Guide

## Why Emails Aren't Working

The email functionality requires Gmail credentials to be configured in the backend `.env` file. Currently, the email service is disabled because these credentials are missing.

## Step-by-Step Setup

### 1. Enable 2-Step Verification on Your Gmail Account

1. Go to https://myaccount.google.com/security
2. Click on **"2-Step Verification"**
3. Follow the steps to enable it (required for App Passwords)

### 2. Generate a Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Sign in if prompted
3. Under "Select app", choose **"Mail"**
4. Under "Select device", choose **"Other (Custom name)"**
5. Type: **"Saguaro Strikers"**
6. Click **"Generate"**
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### 3. Update the Backend .env File

Open the file: `backend/.env`

Replace these lines with your actual credentials:

```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=Saguaro Strikers <your-actual-email@gmail.com>
```

**Example:**
```env
EMAIL_USER=johndoe@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=Saguaro Strikers <johndoe@gmail.com>
```

**⚠️ Important Notes:**
- Use the **16-character App Password**, NOT your regular Gmail password
- Remove any spaces from the App Password
- The email must be a Gmail account

### 4. Restart the Backend Server

```bash
# Stop the backend (kill the process)
lsof -ti:5001 | xargs kill -9

# Navigate to backend folder
cd backend

# Restart the server
npm run dev
```

You should see in the console:
```
Email service initialized successfully
```

### 5. Test Email Functionality

1. Go to: http://localhost:3000/admin/contact-messages
2. Click the **Send** button (📤) on a message
3. Type a response and click "Send Email Response"
4. Check the recipient's inbox (and spam folder)

## Troubleshooting

### "Email service is not configured"
- Make sure the `.env` file exists in the `backend/` folder
- Check that `EMAIL_USER` and `EMAIL_PASSWORD` are set
- Restart the backend server

### "Invalid login"
- Make sure you're using the **App Password**, not your regular password
- Make sure 2-Step Verification is enabled
- Try generating a new App Password

### "Less secure app access"
- Gmail no longer supports "less secure apps"
- You MUST use an App Password (see Step 2 above)

### Emails not arriving
- Check the spam/junk folder
- Verify the recipient email address is correct
- Check backend console for error messages

## What Happens When Email is Configured

✅ **Contact Form Responses**: Admins can reply to contact messages via email
✅ **Join Mission Emails**: Students and parents receive confirmation emails
✅ **Application Status**: Automated emails for approved/rejected applications
✅ **Team Notifications**: Admins can send emails to teams

## Security Notes

⚠️ **Never commit the `.env` file to Git!**
- The `.env` file is already in `.gitignore`
- App Passwords should be kept secret
- Each developer should have their own `.env` file

## Alternative: Using a Different Email Provider

If you prefer not to use Gmail, you can use other providers:

**Outlook/Hotmail:**
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

**Other SMTP Servers:**
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
```

## Support

If you continue to have issues:
1. Check the backend console for detailed error messages
2. Verify your Gmail settings
3. Try generating a new App Password
4. Test with a simple test message first
