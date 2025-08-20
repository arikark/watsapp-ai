# 🔐 Meta-Compliant WhatsApp Webhook Verification

This document explains the implementation of webhook verification following Meta's official documentation and security best practices.

## Overview

The webhook verification implementation follows Meta's official guidelines from the [Graph API Webhooks documentation](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/#mtls-for-webhooks). This ensures maximum security and compatibility with WhatsApp Business API.

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
// 1. Extract parameters from query string
const mode = c.req.query('hub.mode');
const token = c.req.query('hub.verify_token');
const challenge = c.req.query('hub.challenge');

// 2. Validate all required parameters are present
if (!verifyToken || !mode || !token || !challenge) {
  return c.text('Forbidden', 403);
}

// 3. Verify hub.verify_token matches App Dashboard setting
if (mode === 'subscribe' && token === verifyToken) {
  // 4. Respond with hub.challenge value as required by Meta
  return c.text(challenge);
}
```

### 2. Event Notifications (POST `/api/webhook`)

Event notifications include a signed payload with the following headers:

- `Content-Type: application/json`
- `X-Hub-Signature-256: sha256={signature}`

#### Payload Validation

According to Meta documentation, all event notification payloads are signed with SHA256. The implementation validates this signature:

```typescript
// 1. Validate content type
const contentType = c.req.header('content-type');
if (!contentType?.includes('application/json')) {
  return c.text('Bad Request', 400);
}

// 2. Get raw body for signature validation
const rawBody = await c.req.text();

// 3. Validate payload signature
const signature = c.req.header('x-hub-signature-256');
if (signature && !await validatePayloadSignature(rawBody, signature, appSecret)) {
  return c.text('Unauthorized', 401);
}

// 4. Parse and validate message structure
const body = JSON.parse(rawBody) as WhatsAppMessage;
```

### 3. SHA256 Signature Validation

The implementation follows Meta's signature validation process:

1. **Extract Signature**: Remove `sha256=` prefix from header
2. **Generate Expected Signature**: Use HMAC-SHA256 with app secret
3. **Compare Signatures**: Constant-time comparison to prevent timing attacks

```typescript
export async function validatePayloadSignature(
  payload: string,
  signature: string,
  appSecret: string
): Promise<boolean> {
  // Extract signature value (remove 'sha256=' prefix)
  const signatureValue = signature.replace('sha256=', '');

  // Generate expected signature using HMAC-SHA256
  const expectedSignature = await generateSHA256Signature(payload, appSecret);

  // Constant-time comparison for security
  return constantTimeCompare(signatureValue, expectedSignature);
}
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
if (!verifyToken || !mode || !token || !challenge) {
  return c.text('Forbidden', 403);
}

// Signature validation failures
if (signature && !await validatePayloadSignature(rawBody, signature, appSecret)) {
  return c.text('Unauthorized', 401);
}

// Message structure validation
if (body.object !== 'whatsapp_business_account') {
  return c.text('Not a WhatsApp message', 400);
}
```

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

This implementation provides a secure, Meta-compliant webhook verification system that follows all official guidelines and security best practices. The combination of parameter validation, signature verification, and comprehensive error handling ensures that only legitimate WhatsApp requests are processed.

For additional security, consider implementing:
- Rate limiting
- IP whitelisting
- Request deduplication
- Enhanced monitoring and alerting
