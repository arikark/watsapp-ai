import type { InferAPI } from 'better-auth';
import { createAuthClient } from 'better-auth/client';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { request } from 'http';
import { renderAdminDashboard } from './admin_dashboard';
import { auth } from './lib/better-auth';
import { AIService } from './services/ai_service';
import { DatabaseService } from './services/database_service';
import { isAuthorizedPhoneNumber } from './services/utils';
import { WhatsAppService } from './services/whatsapp_service';
import type { WhatsAppMessage } from './types';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Auth middleware for all API routes except webhook
app.on(['GET', 'POST'], '/api/**', async (c) => {
  // Skip auth for webhook endpoints
  // if (c.req.path === '/api/webhook') {
  //   return next();
  // }
  return auth(c.env).handler(c.req.raw);
});
// Health check endpoint
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'WhatsApp AI Chatbot is running',
    timestamp: new Date().toISOString(),
    version: 'v22.0',
  });
});

// Admin dashboard
app.get('/admin', (c) => {
  return new Response(renderAdminDashboard(), {
    headers: {
      'Content-Type': 'text/html',
    },
  });
});

// WhatsApp webhook verification
app.get('/api/webhook', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  const verifyToken = c.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully');
    return c.text(challenge || '');
  } else {
    console.log('Webhook verification failed');
    return c.text('Forbidden', 403);
  }
});

// WhatsApp webhook for receiving messages
app.post('/api/webhook', async (c) => {
  const authClient = auth(c.env);

  try {
    const body = (await c.req.json()) as WhatsAppMessage;

    // Verify this is a WhatsApp message
    if (body.object !== 'whatsapp_business_account') {
      return c.text('Not a WhatsApp message', 400);
    }

    // Process each entry
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          const value = change.value;

          // Process messages
          if (value.messages && value.messages.length > 0) {
            for (const message of value.messages) {
              if (message.type === 'text') {
                // Validate that the message is from the authorized phone number
                if (!isAuthorizedPhoneNumber(message.from)) {
                  console.log(
                    `Rejected message from unauthorized number: ${message.from}`
                  );

                  // Send a message to unauthorized users
                  await sendUnauthorizedMessage(
                    c.env,
                    message.from,
                    message.id
                  );
                  continue; // Skip processing this message
                }

                // @ts-ignore
                // const { data } = await authClient.api.sendPhoneNumberOTP({
                //   request: c.env,
                //   body: {
                //     phoneNumber: message.from,
                //   },
                // });

                const data = await authClient.api.signInMagicLink({
                  request: c.env,
                  body: {
                    email: `${message.from}@whatsapp-ai.com`, // required
                    name: message.from,
                    callbackURL: '/',
                    newUserCallbackURL: '/',
                    errorCallbackURL: '/',
                  },
                  // This endpoint requires session cookies.
                  headers: c.req.header(),
                });

                await processMessage(
                  c.env,
                  message.from,
                  message.text.body,
                  message.id
                );
              }
            }
          }
        }
      }
    }

    return c.text('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    return c.text('Internal Server Error', 500);
  }
});

// Function to send unauthorized message to users
async function sendUnauthorizedMessage(
  env: Env,
  from: string,
  messageId: string
) {
  try {
    const whatsappService = new WhatsAppService(env);

    // Mark the original message as read
    await whatsappService.markMessageAsRead(messageId);

    // Send unauthorized message
    const formattedPhone = whatsappService.formatPhoneNumber(from);
    await whatsappService.sendMessage(
      formattedPhone,
      'Sorry, but this WhatsApp number is not authorized to use this AI chatbot. Please contact the administrator for access.'
    );

    console.log(`Sent unauthorized message to ${from}`);
  } catch (error) {
    console.error('Error sending unauthorized message:', error);
  }
}

// Function to process incoming WhatsApp messages
async function processMessage(
  env: Env,
  from: string,
  message: string,
  messageId: string
) {
  // Additional validation to ensure only authorized phone number can send messages
  if (!isAuthorizedPhoneNumber(from)) {
    console.log(
      `Rejected message from unauthorized number in processMessage: ${from}`
    );
    return;
  }

  try {
    const aiService = new AIService(env);
    const whatsappService = new WhatsAppService(env);
    const dbService = new DatabaseService(env);

    // Save the user message
    await dbService.saveMessage(from, message, true);

    // Mark message as read
    await whatsappService.markMessageAsRead(messageId);

    // Send typing indicator
    await whatsappService.sendTypingIndicator(from, true);

    // Get conversation history for context
    const conversationHistory = await dbService.getConversationHistoryForAI(
      from,
      5
    );

    // Generate AI response
    const aiResponse = await aiService.generateResponse(
      message,
      conversationHistory
    );

    // Save the AI response
    await dbService.saveMessage(from, aiResponse, false);

    // Send the response back to WhatsApp
    const formattedPhone = whatsappService.formatPhoneNumber(from);
    await whatsappService.sendMessage(formattedPhone, aiResponse);

    // Stop typing indicator
    await whatsappService.sendTypingIndicator(from, false);

    console.log(
      `Processed message from ${from}: ${message.substring(0, 50)}...`
    );
  } catch (error) {
    console.error('Error processing message:', error);

    // Send error message to user
    const whatsappService = new WhatsAppService(env);
    const formattedPhone = whatsappService.formatPhoneNumber(from);
    await whatsappService.sendMessage(
      formattedPhone,
      'I apologize, but I encountered an error processing your message. Please try again.'
    );
  }
}

export default app;
