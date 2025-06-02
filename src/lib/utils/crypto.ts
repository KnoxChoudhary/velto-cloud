import crypto from 'crypto';

export const generateWebhookSecret = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

export const hashUserId = (userId: string): string => {
  return crypto
    .createHash('sha256')
    .update(userId)
    .digest('hex')
    .substring(0, 16);
};