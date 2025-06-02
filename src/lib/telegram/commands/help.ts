import { CommandContext } from '../../types/telegram';
import { MESSAGES } from '../utils/messages';

export const helpCommand = async (ctx: CommandContext): Promise<void> => {
  await ctx.reply(MESSAGES.HELP, { parse_mode: 'HTML' });
};