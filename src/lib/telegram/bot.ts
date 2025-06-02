import { Telegraf, Context } from "telegraf";
import { BotContext, BotError } from "../types/telegram";
import { logger } from "../utils/logger";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import { authMiddleware } from "./middleware/auth";
import { errorMiddleware } from "./middleware/error";
import { startCommand } from "./commands/start";
import { joinCommand } from "./commands/join";
import { statusCommand } from "./commands/status";
import { helpCommand } from "./commands/help";
import { cancelCommand } from "./commands/cancel";
import { handlePaymentCallback } from "./handlers/callback-query";

class VeltoBot {
  private bot: Telegraf<BotContext>;
  private webhookPath: string;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is required");
    }

    this.bot = new Telegraf<BotContext>(token);
    this.webhookPath = "/api/webhooks/telegram";

    this.setupMiddleware();
    this.setupCommands();
    this.setupCallbacks();
  }

  private setupMiddleware(): void {
    // Global error handling
    this.bot.use(errorMiddleware);

    // Rate limiting
    this.bot.use(rateLimitMiddleware);

    // Authentication and session management
    this.bot.use(authMiddleware);
  }

  private setupCommands(): void {
    this.bot.command("start", startCommand);
    this.bot.command("join", joinCommand);
    this.bot.command("status", statusCommand);
    this.bot.command("help", helpCommand);
    this.bot.command("cancel", cancelCommand);

    // Handle unknown commands
    this.bot.on("text", async (ctx) => {
      if (ctx.message.text.startsWith("/")) {
        await ctx.reply(
          "❌ Unknown command. Use /help to see available commands.",
          { parse_mode: "HTML" }
        );
      }
    });
  }

  private setupCallbacks(): void {
    this.bot.on("callback_query", handlePaymentCallback);
  }

  public async setWebhook(url: string): Promise<boolean> {
    try {
      const webhookUrl = `${url}${this.webhookPath}`;
      const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

      await this.bot.telegram.setWebhook(webhookUrl, {
        secret_token: webhookSecret,
        allowed_updates: ["message", "callback_query"],
        drop_pending_updates: true,
      });

      logger.info("Webhook set successfully", { url: webhookUrl });
      return true;
    } catch (error) {
      logger.error("Failed to set webhook", { error });
      return false;
    }
  }

  public async removeWebhook(): Promise<boolean> {
    try {
      await this.bot.telegram.deleteWebhook({ drop_pending_updates: true });
      logger.info("Webhook removed successfully");
      return true;
    } catch (error) {
      logger.error("Failed to remove webhook", { error });
      return false;
    }
  }

  public async handleWebhook(
    body: unknown,
    secretToken?: string
  ): Promise<void> {
    try {
      // Verify webhook secret
      const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
      if (expectedSecret && secretToken !== expectedSecret) {
        throw new BotError("Invalid webhook secret", "INVALID_SECRET", 401);
      }

      await this.bot.handleUpdate(body as any);
    } catch (error) {
      logger.error("Webhook handling failed", { error, body });
      throw error;
    }
  }

  public async checkBotPermissions(chatId: string | number): Promise<boolean> {
    try {
      const member = await this.bot.telegram.getChatMember(
        chatId,
        this.bot.botInfo?.id || 0
      );
      return member.status === "administrator";
    } catch (error) {
      logger.error("Failed to check bot permissions", { chatId, error });
      return false;
    }
  }

  public async addUserToGroup(
    chatId: string | number,
    userId: number
  ): Promise<boolean> {
    try {
      // First check if bot has admin rights
      const hasPermissions = await this.checkBotPermissions(chatId);
      if (!hasPermissions) {
        throw new BotError("Bot is not admin in the group", "NO_ADMIN_RIGHTS");
      }

      // Generate invite link for the user
      const inviteLink = await this.bot.telegram.createChatInviteLink(chatId, {
        member_limit: 1,
        expire_date: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      });

      // Send invite link to user
      await this.bot.telegram.sendMessage(
        userId,
        `🎉 Your subscription is active! Use this link to join the group:\n\n${inviteLink.invite_link}\n\n⚠️ This link expires in 1 hour and can only be used once.`,
        { parse_mode: "HTML" }
      );

      return true;
    } catch (error) {
      logger.error("Failed to add user to group", { chatId, userId, error });
      return false;
    }
  }

  public async removeUserFromGroup(
    chatId: string | number,
    userId: number
  ): Promise<boolean> {
    try {
      await this.bot.telegram.banChatMember(chatId, userId);
      // Immediately unban to allow rejoining if they subscribe again
      await this.bot.telegram.unbanChatMember(chatId, userId);
      return true;
    } catch (error) {
      logger.error("Failed to remove user from group", {
        chatId,
        userId,
        error,
      });
      return false;
    }
  }

  public async sendMessage(
    chatId: string | number,
    message: string,
    options?: { parse_mode?: "HTML" | "Markdown"; reply_markup?: unknown }
  ): Promise<boolean> {
    try {
      await this.bot.telegram.sendMessage(chatId, message, options);
      return true;
    } catch (error) {
      logger.error("Failed to send message", { chatId, error });
      return false;
    }
  }

  public getBotInstance(): Telegraf<BotContext> {
    return this.bot;
  }
}

// Singleton instance
export const veltoBot = new VeltoBot();
