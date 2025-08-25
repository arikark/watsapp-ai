export * from './schemas/auth';
export * from './schemas/main';

import { account, user, verification } from './schemas/auth';
import { chat_messages } from './schemas/main';

export const schema = {
  user,
  account,
  verification,
  chat_messages,
};
