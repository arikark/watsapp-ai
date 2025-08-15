import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { renderAdminDashboard } from './admin_dashboard';
import { AIService } from './ai_service';
import { DatabaseService } from './database_service';
import type { Env, WhatsAppMessage } from './types';
import {
  isAuthorizedPhoneNumber,
  validateAuthorizedPhoneNumber,
} from './utils';
import { WhatsAppService } from './whatsapp_service';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors());

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
app.get('/webhook', (c) => {
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
app.post('/webhook', async (c) => {
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
                  await sendUnauthorizedMessage(c.env, message.from, message.id);
                  continue; // Skip processing this message
                }

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

// API endpoint to send a message (for testing)
app.post('/api/send', async (c) => {
  try {
    const { phoneNumber, message } = await c.req.json();

    if (!phoneNumber || !message) {
      return c.json({ error: 'Phone number and message are required' }, 400);
    }

    // Validate that the target phone number is the authorized number
    if (!isAuthorizedPhoneNumber(phoneNumber)) {
      return c.json({ error: 'Unauthorized phone number' }, 403);
    }

    const whatsappService = new WhatsAppService(c.env);
    const formattedPhone = whatsappService.formatPhoneNumber(phoneNumber);

    const result = await whatsappService.sendMessage(formattedPhone, message);

    if (result) {
      return c.json({
        success: true,
        messageId: result.messages[0]?.id,
        phoneNumber: formattedPhone,
      });
    } else {
      return c.json({ error: 'Failed to send message' }, 500);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// API endpoint to send template message (for testing)
app.post('/api/send-template', async (c) => {
  try {
    const {
      phoneNumber,
      templateName,
      languageCode = 'en_US',
    } = await c.req.json();

    if (!phoneNumber || !templateName) {
      return c.json(
        { error: 'Phone number and template name are required' },
        400
      );
    }

    // Validate that the target phone number is the authorized number
    if (!isAuthorizedPhoneNumber(phoneNumber)) {
      return c.json({ error: 'Unauthorized phone number' }, 403);
    }

    const whatsappService = new WhatsAppService(c.env);
    const formattedPhone = whatsappService.formatPhoneNumber(phoneNumber);

    const result = await whatsappService.sendTemplateMessage(
      formattedPhone,
      templateName,
      languageCode
    );

    if (result) {
      return c.json({
        success: true,
        messageId: result.messages[0]?.id,
        phoneNumber: formattedPhone,
        templateName,
      });
    } else {
      return c.json({ error: 'Failed to send template message' }, 500);
    }
  } catch (error) {
    console.error('Error sending template message:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// API endpoint to get conversation history
app.get('/api/conversation/:phoneNumber', async (c) => {
  try {
    const phoneNumber = c.req.param('phoneNumber');

    // Validate that the phone number is the authorized number
    if (!isAuthorizedPhoneNumber(phoneNumber)) {
      return c.json({ error: 'Unauthorized phone number' }, 403);
    }

    const limit = parseInt(c.req.query('limit') || '10');

    const dbService = new DatabaseService(c.env);
    const messages = await dbService.getConversationHistory(phoneNumber, limit);

    return c.json({ messages });
  } catch (error) {
    console.error('Error getting conversation:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// API endpoint to get conversation statistics
app.get('/api/stats/:phoneNumber', async (c) => {
  try {
    const phoneNumber = c.req.param('phoneNumber');

    // Validate that the phone number is the authorized number
    if (!isAuthorizedPhoneNumber(phoneNumber)) {
      return c.json({ error: 'Unauthorized phone number' }, 403);
    }

    const dbService = new DatabaseService(c.env);
    const messageCount = await dbService.getMessageCount(phoneNumber);

    return c.json({
      phoneNumber,
      messageCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
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
