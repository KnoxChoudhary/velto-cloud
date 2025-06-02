import {
  getExpiringSubscriptions,
  getExpiredSubscriptions,
} from "../supabase/queries/subscribers";
import { veltoBot } from "../telegram/bot";
import { MESSAGES } from "../telegram/utils/messages";
import { logger } from "../utils/logger";
import { SubscriptionCheckResult } from "../types/api";

export async function checkExpiredSubscriptions(): Promise<SubscriptionCheckResult> {
  const result: SubscriptionCheckResult = {
    expired_count: 0,
    reminded_count: 0,
    removed_count: 0,
    errors: [],
  };

  try {
    // Check expiring subscriptions (remind users)
    const expiringSubscriptions = await getExpiringSubscriptions();
    result.reminded_count = expiringSubscriptions.length;

    for (const subscription of expiringSubscriptions) {
      try {
        const daysLeft = Math.ceil(
          (new Date(subscription.subscription_expires_at).getTime() -
            Date.now()) /
            (1000 * 60 * 60 * 24)
        );

        const message = MESSAGES.SUBSCRIPTION_EXPIRING_SOON.replace(
          "{groupName}",
          subscription.groups.name
        ).replace("{days}", daysLeft.toString());

        await veltoBot.sendMessage(
          parseInt(subscription.telegram_user_id),
          message,
          { parse_mode: "HTML" }
        );

        // Update last reminder sent
        await updateSubscriptionStatus(subscription.razorpay_order_id!, {
          last_reminder_sent: new Date().toISOString(),
        });
      } catch (error) {
        result.errors.push({
          subscriber_id: subscription.id,
          error: `Failed to send reminder: ${error}`,
        });
      }
    }

    // Check expired subscriptions (remove users)
    const expiredSubscriptions = await getExpiredSubscriptions();
    result.expired_count = expiredSubscriptions.length;

    for (const subscription of expiredSubscriptions) {
      try {
        // Remove user from Telegram group
        const removeSuccess = await veltoBot.removeUserFromGroup(
          subscription.groups.telegram_group_id,
          parseInt(subscription.telegram_user_id)
        );

        if (removeSuccess) {
          result.removed_count++;

          // Update subscription status
          await updateSubscriptionStatus(subscription.razorpay_order_id!, {
            subscription_status: "expired",
            removed_from_telegram: true,
          });

          // Send expiry notification
          const message = MESSAGES.SUBSCRIPTION_EXPIRED.replace(
            "{groupName}",
            subscription.groups.name
          );

          await veltoBot.sendMessage(
            parseInt(subscription.telegram_user_id),
            message,
            { parse_mode: "HTML" }
          );
        }
      } catch (error) {
        result.errors.push({
          subscriber_id: subscription.id,
          error: `Failed to remove user: ${error}`,
        });
      }
    }
  } catch (error) {
    logger.error("Subscription check failed", { error });
    result.errors.push({
      subscriber_id: "system",
      error: `System error: ${error}`,
    });
  }

  return result;
}
