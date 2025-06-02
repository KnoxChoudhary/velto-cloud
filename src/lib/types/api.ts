import { CallbackQuery, Message } from "telegraf/types";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface WebhookPayload {
  update_id: number;
  message?: Message;
  callback_query?: CallbackQuery;
  timestamp: number;
}

export interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        method: string;
        created_at: number;
      };
    };
    order: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        created_at: number;
      };
    };
  };
  created_at: number;
}

export interface GroupJoinRequest {
  group_id: string;
  user_id: string;
  telegram_user_id: string;
  user_name: string;
  user_email?: string;
  telegram_username?: string;
}

export interface SubscriptionCheckResult {
  expired_count: number;
  reminded_count: number;
  removed_count: number;
  errors: Array<{
    subscriber_id: string;
    error: string;
  }>;
}