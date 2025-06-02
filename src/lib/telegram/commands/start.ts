import { CommandContext } from '../../types/telegram';
import { createInlineKeyboard } from '../utils/keyboard';
import { MESSAGES } from '../utils/messages';

export const startCommand = async (ctx: CommandContext): Promise<void> => {
  const keyboard = createInlineKeyboard([
    [{ text: '🔍 Browse Groups', callback_data: 'browse_groups' }],
    [{ text: '❓ How it works', callback_data: 'how_it_works' }],
    [{ text: '🆘 Get Help', callback_data: 'get_help' }],
  ]);

  await ctx.reply(MESSAGES.WELCOME, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
};