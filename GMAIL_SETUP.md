# Gmail Setup for UM AI Chat

## Admin Forgot Password Email Configuration

The admin forgot password feature sends reset codes via email. To enable this, configure Gmail SMTP:

### 1. Create Gmail App Password

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Generate an app password for "Mail"
5. Copy the 16-character password

### 2. Configure Environment Variables on Heroku

```bash
# Set email service to Gmail
heroku config:set EMAIL_SERVICE=gmail

# Set your Gmail credentials
heroku config:set GMAIL_USER=your-gmail@gmail.com
heroku config:set GMAIL_APP_PASSWORD=your-16-char-app-password

# Set from email (usually same as GMAIL_USER)
heroku config:set EMAIL_FROM=your-gmail@gmail.com

# Set admin email to receive reset codes
heroku config:set ADMIN_EMAIL=a.siojo.143903.tc@umindanao.edu.ph
```

### 3. Alternative: SendGrid (Recommended for Production)

```bash
heroku config:set EMAIL_SERVICE=sendgrid
heroku config:set SENDGRID_API_KEY=your-sendgrid-api-key
heroku config:set EMAIL_FROM=noreply@yourdomain.com
heroku config:set ADMIN_EMAIL=a.siojo.143903.tc@umindanao.edu.ph
```

## Testing

After configuration, test the admin forgot password:
1. Go to admin login page
2. Click "Forgot Password?"
3. Enter admin username
4. Check the specified admin email for reset code

## Troubleshooting

- **500 Error**: Email service not configured
- **Email not received**: Check Gmail spam folder
- **Authentication failed**: Verify app password is correct

## Security Notes

- App passwords are Gmail-specific and don't expose your main password
- Use a dedicated Gmail account for this service
- Regularly rotate app passwords
- Monitor email sending limits (Gmail has daily limits)