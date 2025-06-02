import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature } from '@/lib/utils/crypto';
import { handlePaymentWebhook } from '@/lib/razorpay/webhook-handler';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const headersList = headers();
    const signature = headersList.get('x-razorpay-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();
    
    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Razorpay webhook secret not configured');
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    if (!isValid) {
      logger.warn('Invalid Razorpay webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse and handle the webhook
    const webhookData = JSON.parse(body);
    await handlePaymentWebhook(webhookData);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    logger.error('Razorpay webhook error', { error });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}