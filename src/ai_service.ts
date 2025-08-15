import type { Env } from './types';

export class AIService {
  private ai: Ai;

  constructor(env: Env) {
    this.ai = env.AI;
  }

  async generateResponse(prompt: string, conversationHistory: string = ''): Promise<string> {
    try {
      const fullPrompt = this.buildPrompt(prompt, conversationHistory);

      const result = await this.ai.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt: fullPrompt,
        max_tokens: 500,
        temperature: 0.7,
      });

      return result.response as string;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'I apologize, but I encountered an error processing your message. Please try again.';
    }
  }

  async streamResponse(prompt: string, conversationHistory: string = ''): Promise<ReadableStream> {
    try {
      const fullPrompt = this.buildPrompt(prompt, conversationHistory);

      const result = await this.ai.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt: fullPrompt,
        max_tokens: 500,
        temperature: 0.7,
        stream: true,
      });

      return result as ReadableStream;
    } catch (error) {
      console.error('Error streaming AI response:', error);
      return new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('I apologize, but I encountered an error processing your message. Please try again.'));
          controller.close();
        }
      });
    }
  }

  private buildPrompt(userMessage: string, conversationHistory: string): string {
    const systemPrompt = `You are a helpful AI assistant accessible via WhatsApp. You should:
- Be friendly and conversational
- Provide helpful and accurate information
- Keep responses concise but informative (max 200 words)
- Be respectful and professional
- If you don't know something, admit it rather than making things up
- Respond in a natural, conversational tone

Previous conversation context:
${conversationHistory}

User's message: ${userMessage}

Please respond in a helpful and conversational manner:`;

    return systemPrompt;
  }

  // Helper method to get conversation context for better responses
  async getConversationContext(phoneNumber: string, recentMessages: number = 3): Promise<string> {
    // This would typically fetch from your database
    // For now, return a simple context
    return `Recent conversation with ${phoneNumber} (last ${recentMessages} messages)`;
  }
}
