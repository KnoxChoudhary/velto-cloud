import { RazorpayWebhookPayload } from '../types/api';
import { updateSubscriptionStatus } from '../supabase/queries/subscribers';
import { veltoBot } from '../telegram/bot';
import { MESSAGES } from '../telegram/utils/messages';
import { logger } from '../utils/logger';

export async function handlePaymentWebhook(payload: RazorpayWebhookPayload): Promise<void> {
  const { event } = payload;
  
  switch (event) {
    case 'payment.captured':
      await handlePaymentCaptured(payload);
      break;
    case 'payment.failed':
      await handlePaymentFailed(payload);
      break;
    default:
      logger.info('Unhandled webhook event', { event });
  }
}

async function handlePaymentCaptured(payload: RazorpayWebhookPayload): Promise<void> {
  try {
    const payment = payload.payload.payment.entity;
    const orderId = payment.order_id;
    
    // Update subscriber status
    const subscriber = await updateSubscriptionStatus(orderId, {
      payment_status: 'completed',
      razorpay_payment_id: payment.id,
      subscription_status: 'active',
    });

    if (!subscriber) {
      logger.error('Subscriber not found for payment', { orderId, paymentId: payment.id });
      return;
    }

    // Add user to Telegram group
    const success = await veltoBot.addUserToGroup(
      subscriber.groups.telegram_group_id,
      parseInt(subscriber.telegram_user_id)
    );

    if (success) {
      // Update subscriber as added to telegram
      await updateSubscriptionStatus(orderId, {
        added_to_telegram: true,
      });

      // Send success message to user
      await veltoBot.sendMessage(
        parseInt(subscriber.telegram_user_id),
        MESSAGES.PAYMENT_SUCCESS,
        { parse_mode: 'HTML' }
      );
    } else {
      logger.error('Failed to add user to group after payment', {
        userId: subscriber.telegram_user_id,
        groupId: subscriber.groups.telegram_group_id,
      });
    }

  } catch (error) {
    logger.error('Error handling payment captured', { error, payload });
  }
}

async function handlePaymentFailed(payload: RazorpayWebhookPayload): Promise<void> {
  try {
    const payment = payload.payload.payment.entity;
    const orderId = payment.order_id;
    
    // Update subscriber status
    const subscriber = await updateSubscriptionStatus(orderId, {
      payment_status: 'failed',
      razorpay_payment_id: payment.id,
    });

    if (subscriber) {
      // Send failure message to user
      await veltoBot.sendMessage(
        parseInt(subscriber.telegram_user_id),
        MESSAGES.PAYMENT_FAILED,
        { parse_mode: 'HTML' }
      );
    }

  } catch (error) {
    logger.error('Error handling payment failed', { error, payload });
  }
}
