/**
 * Webhook Verification Service
 *
 * Handles all webhook verification and validation according to Meta's documentation:
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started/#mtls-for-webhooks
 */

export interface WebhookVerificationParams {
  mode: string | undefined;
  token: string | undefined;
  challenge: string | undefined;
  verifyToken: string | undefined;
}

export interface WebhookMessageValidationParams {
  contentType: string | undefined;
  rawBody: string;
  signature: string | undefined;
  body: unknown;
}

export interface WebhookMessageValidation {
  isValid: boolean;
  error?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
  challenge?: string;
}

export class WebhookVerificationService {
  private verifyToken: string;
  private appSecret: string;

  constructor(verifyToken: string, appSecret: string) {
    this.verifyToken = verifyToken;
    this.appSecret = appSecret;
  }

  /**
   * Validates webhook verification request (GET /api/webhook)
   * According to Meta documentation, this validates hub.mode, hub.verify_token, and hub.challenge
   */
  validateVerificationRequest(
    params: WebhookVerificationParams
  ): WebhookVerificationResult {
    const { mode, token, challenge, verifyToken } = params;

    // Log verification attempt for debugging
    console.log('Webhook verification attempt:', {
      mode,
      token: token ? '[REDACTED]' : 'undefined',
      challenge: challenge ? '[PRESENT]' : 'undefined',
      hasVerifyToken: !!verifyToken,
    });

    // Validate required parameters
    if (!verifyToken || !mode || !token || !challenge) {
      console.log('Webhook verification failed: Missing required parameters');
      return {
        isValid: false,
        error: 'Missing required parameters',
      };
    }

    // Validate mode is 'subscribe'
    if (mode !== 'subscribe') {
      console.log('Webhook verification failed: Invalid mode', mode);
      return {
        isValid: false,
        error: 'Invalid mode',
      };
    }

    // Validate token matches
    if (token !== verifyToken) {
      console.log('Webhook verification failed: Token mismatch');
      return {
        isValid: false,
        error: 'Token mismatch',
      };
    }

    console.log('Webhook verified successfully');
    return {
      isValid: true,
      challenge: challenge,
    };
  }

  /**
   * Validates webhook message payload (POST /api/webhook)
   * Validates content type, signature, and message structure
   */
  async validateMessagePayload(
    params: WebhookMessageValidationParams
  ): Promise<WebhookMessageValidation> {
    const { contentType, rawBody, signature, body } = params;

    // Validate content type
    if (!contentType || !contentType.includes('application/json')) {
      console.log('Webhook POST failed: Invalid content type', contentType);
      return {
        isValid: false,
        error: 'Invalid content type',
      };
    }

    // Validate payload signature if app secret is available
    if (this.appSecret && signature) {
      const isSignatureValid = await this.validatePayloadSignature(
        rawBody,
        signature
      );
      if (!isSignatureValid) {
        console.log('Webhook POST failed: Invalid signature');
        return {
          isValid: false,
          error: 'Invalid signature',
        };
      }
    }

    // Validate message structure
    const structureValidation = this.validateMessageStructure(body);
    if (!structureValidation.isValid) {
      console.log('Webhook POST failed:', structureValidation.error);
      return structureValidation;
    }

    console.log('Webhook POST succeeded');

    return { isValid: true };
  }

  /**
   * Validates WhatsApp message structure
   */
  private validateMessageStructure(body: unknown): WebhookMessageValidation {
    // Check if body is a valid object
    if (!body || typeof body !== 'object') {
      return {
        isValid: false,
        error: 'Invalid body',
      };
    }

    // Type guard to check if body has the required properties
    const bodyObj = body as Record<string, unknown>;

    // Verify this is a WhatsApp message
    if (bodyObj.object !== 'whatsapp_business_account') {
      return {
        isValid: false,
        error: 'Not a WhatsApp message',
      };
    }

    // Validate required fields
    if (
      !bodyObj.entry ||
      !Array.isArray(bodyObj.entry) ||
      bodyObj.entry.length === 0
    ) {
      return {
        isValid: false,
        error: 'Invalid entry structure',
      };
    }

    return { isValid: true };
  }

  /**
   * Validates webhook payload signature using SHA256
   * According to Meta documentation: https://developers.facebook.com/docs/graph-api/webhooks/getting-started/#validating-payloads
   */
  private async validatePayloadSignature(
    payload: string,
    signature: string
  ): Promise<boolean> {
    try {
      // Extract the signature value (remove 'sha256=' prefix)
      const signatureValue = signature.replace('sha256=', '');

      // Generate SHA256 signature using payload and app secret
      const expectedSignature = await this.generateSHA256Signature(payload);

      // Compare signatures (constant-time comparison for security)
      return this.constantTimeCompare(signatureValue, expectedSignature);
    } catch (error) {
      console.error('Error validating payload signature:', error);
      return false;
    }
  }

  /**
   * Generates SHA256 signature for webhook payload
   */
  private async generateSHA256Signature(payload: string): Promise<string> {
    // Create HMAC-SHA256 signature
    const encoder = new TextEncoder();
    const key = encoder.encode(this.appSecret);
    const data = encoder.encode(payload);

    // Use Web Crypto API for HMAC-SHA256
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);

    // Convert to hex string
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Performs constant-time comparison of two strings
   * This prevents timing attacks when comparing signatures
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Creates a new WebhookVerificationService instance from environment variables
   */
  static createFromEnv(env: {
    WHATSAPP_VERIFY_TOKEN: string;
    META_APP_SECRET: string;
  }): WebhookVerificationService {
    return new WebhookVerificationService(
      env.WHATSAPP_VERIFY_TOKEN,
      env.META_APP_SECRET
    );
  }
}
