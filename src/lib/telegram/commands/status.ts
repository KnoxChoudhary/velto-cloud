import { CommandContext } from "../../types/telegram";
import { getActiveSubscriptionsByUserId } from "../../supabase/queries/subscribers";
import { MESSAGES } from "../utils/messages";
import { logger } from "../../utils/logger";

export const statusCommand = async (ctx: CommandContext): Promise<void> => {
  try {
    const userId = ctx.from?.id?.toString();
    if (!userId) {
      await ctx.reply(MESSAGES.GENERIC_ERROR, { parse_mode: "HTML" });
      return;
    }

    const subscriptions = await getActiveSubscriptionsByUserId(userId);

    if (subscriptions.length === 0) {
      await ctx.reply(MESSAGES.NO_SUBSCRIPTIONS, { parse_mode: "HTML" });
      return;
    }

    let statusMessage = "📋 <b>Your Active Subscriptions:</b>\n\n";

    subscriptions.forEach((sub, index) => {
      const expiryDate = new Date(
        sub.subscription_expires_at
      ).toLocaleDateString("en-IN");
      const daysLeft = Math.ceil(
        (new Date(sub.subscription_expires_at).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );

      statusMessage += `${index + 1}. <b>${sub.groups.name}</b>\n`;
      statusMessage += `   💰 Amount: ₹${sub.amount_paid}\n`;
      statusMessage += `   📅 Expires: ${expiryDate}\n`;
      statusMessage += `   ⏰ Days left: ${daysLeft} days\n`;
      statusMessage += `   📊 Status: ${
        sub.subscription_status === "active" ? "✅ Active" : "❌ Inactive"
      }\n\n`;
    });

    await ctx.reply(statusMessage, { parse_mode: "HTML" });
  } catch (error) {
    logger.error("Status command error", { error, userId: ctx.from?.id });
    await ctx.reply(MESSAGES.GENERIC_ERROR, { parse_mode: "HTML" });
  }
};
