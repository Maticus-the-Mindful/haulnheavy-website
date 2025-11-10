# Twilio SMS Setup Instructions

The SMS functionality for sending estimates via text message has been prepared and is ready to activate once you complete the Twilio setup.

## What's Already Done

✅ SMS API endpoint created (`/api/send-estimate-sms`)
✅ "Send Estimate by Text" button added to the results page
✅ SMS formatting optimized for text messages
✅ Error handling and validation implemented

## What You Need to Do

### Step 1: Create a Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free trial account (credit card required but not charged immediately)
3. Verify your email and phone number

### Step 2: Get Your Credentials
Once logged in to the Twilio Console (https://console.twilio.com/):

1. **Account SID**: Found on your dashboard homepage
2. **Auth Token**: Click "Show" next to Auth Token on your dashboard
3. **Phone Number**:
   - Click "Get a Trial Number" or go to Phone Numbers → Manage → Buy a number
   - Choose a US number (costs ~$1-2/month)
   - Complete the purchase

### Step 3: Install Twilio SDK
Run this command in your project directory:
```bash
npm install twilio
```

### Step 4: Add Environment Variables
1. Copy the `.env.example` file to create `.env.local`
2. Add your Twilio credentials:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
```

### Step 5: Deploy
After adding the credentials:
1. Commit the changes (do NOT commit the .env.local file!)
2. Add the environment variables to Vercel:
   - Go to your Vercel project settings
   - Navigate to Environment Variables
   - Add each variable (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
3. Redeploy your application

## Testing
Once configured, test by:
1. Complete an estimate in the app
2. On the results page, click "Send Estimate by Text"
3. Check the phone number for the text message

## Pricing
- **Twilio phone number**: ~$1-2/month
- **Per SMS sent**: ~$0.0075-$0.01 per message (US)
- **Example**: 100 estimates/month = ~$2-3 total cost

## SMS Message Format
Customers will receive a concise text like:
```
Haul'n Heavy Estimate: $2,500
Item: Cat D6 Dozer
Route: Austin, TX → Dallas, TX
*Additional fees may apply
Questions? Call 701-870-2144
```

## Support
If you encounter any issues during setup, you can:
- Check Twilio's documentation: https://www.twilio.com/docs/sms
- Contact Twilio support through their console
- Reach out to your developer for assistance

## Security Notes
- Keep your Auth Token secure and never commit it to version control
- Add `.env.local` to your `.gitignore` file (already done)
- Use environment variables in Vercel for production deployment
