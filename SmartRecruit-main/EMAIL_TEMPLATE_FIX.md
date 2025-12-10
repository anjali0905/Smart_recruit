# How to Fix Email Template to Send Custom Messages

## Problem
The email is sending a stored/hardcoded message instead of what you type in the dashboard.

## Solution
You need to update your EmailJS template to use the `{{message}}` variable instead of hardcoded text.

## Steps to Fix:

### 1. Go to EmailJS Dashboard
- Visit: https://dashboard.emailjs.com/
- Log in to your account

### 2. Find Your Template
- Go to **Email Templates** in the left sidebar
- Find template ID: `template_beb6b3i`
- Click on it to edit

### 3. Update the Template Body
Replace any hardcoded message text with `{{message}}`

**Before (WRONG - has hardcoded text):**
```
Subject: Message from Recruiter

Hello,

This is a standard message that will always be sent.

Best regards,
Recruiter
```

**After (CORRECT - uses variable):**
```
Subject: {{subject}}

Hello,

{{message}}

Best regards,
{{from_name}}
```

### 4. Save the Template
- Click **Save** button
- The template is now ready to use your typed messages

### 5. Test
- Go back to your dashboard
- Click the email icon for a candidate
- Type a custom message
- Send it
- Check the received email - it should now contain your typed message

## Alternative: Create a New Template

If you want to keep the old template and create a new one for custom messages:

1. In EmailJS dashboard, click **Create New Template**
2. Name it: "Custom Recruiter Message"
3. Set up the template body:
   ```
   Subject: {{subject}}
   
   Hello,
   
   {{message}}
   
   Best regards,
   {{from_name}}
   ```
4. Copy the new template ID
5. Update the code in `Dashboard.jsx` line 351:
   ```javascript
   const templateID = "your_new_template_id";
   ```

## Template Variables Available:
- `{{message}}` - The message you type (REQUIRED)
- `{{subject}}` - Email subject
- `{{from_name}}` - Sender name
- `{{to_email}}` - Recipient email

## Still Not Working?

1. Check browser console (F12) for error messages
2. Verify the template ID matches: `template_beb6b3i`
3. Make sure you saved the template changes
4. Try sending a test email and check the console logs

