import { BotContext } from '../../types/telegram';
import { logger } from '../../utils/logger';

// Simple in-memory rate limiter (use Redis in production for distributed systems)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute

export const rateLimitMiddleware = async (ctx: BotContext, next: () => Promise<void>): Promise<void> => {
  const userId = ctx.from?.id?.toString();
  if (!userId) {
    await next();
    return;
  }

  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    rateLimitMap.set(userId, { count: 1, resetTime: now + WINDOW_MS });
    await next();
    return;
  }

  if (userLimit.count >= RATE_LIMIT) {
    logger.warn('Rate limit exceeded', { userId, count: userLimit.count });
    await ctx.reply('⚠️ Too many requests. Please wait a moment before trying again.');
    return;
  }

  // Increment counter
  userLimit.count++;
  await next();
};