import { CommandContext } from '../../types/telegram';
import { MESSAGES } from '../utils/messages';

export const cancelCommand = async (ctx: CommandContext): Promise<void> => {
  // Clear session data
  if (ctx.session) {
    ctx.session = {};
  }

  await ctx.reply(MESSAGES.OPERATION_CANCELLED, { parse_mode: 'HTML' });
};