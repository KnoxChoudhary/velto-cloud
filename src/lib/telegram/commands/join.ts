import { CommandContext } from '../../types/telegram';
import { getGroupById } from '../../supabase/queries/groups';
import { createPaymentOrder } from '../../razorpay/utils';
import { createInlineKeyboard } from '../utils/keyboard';
import { MESSAGES } from '../utils/messages';
import { ValidationError } from '../../types/errors';
import { logger } from '../../utils/logger';

export const joinCommand = async (ctx: CommandContext): Promise<void> => {
  try {
    const args = ctx.message.text.split(' ');
    
    if (args.length !== 2) {
      await ctx.reply(MESSAGES.INVALID_JOIN_FORMAT, { parse_mode: 'HTML' });
      return;
    }

    const groupId = args[1];
    
    // Validate group ID format (basic UUID check)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupId)) {
      throw new ValidationError('Invalid group ID format');
    }

    // Get group details
    const group = await getGroupById(groupId);
    if (!group) {
      await ctx.reply(MESSAGES.GROUP_NOT_FOUND, { parse_mode: 'HTML' });
      return;
    }

    // Check if bot is admin in the group
    if (!group.bot_is_admin) {
      await ctx.reply(MESSAGES.BOT_NOT_ADMIN, { parse_mode: 'HTML' });
      return;
    }

    // Store group ID in session
    if (ctx.session) {
      ctx.session.group_id = groupId;
    }

    // Show group details and payment options
    const keyboard = createInlineKeyboard([
      [{ text: `💳 Pay ₹${group.price_inr}`, callback_data: `pay_${groupId}` }],
      [{ text: '❌ Cancel', callback_data: 'cancel_payment' }],
    ]);

    const groupInfo = MESSAGES.GROUP_INFO
      .replace('{groupName}', group.name)
      .replace('{price}', group.price_inr.toString())
      .replace('{duration}', group.subscription_duration_days.toString())
      .replace('{description}', group.description || 'No description available');

    await ctx.reply(groupInfo, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });

  } catch (error) {
    logger.error('Join command error', { error, userId: ctx.from?.id });
    
    if (error instanceof ValidationError) {
      await ctx.reply(error.message, { parse_mode: 'HTML' });
    } else {
      await ctx.reply(MESSAGES.GENERIC_ERROR, { parse_mode: 'HTML' });
    }
  }
};