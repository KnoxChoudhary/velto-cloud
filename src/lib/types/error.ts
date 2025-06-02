export class BotError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: unknown
  ) {
    super(message);
    this.name = "BotError";
  }
}

export class ValidationError extends BotError {
  constructor(message: string, context?: unknown) {
    super(message, "VALIDATION_ERROR", 400, context);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends BotError {
  constructor(message: string, context?: unknown) {
    super(message, "AUTHENTICATION_ERROR", 401, context);
    this.name = "AuthenticationError";
  }
}

export class PaymentError extends BotError {
  constructor(message: string, context?: unknown) {
    super(message, "PAYMENT_ERROR", 402, context);
    this.name = "PaymentError";
  }
}

export class TelegramApiError extends BotError {
  constructor(message: string, context?: unknown) {
    super(message, "TELEGRAM_API_ERROR", 500, context);
    this.name = "TelegramApiError";
  }
}
