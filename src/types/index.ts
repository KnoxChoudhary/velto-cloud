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

export interface ClerkWebhookEvent {
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      id: string;
      verification?: {
        status: string;
        strategy: string;
      };
    }>;
    username?: string;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    created_at?: number;
    updated_at?: number;
    last_sign_in_at?: number;
    banned?: boolean;
    locked?: boolean;
    verification?: {
      status: string;
      strategy: string;
    };
    two_factor_enabled?: boolean;
    backup_code_enabled?: boolean;
    totp_enabled?: boolean;
    external_accounts?: Array<{
      provider: string;
      identification_id: string;
      provider_user_id: string;
      approved_scopes: string;
      email_address: string;
      first_name: string;
      last_name: string;
      image_url: string;
      username: string;
      label: string;
      created_at: number;
      updated_at: number;
      verification: {
        status: string;
        strategy: string;
        external_verification_redirect_url: string;
        error: {
          code: string;
          long_message: string;
          message: string;
        };
        expire_at: number;
      };
    }>;
    phone_numbers?: Array<{
      id: string;
      phone_number: string;
      reserved_for_second_factor: boolean;
      default_second_factor: boolean;
      verification: {
        status: string;
        strategy: string;
      };
    }>;
    web3_wallets?: Array<{
      id: string;
      web3_wallet: string;
      verification: {
        status: string;
        strategy: string;
      };
    }>;
    passkeys?: Array<{
      id: string;
      name: string;
      last_used_at: number;
      verification: {
        status: string;
        strategy: string;
      };
    }>;
    password_enabled?: boolean;
  };
  object: string;
  type: string;
}
