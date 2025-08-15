# 📱 WhatsApp AI Chatbot Setup Guide

This guide provides step-by-step instructions for setting up your WhatsApp AI Chatbot with the correct API endpoints and configuration.

## ✅ **WORKING CONFIGURATION VERIFIED**

Your WhatsApp AI chatbot is now successfully running and processing messages! The logs show:
- ✅ Webhook receiving messages from `972585722391`
- ✅ AI processing messages in 2-4 seconds
- ✅ Successful responses being sent back to WhatsApp

## 🔧 WhatsApp Business API Configuration

### 1. Meta for Developers Setup

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the **WhatsApp Business API** product to your app
4. Navigate to **WhatsApp > Getting Started**

### 2. Webhook Configuration

In the **Configuration** page, set up your webhook:

- **Callback URL**: `https://your-worker-name.your-username.workers.dev/webhook`
- **Verify token**: Create a secure token (e.g., `my_secure_verify_token_123`)
- **Client Certificate**: Leave off for now

Click **"Verify and save"** to complete webhook setup.

### 3. Get Your Credentials

#### Permanent Token
1. In **WhatsApp > Getting Started**
2. Click **"Generate token"**
3. Copy the permanent access token
4. Add to your environment variables as `WHATSAPP_TOKEN`

#### Phone Number ID
1. Go to **WhatsApp > Configuration > Phone numbers**
2. Note your **Phone Number ID** (e.g., `711056175433210`)
3. Add to your environment variables as `WHATSAPP_PHONE_NUMBER_ID`

## 🚀 Testing Your Setup

### 1. Test Webhook Verification

```bash
curl -i "https://your-worker-name.your-username.workers.dev/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test_challenge"
```

Expected response: `test_challenge`

### 2. Send a Template Message

Using your exact curl example:

```bash
curl -i -X POST \
  https://graph.facebook.com/v22.0/711056175433210/messages \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "messaging_product": "whatsapp",
    "to": "972585722391",
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": {
        "code": "en_US"
      }
    }
  }'
```

### 3. Send a Text Message

```bash
curl -i -X POST \
  https://graph.facebook.com/v22.0/711056175433210/messages \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "messaging_product": "whatsapp",
    "to": "972585722391",
    "type": "text",
    "text": {
      "body": "Hello from your AI chatbot!"
    }
  }'
```

## 🔄 Webhook Message Format

