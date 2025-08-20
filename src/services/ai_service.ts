import { generateText } from 'ai';
import { createWorkersAI, type WorkersAI } from 'workers-ai-provider';

export class AIService {
  private ai: WorkersAI;

  constructor(env: Env) {
    this.ai = createWorkersAI({ binding: env.AI });
  }

  async generateResponse(
    prompt: string,
    conversationHistory: string = ''
  ): Promise<string> {
    try {
      const model = this.ai('@cf/meta/llama-3.1-8b-instruct', {});
      const fullPrompt = this.buildPrompt(prompt, conversationHistory);

      const result = await generateText({
        model,
        prompt: fullPrompt,
        temperature: 0.7,
        maxTokens: 500,
      });

      return result.text;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'I apologize, but I encountered an error processing your message. Please try again.';
    }
  }

  private buildPrompt(
    userMessage: string,
    conversationHistory: string
  ): string {
    const systemPrompt = `You are a helpful AI assistant accessible via WhatsApp. You should:
- Be friendly and conversational
- Provide helpful and accurate information
- Keep responses concise but informative (max 80 words)
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
  async getConversationContext(
    phoneNumber: string,
    recentMessages: number = 3
  ): Promise<string> {
    // This would typically fetch from your database
    // For now, return a simple context
    return `Recent conversation with ${phoneNumber} (last ${recentMessages} messages)`;
  }
}
