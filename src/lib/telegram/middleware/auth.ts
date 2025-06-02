import { BotContext } from '../../types/telegram';
import { logger } from '../../utils/logger';

export const authMiddleware = async (ctx: BotContext, next: () => Promise<void>): Promise<void> => {
  // Initialize session if it doesn't exist
  if (!ctx.session) {
    ctx.session = {};
  }

  // Store user info in session
  if (ctx.from) {
    ctx.session.user_id = ctx.from.id.toString();
    
    logger.info('User interaction', {
      user_id: ctx.from.id,
      username: ctx.from.username,
      chat_type: ctx.chat?.type,
      command: ctx.message && 'text' in ctx.message ? ctx.message.text : undefined,
    });
  }

  await next();
};