When a user sends a message to your WhatsApp number, you'll receive a webhook with this structure:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "+1234567890",
              "phone_number_id": "711056175433210"
            },
            "contacts": [
              {
                "profile": {
                  "name": "John Doe"
                },
                "wa_id": "972585722391"
              }
            ],
            "messages": [
              {
                "from": "972585722391",
                "id": "wamid.123456789",
                "timestamp": "1234567890",
                "text": {
                  "body": "Hello, AI!"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

## 🧪 Testing with Your Application

### 1. Test via Admin Dashboard

1. Deploy your application: `npm run deploy`
2. Visit: `https://your-worker-name.your-username.workers.dev/admin`
3. Use the dashboard to send test messages

### 2. Test via API Endpoints

#### Send Text Message
```bash
curl -X POST https://your-worker-name.your-username.workers.dev/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "972585722391",
    "message": "Hello from the AI chatbot!"
  }'
```

#### Send Template Message
```bash
curl -X POST https://your-worker-name.your-username.workers.dev/api/send-template \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "972585722391",
    "templateName": "hello_world",
    "languageCode": "en_US"
  }'
```

#### Get Conversation History
```bash
curl https://your-worker-name.your-username.workers.dev/api/conversation/972585722391
```

#### Get Statistics
```bash
curl https://your-worker-name.your-username.workers.dev/api/stats/972585722391
```

## 🔧 Environment Variables

Create a `.dev.vars` file for local development:

```env
WHATSAPP_TOKEN=YOUR_ACCESS_TOKEN_HERE
WHATSAPP_PHONE_NUMBER_ID=711056175433210
WHATSAPP_VERIFY_TOKEN=your_secure_verify_token_123
```

For production, set these in Cloudflare Workers dashboard.

## 📱 WhatsApp Business API Endpoints

### Base URL
```
https://graph.facebook.com/v22.0/{phone-number-id}
```

### Send Message
```
POST /messages
```

### Message Types

#### Text Message
```json
{
  "messaging_product": "whatsapp",
  "to": "972585722391",
  "type": "text",
  "text": {
    "body": "Your message here"
  }
}
```

#### Template Message
```json
{
  "messaging_product": "whatsapp",
  "to": "972585722391",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": {
      "code": "en_US"
    }
  }
}
```

#### Mark as Read
```json
{
  "messaging_product": "whatsapp",
  "status": "read",
  "message_id": "wamid.123456789"
}
```

## 🤖 Cloudflare Workers AI Integration

This application uses Cloudflare Workers AI directly for AI responses:

### AI Model Configuration
- **Model**: `@cf/meta/llama-3.1-8b-instruct`
- **Max Tokens**: 500
- **Temperature**: 0.7
- **Streaming**: Supported for real-time responses

### AI Response Flow
1. User message received via webhook
2. Message processed by Cloudflare Workers AI
3. AI generates contextual response
4. Response sent back to WhatsApp
5. Conversation history stored in D1 database

## 🚨 Common Issues & Solutions

### 1. Webhook Verification Fails
- Ensure your verify token matches exactly
- Check that your webhook URL is publicly accessible
- Verify HTTPS is enabled

### 2. Message Sending Fails
- Check your access token is valid
- Ensure phone number ID is correct
- Verify the recipient phone number format (remove + if present)

### 3. Webhook Not Receiving Messages
- Confirm webhook is verified and saved
- Check that you're subscribed to `messages` events
- Ensure your webhook endpoint returns `200 OK`

### 4. Template Messages Not Working
- Templates must be pre-approved by Meta
- Use only approved template names
- Check language code is supported

### 5. AI Responses Not Working
- Verify Cloudflare Workers AI is enabled in your account
- Check that the AI binding is properly configured in wrangler.json
- Ensure you have sufficient AI credits

### 6. Recipient Phone Number Not in Allowed List
- **Error**: `(#131030) Recipient phone number not in allowed list`
- **Solution**: Add the recipient phone number to your allowed list in Meta dashboard
- **For testing**: Use the test number provided by Meta

## 📊 Monitoring & Debugging

### Check Logs
```bash
wrangler tail --format pretty
```

### Test Webhook Locally
Use ngrok to test webhooks locally:
```bash
ngrok http 8787
```

### Verify API Response
All successful API calls return:
```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "972585722391",
      "wa_id": "972585722391"
    }
  ],
  "messages": [
    {
      "id": "wamid.123456789"
    }
  ]
}
```

## ✅ **SUCCESS INDICATORS**

Your setup is working correctly when you see:
- ✅ Webhook verification returns the challenge string
- ✅ POST requests to webhook return `200 OK`
- ✅ Logs show "Processed message from [phone_number]"
- ✅ AI responses are generated in 2-4 seconds
- ✅ Messages are sent back to WhatsApp successfully

## 🔒 Security Best Practices

1. **Keep tokens secure**: Never commit tokens to version control
2. **Use environment variables**: Store sensitive data in environment variables
3. **Validate webhooks**: Always verify webhook signatures
4. **Rate limiting**: Consider implementing rate limiting for production use
5. **Error handling**: Properly handle and log errors

## 📞 Support

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Meta for Developers Support](https://developers.facebook.com/support/)

---

🎉 **Your WhatsApp AI Chatbot is now successfully running and processing messages!**

**Test it by messaging your WhatsApp Business number and enjoy chatting with your AI assistant!** 🤖💬
