# 🔐 Meta-Compliant WhatsApp Webhook Verification

This document explains the implementation of webhook verification following Meta's official documentation and security best practices, using a dedicated `WebhookVerificationService`.

## Overview

The webhook verification implementation follows Meta's official guidelines from the [Graph API Webhooks documentation](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/#mtls-for-webhooks). All verification functionality is grouped into a single, reusable service for better organization and maintainability.

## Service Architecture

### WebhookVerificationService

The `WebhookVerificationService` class encapsulates all webhook verification logic:

```typescript
export class WebhookVerificationService {
  private verifyToken: string;
  private appSecret: string;

  constructor(verifyToken: string, appSecret: string) {
    this.verifyToken = verifyToken;
    this.appSecret = appSecret;
  }

  // Main validation methods
  validateVerificationRequest(params: WebhookVerificationParams): WebhookVerificationResult
  validateMessagePayload(contentType, rawBody, signature, body): Promise<WebhookMessageValidation>
}
```

## Implementation Details

### 1. Verification Requests (GET `/api/webhook`)

According to Meta documentation, verification requests include these query parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `hub.mode` | Always set to `subscribe` | `subscribe` |
| `hub.challenge` | Integer to be returned | `1158201444` |
| `hub.verify_token` | String from App Dashboard | `meatyhamhock` |

#### Implementation Flow

```typescript
// 1. Create service instance
const webhookService = WebhookVerificationService.createFromEnv(c.env);

// 2. Validate verification request
const verificationResult = webhookService.validateVerificationRequest({
  mode: c.req.query('hub.mode') || null,
  token: c.req.query('hub.verify_token') || null,
  challenge: c.req.query('hub.challenge') || null,
  verifyToken: c.env.WHATSAPP_VERIFY_TOKEN
});

// 3. Return appropriate response
if (!verificationResult.isValid) {
  const statusCode = verificationResult.error === 'Missing required parameters' ? 400 : 403;
  return c.text(verificationResult.error || 'Forbidden', statusCode);
}

return c.text(verificationResult.challenge!);
```

### 2. Event Notifications (POST `/api/webhook`)

Event notifications include a signed payload with the following headers:

- `Content-Type: application/json`
- `X-Hub-Signature-256: sha256={signature}`

#### Payload Validation

```typescript
// 1. Create service instance
const webhookService = WebhookVerificationService.createFromEnv(c.env);

// 2. Get raw body and parse JSON
const rawBody = await c.req.text();
const body = JSON.parse(rawBody) as WhatsAppMessage;

// 3. Validate message payload
const validationResult = await webhookService.validateMessagePayload(
  c.req.header('content-type') || null,
  rawBody,
  c.req.header('x-hub-signature-256') || null,
  body
);

// 4. Handle validation result
if (!validationResult.isValid) {
  const statusCode = validationResult.error === 'Invalid content type' ||
                     validationResult.error === 'Invalid body' ? 400 : 401;
  return c.text(validationResult.error || 'Bad Request', statusCode);
}
```

### 3. SHA256 Signature Validation

The service implements Meta's signature validation process:

1. **Extract Signature**: Remove `sha256=` prefix from header
2. **Generate Expected Signature**: Use HMAC-SHA256 with app secret
3. **Compare Signatures**: Constant-time comparison to prevent timing attacks

```typescript
private async validatePayloadSignature(payload: string, signature: string): Promise<boolean> {
  // Extract signature value (remove 'sha256=' prefix)
  const signatureValue = signature.replace('sha256=', '');

  // Generate expected signature using HMAC-SHA256
  const expectedSignature = await this.generateSHA256Signature(payload);

  // Constant-time comparison for security
  return this.constantTimeCompare(signatureValue, expectedSignature);
}
```

## Service Methods

### validateVerificationRequest()

Validates webhook verification parameters:

```typescript
validateVerificationRequest(params: WebhookVerificationParams): WebhookVerificationResult
```

**Validation Rules:**
- All parameters must be present
- `mode` must be `subscribe`
- `token` must match `verifyToken`
- `verifyToken` must be configured

### validateMessagePayload()

Validates WhatsApp message payload:

```typescript
async validateMessagePayload(
  contentType: string | null,
  rawBody: string,
  signature: string | null,
  body: any
): Promise<WebhookMessageValidation>
```

**Validation Steps:**
1. Content-Type validation
2. Signature validation (if app secret available)
3. Message structure validation

### createFromEnv()

Factory method to create service from environment variables:

```typescript
static createFromEnv(env: { WHATSAPP_VERIFY_TOKEN: string; META_APP_SECRET: string }): WebhookVerificationService
```

## Security Features

### 1. Parameter Validation

- **Required Parameters**: All `hub.mode`, `hub.verify_token`, and `hub.challenge` must be present
- **Token Matching**: Verify token must exactly match App Dashboard setting
- **Mode Validation**: `hub.mode` must be `subscribe`

### 2. Payload Security

- **Content-Type Validation**: Must be `application/json`
- **Signature Validation**: SHA256 signature verification using app secret
- **Message Structure**: Validates WhatsApp message format
- **Entry Validation**: Ensures proper entry array structure

### 3. Cryptographic Security

- **HMAC-SHA256**: Uses Web Crypto API for secure signature generation
- **Constant-Time Comparison**: Prevents timing attacks during signature comparison
- **Error Handling**: Graceful handling of cryptographic errors

### 4. Logging and Monitoring

- **Security Logs**: Log all verification attempts and failures
- **Error Tracking**: Monitor failed signature validations
- **Access Patterns**: Track unusual webhook access patterns

## Configuration

### Environment Variables

