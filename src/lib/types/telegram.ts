import { Context as TelegrafContext, NarrowedContext } from "telegraf";
import { CallbackQuery, Message, Update } from "telegraf/types";
// import { Update, Message, CallbackQuery } from 'telegraf/typings/core/types/typegram';

export interface BotContext extends TelegrafContext {
  session?: {
    user_id?: string;
    group_id?: string;
    payment_order_id?: string;
    step?: string;
  };
}

export type CommandContext = NarrowedContext<
  BotContext,
  Update.MessageUpdate<Message.TextMessage>
>;
export type CallbackContext = NarrowedContext<
  BotContext,
  Update.CallbackQueryUpdate<CallbackQuery>
>;

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  is_bot: boolean;
}

export interface TelegramChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
  username?: string;
}

export interface BotCommand {
  command: string;
  description: string;
}

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
  web_app?: { url: string };
}

export interface PaymentSession {
  group_id: string;
  user_id: string;
  razorpay_order_id: string;
  amount: number;
  created_at: Date;
  expires_at: Date;
}
