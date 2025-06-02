export interface Creator {
  id: string;
  clerk_id: string;
  email: string;
  name: string;
  username: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  ifsc_code: string | null;
  bank_verified: boolean;
  subscription_plan: "free" | "basic" | "premium";
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  creator_id: string;
  name: string;
  telegram_group_id: string;
  invite_link: string | null;
  price_inr: number;
  description: string | null;
  subscription_duration_days: number;
  bot_is_admin: boolean;
  total_subscribers: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: string;
  group_id: string;
  name: string;
  email: string;
  telegram_username: string | null;
  telegram_user_id: string;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  payment_status: "pending" | "completed" | "failed" | "refunded";
  amount_paid: number;
  subscription_expires_at: string;
  subscription_status: "active" | "expired" | "cancelled";
  subscription_duration_days: number;
  added_to_telegram: boolean;
  removed_from_telegram: boolean;
  last_reminder_sent: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      creators: {
        Row: Creator;
        Insert: Omit<Creator, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Creator, "id" | "created_at" | "updated_at">>;
      };
      groups: {
        Row: Group;
        Insert: Omit<Group, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Group, "id" | "created_at" | "updated_at">>;
      };
      subscribers: {
        Row: Subscriber;
        Insert: Omit<Subscriber, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Subscriber, "id" | "created_at" | "updated_at">>;
      };
    };
  };
}
