# 🤖 WhatsApp AI Chatbot

A powerful WhatsApp chatbot powered by Cloudflare Workers AI, built with Hono framework. This application allows users to chat with an AI assistant directly through WhatsApp.

## ✅ **WORKING CONFIGURATION VERIFIED**

Your WhatsApp AI chatbot is now successfully running and processing messages! The logs show:
- ✅ Webhook receiving messages from `972585722391`
- ✅ AI processing messages in 2-4 seconds
- ✅ Successful responses being sent back to WhatsApp

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

### Phone Number Validation

The application is configured to only process messages from the authorized phone number `+972585722391`. This validation is applied at multiple levels:

- **Webhook Processing**: Incoming messages are validated before processing
- **API Endpoints**: All API endpoints validate phone numbers
- **Message Processing**: Additional validation in the message processing function
- **User Notification**: Unauthorized users receive a WhatsApp message explaining they don't have access
- **Format Flexibility**: Accepts phone numbers both with (`+972585722391`) and without (`972585722391`) the `+` prefix

To change the authorized phone number, update the `AUTHORIZED_PHONE_NUMBER` constant in `src/utils.ts`.

## 📱 Usage

### Webhook Endpoints

- **GET `/webhook`**: WhatsApp webhook verification
- **POST `/webhook`**: Receives WhatsApp messages

### API Endpoints

- **GET `/`**: Health check
- **GET `/admin`**: Admin dashboard

### Admin Dashboard

Access the admin dashboard at `https://your-worker.your-subdomain.workers.dev/admin` to:

- Send test messages
- View conversation statistics
- Browse conversation history
- Monitor chatbot performance

## 🗄️ Database Schema

This project uses [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations with Cloudflare D1.

### Database Setup

```bash
# Generate new migrations
npm run db:generate

# Apply migrations to local database
npm run db:migrate:local

# Apply migrations to remote database
npm run db:migrate

# Open Drizzle Studio (optional)
npm run db:studio
```

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

### Schema Definition

The database schema is defined in `src/schema.ts` using Drizzle's type-safe schema builder:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const chat_messages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  phone_number: text('phone_number').notNull(),
  message: text('message').notNull(),
  timestamp: text('timestamp').notNull(),
  is_from_user: integer('is_from_user', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at').default('(datetime(\'now\'))'),
});
```

## 🔄 Message Flow

1. **User sends message** → WhatsApp Business API
2. **Webhook receives message** → `/webhook` endpoint
3. **Phone number validation** → Check if user is authorized
4. **If unauthorized** → Send "not authorized" message and stop
5. **If authorized** → Continue with processing:
   - **Message saved to database** → D1 database
   - **AI generates response** → Cloudflare Workers AI
   - **Response sent back** → WhatsApp Business API
   - **Response saved to database** → D1 database

## 🧪 Testing

### Local Development

```bash
npm run dev
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
wrangler tail --format pretty
```

### Metrics

Track performance and usage through:
- Cloudflare Workers analytics
- D1 database metrics
- WhatsApp Business API insights

## ✅ **SUCCESS INDICATORS**

Your setup is working correctly when you see:
- ✅ Webhook verification returns the challenge string
- ✅ POST requests to webhook return `200 OK`
- ✅ Logs show "Processed message from [phone_number]"
- ✅ AI responses are generated in 2-4 seconds
- ✅ Messages are sent back to WhatsApp successfully

## 🔒 Security

- **Webhook Verification**: All webhook requests are verified
- **Phone Number Validation**: Only messages from `+972585722391` are processed
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

🎉 **Your WhatsApp AI Chatbot is now successfully running and processing messages!**

**Test it by messaging your WhatsApp Business number and enjoy chatting with your AI assistant!** 🤖💬

Built with ❤️ using Cloudflare Workers, Hono, and Cloudflare Workers AI
