export interface Creator {
  id: string;
  clerk_id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  creator_id: string;
  name: string;
  telegram_group_id?: string;
  invite_link: string;
  price_inr: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: string;
  group_id: string;
  name: string;
  email: string;
  telegram_username: string;
  telegram_user_id?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  payment_status: "pending" | "completed" | "failed";
  amount_paid?: number;
  added_to_telegram: boolean;
  created_at: string;
  updated_at: string;
}
