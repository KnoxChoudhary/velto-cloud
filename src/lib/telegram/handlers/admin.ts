import { CallbackContext } from '../../types/telegram';
import { getGroupById } from '../../supabase/queries/groups';
import { createPaymentOrder } from '../../razorpay/utils';
import { createInlineKeyboard } from '../utils/keyboard';
import { MESSAGES } from '../utils/messages';
import { logger } from '../../utils/logger';

export const handlePaymentCallback = async (ctx: CallbackContext): Promise<void> => {
  try {
    await ctx.answerCbQuery();
    
    const data = ctx.callbackQuery.data;
    if (!data) return;

    if (data.startsWith('pay_')) {
      await handlePaymentInitiation(ctx, data);
    } else if (data === 'cancel_payment') {
      await handlePaymentCancellation(ctx);
    } else if (data === 'browse_groups') {
      await handleBrowseGroups(ctx);
    } else if (data === 'how_it_works') {
      await handleHowItWorks(ctx);
    } else if (data === 'get_help') {
      await handleGetHelp(ctx);
    }
  } catch (error) {
    logger.error('Callback query error', { error, userId: ctx.from?.id, data: ctx.callbackQuery.data });
    await ctx.reply(MESSAGES.GENERIC_ERROR, { parse_mode: 'HTML' });
  }
};

const handlePaymentInitiation = async (ctx: CallbackContext, data: string): Promise<void> => {
  const groupId = data.replace('pay_', '');
  const userId = ctx.from?.id?.toString();
  
  if (!userId) {
    await ctx.reply(MESSAGES.GENERIC_ERROR, { parse_mode: 'HTML' });
    return;
  }

  // Get group details
  const group = await getGroupById(groupId);
  if (!group) {
    await ctx.reply(MESSAGES.GROUP_NOT_FOUND, { parse_mode: 'HTML' });
    return;
  }

  // Create Razorpay order
  const orderData = await createPaymentOrder({
    amount: group.price_inr,
    currency: 'INR',
    receipt: `${groupId}_${userId}_${Date.now()}`,
    notes: {
      group_id: groupId,
      user_id: userId,
      telegram_user_id: userId,
    },
  });

  if (!orderData.success) {
    await ctx.reply(MESSAGES.GENERIC_ERROR, { parse_mode: 'HTML' });
    return;
  }

  // Store order ID in session
  if (ctx.session) {
    ctx.session.payment_order_id = orderData.data.id;
    ctx.session.group_id = groupId;
  }

  // Create payment URL
  const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment?order_id=${orderData.data.id}&group_id=${groupId}`;
  
  const keyboard = createInlineKeyboard([
    [{ text: '💳 Complete Payment', url: paymentUrl }],
    [{ text: '❌ Cancel', callback_data: 'cancel_payment' }],
  ]);

  await ctx.reply(MESSAGES.PAYMENT_INITIATED, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
};

const handlePaymentCancellation = async (ctx: CallbackContext): Promise<void> => {
  // Clear session
  if (ctx.session) {
    ctx.session = {};
  }
  
  await ctx.reply(MESSAGES.OPERATION_CANCELLED, { parse_mode: 'HTML' });
};

const handleBrowseGroups = async (ctx: CallbackContext): Promise<void> => {
  const browseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/groups`;
  
  const keyboard = createInlineKeyboard([
    [{ text: '🌐 Browse Groups', url: browseUrl }],
  ]);

  await ctx.reply(
    '🔍 <b>Browse Available Groups</b>\n\nClick the button below to see all available groups on our platform.',
    { parse_mode: 'HTML', reply_markup: keyboard }
  );
};

const handleHowItWorks = async (ctx: CallbackContext): Promise<void> => {
  const howItWorksMessage = `
🔧 <b>How Velto Connect Works</b>

<b>For Users:</b>
1️⃣ Browse available groups
2️⃣ Click on a group you're interested in
3️⃣ Complete secure payment via Razorpay
4️⃣ Get instant access to the Telegram group
5️⃣ Enjoy exclusive content and community

<b>Key Features:</b>
• 🔒 Secure payments with Razorpay
• ⚡ Instant access after payment
• 📱 Easy subscription management
• 🔄 Automatic renewal reminders
• 🛡️ Safe and trusted platform

<b>Payment Security:</b>
All payments are processed securely through Razorpay, India's leading payment gateway. We never store your payment information.
  `;

  await ctx.reply(howItWorksMessage, { parse_mode: 'HTML' });
};

const handleGetHelp = async (ctx: CallbackContext): Promise<void> => {
  await ctx.reply(MESSAGES.HELP, { parse_mode: 'HTML' });
};