```env
# WhatsApp Business API Configuration
WHATSAPP_VERIFY_TOKEN=4a789cff-b01b-48e5-9531-5dc0cebde947

# Meta App Secret for signature validation
META_APP_SECRET=0bcb9f314f167c052e4d5042bb13f959
```

### Meta Developer Console Setup

1. **App Dashboard Configuration**:
   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Navigate to your app > WhatsApp > Configuration
   - Set webhook URL: `https://your-worker.your-subdomain.workers.dev/api/webhook`
   - Set verify token: Use your `WHATSAPP_VERIFY_TOKEN` value
   - Subscribe to `messages` events

2. **App Secret**:
   - Use your Meta app's secret (`META_APP_SECRET`) for signature validation
   - Store securely in environment variables
   - Never expose in client-side code

## Testing

### Manual Testing

```bash
# Valid verification request
curl -i "https://your-worker.your-subdomain.workers.dev/api/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123"

# Invalid token
curl -i "https://your-worker.your-subdomain.workers.dev/api/webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=test123"

# Missing parameters
curl -i "https://your-worker.your-subdomain.workers.dev/api/webhook?hub.mode=subscribe"
```

### Signature Validation Testing

```bash
# Test with valid signature (requires app secret)
curl -i -X POST \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=YOUR_SIGNATURE" \
  -d '{"object":"whatsapp_business_account","entry":[]}' \
  https://your-worker.your-subdomain.workers.dev/api/webhook
```

## Error Handling

### HTTP Status Codes

- **200 OK**: Successful verification or message processing
- **400 Bad Request**: Invalid content type or message structure
- **401 Unauthorized**: Invalid signature
- **403 Forbidden**: Invalid verification parameters
- **500 Internal Server Error**: Server configuration or processing errors

### Error Responses

```typescript
// Verification failures
if (!verificationResult.isValid) {
  const statusCode = verificationResult.error === 'Missing required parameters' ? 400 : 403;
  return c.text(verificationResult.error || 'Forbidden', statusCode);
}

// Message validation failures
if (!validationResult.isValid) {
  const statusCode = validationResult.error === 'Invalid content type' ||
                     validationResult.error === 'Invalid body' ? 400 : 401;
  return c.text(validationResult.error || 'Bad Request', statusCode);
}
```

## Benefits of Service-Based Approach

### 1. Code Organization

- **Single Responsibility**: All webhook verification logic in one place
- **Reusability**: Service can be used across different endpoints
- **Maintainability**: Easier to update and test verification logic

### 2. Type Safety

- **Interface Definitions**: Clear contracts for validation parameters and results
- **Type Checking**: Compile-time validation of data structures
- **Error Handling**: Structured error responses with proper typing

### 3. Testing

- **Unit Testing**: Easy to test individual validation methods
- **Mocking**: Simple to mock service for integration tests
- **Isolation**: Verification logic isolated from route handlers

### 4. Configuration

- **Environment Integration**: Factory method for easy environment setup
- **Dependency Injection**: Service can be injected with different configurations
- **Flexibility**: Easy to extend with additional validation rules

## Best Practices

### 1. Security

- **Strong Tokens**: Use cryptographically secure random tokens
- **Environment Variables**: Store secrets securely
- **Token Rotation**: Regularly rotate verification tokens
- **HTTPS Only**: Always use HTTPS for webhook endpoints

### 2. Validation

- **Parameter Validation**: Validate all required parameters
- **Signature Validation**: Always validate payload signatures
- **Content Validation**: Verify message structure and content
- **Type Safety**: Use TypeScript for compile-time validation

### 3. Monitoring

- **Security Logs**: Log all verification attempts
- **Error Tracking**: Monitor failed validations
- **Performance Monitoring**: Track webhook processing times
- **Alerting**: Set up alerts for security events

### 4. Error Handling

- **Graceful Degradation**: Handle errors without exposing sensitive data
- **Consistent Responses**: Return consistent error responses
- **Logging**: Log errors for debugging without exposing secrets
- **Retry Logic**: Handle temporary failures appropriately

## Compliance with Meta Guidelines

This implementation follows all Meta requirements:

✅ **Verification Requests**: Properly validates and responds to GET requests
✅ **Event Notifications**: Handles POST requests with signature validation
✅ **Signature Validation**: Implements SHA256 signature verification
✅ **Error Handling**: Returns appropriate HTTP status codes
✅ **Security**: Uses constant-time comparison and secure cryptographic methods
✅ **Logging**: Comprehensive logging for security monitoring
✅ **Service Architecture**: Clean, maintainable, and testable code structure

## Troubleshooting

### Common Issues

1. **Verification Fails**
   - Check token matches exactly (case-sensitive)
   - Verify environment variable is set correctly
   - Ensure webhook URL is accessible via HTTPS

2. **Signature Validation Fails**
   - Verify app secret is correct
   - Check signature header format (`sha256=...`)
   - Ensure raw body is used for signature generation

3. **Messages Not Received**
   - Confirm webhook is verified successfully
   - Check subscription to `messages` events
   - Verify phone number authorization

### Debug Steps

1. **Check Logs**
   ```bash
   wrangler tail --format pretty
   ```

2. **Test Verification**
   ```bash
   curl -i "https://your-worker.your-subdomain.workers.dev/api/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test"
   ```

3. **Verify Environment**
   ```bash
   wrangler secret list
   ```

## Conclusion

This service-based implementation provides a secure, Meta-compliant webhook verification system that follows all official guidelines and security best practices. The `WebhookVerificationService` encapsulates all verification logic in a clean, maintainable, and testable structure.

For additional security, consider implementing:
- Rate limiting
- IP whitelisting
- Request deduplication
- Enhanced monitoring and alerting
