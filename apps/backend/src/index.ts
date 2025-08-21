import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { renderAdminDashboard } from './admin_dashboard';
import { auth } from './lib/better-auth';
import { AIService } from './services/ai_service';
import { ChatService } from './services/chat-service';
import { ChatSessionService } from './services/chat-session-service';
import { isAuthorizedPhoneNumber } from './services/utils';
import { WebhookVerificationService } from './services/webhook_verification_service';
import { WhatsAppService } from './services/whatsapp_service';
import type { WhatsAppMessage } from './types';

const app = new Hono<{ Bindings: Env }>();

/**
 * Determines the appropriate HTTP status code for validation errors
 */
function getValidationErrorStatusCode(error?: string): 400 | 401 {
  const badRequestErrors = ['Invalid content type', 'Invalid body'];
  return badRequestErrors.includes(error || '') ? 400 : 401;
}

// Middleware
app.use('*', logger());
app.use('*', cors());

// Auth middleware for all API routes except webhook
app.on(['GET', 'POST'], '/api/**', async (c) => {
  // Skip auth for webhook endpoints - they need to be publicly accessible
  if (c.req.path === '/api/webhook') {
    return; // Continue without authentication for webhooks
  }

  // Apply authentication for all other API routes
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
app.get('/admin', (_c) => {
  return new Response(renderAdminDashboard(), {
    headers: {
      'Content-Type': 'text/html',
    },
  });
});

// WhatsApp webhook verification - used
app.get('/api/webhook', (c) => {
  const webhookService = WebhookVerificationService.createFromEnv(c.env);

  const verificationResult = webhookService.validateVerificationRequest({
    mode: c.req.query('hub.mode'),
    token: c.req.query('hub.verify_token'),
    challenge: c.req.query('hub.challenge'),
    verifyToken: c.env.WHATSAPP_VERIFY_TOKEN,
  });

  if (!verificationResult.isValid || !verificationResult.challenge) {
    const statusCode =
      verificationResult.error === 'Missing required parameters' ? 400 : 403;
    return c.text(verificationResult.error || 'Forbidden', statusCode);
  }

  return c.text(verificationResult.challenge);
});

// WhatsApp webhook for receiving messages
app.post('/api/webhook', async (c) => {
  const authClient = auth(c.env);
  const webhookService = WebhookVerificationService.createFromEnv(c.env);

  try {
    // Get the raw body for signature validation
    const rawBody = await c.req.text();

    // Parse the JSON body
    const body = JSON.parse(rawBody) as WhatsAppMessage;

    // Validate message payload
    const validationResult = await webhookService.validateMessagePayload({
      contentType: c.req.header('content-type'),
      rawBody,
      signature: c.req.header('x-hub-signature-256'),
      body,
    });

    if (!validationResult.isValid) {
      const statusCode = getValidationErrorStatusCode(validationResult.error);
      return c.text(validationResult.error || 'Bad Request', statusCode);
    }

    // Process each entry
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          const value = change.value;

          if (value.messages && value.messages.length > 0) {
            for (const message of value.messages) {
              if (message.type === 'text') {
                // Validate that the message is from the authorized phone number
                if (!isAuthorizedPhoneNumber(message.from)) {
                  console.log(
                    `Rejected message from unauthorized number: ${message.from}`
                  );
                  continue;
                }

                // Session Management
                const chatSessionService = new ChatSessionService(
                  c.env.watsapp_ai_session
                );
                const existingSession =
                  await chatSessionService.getWhatsAppUserSession(message.from);

                if (!existingSession) {
                  await authClient.api.sendPhoneNumberOTP({
                    body: {
                      phoneNumber: message.from,
                    },
                  });
                }

                await processMessage(
                  c.env,
                  message.from,
                  message.text.body,
                  message.id
                );

                return c.text('OK');
              } else {
                console.log(`Rejected message of type ${message.type}`);
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

app.get('/api/auth/verify', async (c) => {
  const phoneNumber = c.req.query('phoneNumber');
  const code = c.req.query('code');

  console.log('phoneNumber', phoneNumber);
  console.log('code', code);

  if (!phoneNumber || !code) {
    return c.text('Bad Request', 400);
  }

  const authClient = auth(c.env);
  await authClient.api.verifyPhoneNumber({
    body: {
      phoneNumber: phoneNumber,
      code: code,
      disableSession: true,
    },
    headers: c.req.header(),
  });

  return c.text('Welcome to WhatsApp AI');
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
    const chatService = new ChatService(env.watsapp_ai_chats);

    // Save the user message
    await chatService.storeMessage(from, message, true);

    // Mark message as read
    await whatsappService.markMessageAsRead(messageId);

    // Send typing indicator
    await whatsappService.sendTypingIndicator(from, true);

    // Get conversation history for context
    const conversationHistory = await chatService.getConversationHistoryForAI(
      from,
      20
    );

    // Generate AI response
    const aiResponse = await aiService.generateResponse(
      message,
      conversationHistory
    );

    // Save the AI response
    await chatService.storeMessage(from, aiResponse, false);

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
