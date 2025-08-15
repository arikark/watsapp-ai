# 🤖 WhatsApp AI Chatbot

A powerful WhatsApp chatbot powered by Cloudflare Workers AI, built with Hono framework. This application allows users to chat with an AI assistant directly through WhatsApp.

## 🚀 Features

- **AI-Powered Conversations**: Uses Cloudflare Workers AI with Llama 3.1-8B model
- **WhatsApp Integration**: Seamless integration with WhatsApp Business API
- **Conversation History**: Stores and retrieves chat history using D1 database
- **Real-time Responses**: Instant AI responses with typing indicators
- **Admin Dashboard**: Web interface for testing and monitoring conversations
- **Scalable Architecture**: Built on Cloudflare Workers for global performance

## 🛠️ Tech Stack

- **Framework**: [Hono](https://hono.dev/) - Fast web framework for Cloudflare Workers
- **AI Model**: [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) - Llama 3.1-8B
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLite database
- **WhatsApp API**: WhatsApp Business API for messaging
- **Language**: TypeScript

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **WhatsApp Business API**: Set up WhatsApp Business API access
3. **Node.js**: Version 18 or higher
4. **Wrangler CLI**: Cloudflare's command-line tool

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd watsapp-ai
npm install
```

### 2. Configure Environment Variables

Create a `.dev.vars` file in your project root:

```env
WHATSAPP_TOKEN=your_whatsapp_business_api_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token
```

### 3. Set up Cloudflare D1 Database

```bash
# Create D1 database
wrangler d1 create watsapp-ai

# Apply migrations
npm run seedLocalD1
```

### 4. Configure Wrangler

Update your `wrangler.json` with your database ID:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_id": "your-database-id",
      "database_name": "watsapp-ai"
    }
  ]
}
```

### 5. Deploy to Cloudflare Workers

```bash
npm run deploy
```

## 🔧 Configuration

### WhatsApp Business API Setup

1. **Create WhatsApp Business App**:
   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Create a new app or use existing one
   - Add WhatsApp Business API product

2. **Get Access Token**:
   - Navigate to WhatsApp > Getting Started
   - Generate a permanent access token
   - Add to your environment variables as `WHATSAPP_TOKEN`

3. **Get Phone Number ID**:
   - In WhatsApp > Configuration
   - Note your Phone Number ID
   - Add to environment variables as `WHATSAPP_PHONE_NUMBER_ID`

4. **Configure Webhook**:
   - Set webhook URL to: `https://your-worker.your-subdomain.workers.dev/webhook`
   - Set verify token (add to environment as `WHATSAPP_VERIFY_TOKEN`)
   - Subscribe to `messages` events

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `WHATSAPP_TOKEN` | WhatsApp Business API access token | Yes |
| `WHATSAPP_PHONE_NUMBER_ID` | Your WhatsApp phone number ID | Yes |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification token | Yes |

## 📱 Usage

### Webhook Endpoints

- **GET `/webhook`**: WhatsApp webhook verification
- **POST `/webhook`**: Receives WhatsApp messages

### API Endpoints

- **GET `/`**: Health check
- **GET `/admin`**: Admin dashboard
- **POST `/api/send`**: Send test message
- **POST `/api/send-template`**: Send template message
- **GET `/api/conversation/:phoneNumber`**: Get conversation history
- **GET `/api/stats/:phoneNumber`**: Get conversation statistics

### Admin Dashboard

Access the admin dashboard at `https://your-worker.your-subdomain.workers.dev/admin` to:

- Send test messages
- View conversation statistics
- Browse conversation history
- Monitor chatbot performance

## 🗄️ Database Schema

### chat_messages Table

```sql
CREATE TABLE chat_messages (
    id TEXT PRIMARY KEY,
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    is_from_user INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);
```

## 🔄 Message Flow

1. **User sends message** → WhatsApp Business API
2. **Webhook receives message** → `/webhook` endpoint
3. **Message saved to database** → D1 database
4. **AI generates response** → Cloudflare Workers AI
5. **Response sent back** → WhatsApp Business API
6. **Response saved to database** → D1 database

## 🧪 Testing

### Local Development

```bash
npm run dev
```

### Send Test Message

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "message": "Hello, AI!"
  }'
```

### Send Template Message

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/api/send-template \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "templateName": "hello_world",
    "languageCode": "en_US"
  }'
```

### Get Conversation History

```bash
curl https://your-worker.your-subdomain.workers.dev/api/conversation/+1234567890
```

## 🚀 Deployment

### Production Deployment

```bash
npm run deploy
```

### Environment Variables in Production

Set environment variables in Cloudflare Workers dashboard:

1. Go to Workers & Pages
2. Select your worker
3. Go to Settings > Variables
4. Add your environment variables

## 📊 Monitoring

### Logs

Monitor your application through Cloudflare Workers logs:

```bash
wrangler tail
```

### Metrics

Track performance and usage through:
- Cloudflare Workers analytics
- D1 database metrics
- WhatsApp Business API insights

## 🔒 Security

- **Webhook Verification**: All webhook requests are verified
- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Consider implementing rate limiting for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
2. Review [WhatsApp Business API docs](https://developers.facebook.com/docs/whatsapp)
3. Open an issue in this repository

## 🔮 Future Enhancements

- [ ] Support for media messages (images, documents)
- [ ] Multi-language support
- [ ] Conversation analytics dashboard
- [ ] Custom AI model fine-tuning
- [ ] Integration with external APIs
- [ ] Advanced conversation management
- [ ] User authentication and personalization

---

Built with ❤️ using Cloudflare Workers, Hono, and Cloudflare Workers AI
