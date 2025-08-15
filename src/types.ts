export interface Env {
  AI: Ai;
  DB: D1Database;
  WHATSAPP_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  WHATSAPP_VERIFY_TOKEN?: string;
}

export interface WhatsAppMessage {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text: {
            body: string;
          };
          type: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export interface ChatMessage {
  id: string;
  phone_number: string;
  message: string;
  timestamp: string;
  is_from_user: boolean;
}

export interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}
