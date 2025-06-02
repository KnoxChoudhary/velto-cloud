import { TelegramUser } from '../../types/telegram';
import { ValidationError } from '../../types/errors';

export const validateTelegramUser = (user: TelegramUser): void => {
  if (!user) {
    throw new ValidationError('User data is required');
  }

  if (!user.id) {
    throw new ValidationError('User ID is required');
  }

  if (!user.first_name || user.first_name.trim().length === 0) {
    throw new ValidationError('User first name is required');
  }

  if (user.is_bot) {
    throw new ValidationError('Bots are not allowed');
  }
};

export const validateGroupId = (groupId: string): void => {
  if (!groupId) {
    throw new ValidationError('Group ID is required');
  }

  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(groupId)) {
    throw new ValidationError('Invalid group ID format');
  }
};

export const validatePaymentAmount = (amount: number): void => {
  if (!amount || amount <= 0) {
    throw new ValidationError('Invalid payment amount');
  }

  if (amount < 1) {
    throw new ValidationError('Minimum payment amount is ₹1');
  }

  if (amount > 100000) {
    throw new ValidationError('Maximum payment amount is ₹1,00,000');
  }
};

export const sanitizeUserInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};
