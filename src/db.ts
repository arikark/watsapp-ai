import { drizzle } from 'drizzle-orm/d1';
import { chat_messages } from './schema';
import type { Env } from './types';

export function createDb(env: Env) {
  return drizzle(env.DB);
}

export { chat_messages };
export type { ChatMessage, NewChatMessage } from './schema';
