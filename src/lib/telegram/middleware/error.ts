import { BotContext } from '../../types/telegram';
import { logger } from '../../utils/logger';

export const errorMiddleware = async (ctx: BotContext, next: () => Promise<void>): Promise<void> => {
  try {
    await next();
  } catch (error) {
    logger.error('Bot command error', {
      error,
      user_id: ctx.from?.id,
      chat_id: ctx.chat?.id,
      message: ctx.message,
    });

    // Send user-friendly error message
    try {
      await ctx.reply(
        '❌ Something went wrong. Please try again later or contact support.',
        { parse_mode: 'HTML' }
      );
    } catch (replyError) {
      logger.error('Failed to send error message to user', { replyError });
    }
  }
};