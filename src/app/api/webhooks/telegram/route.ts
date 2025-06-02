import { NextRequest, NextResponse } from 'next/server';
import { veltoBot } from '@/lib/telegram/bot';
import { logger } from '@/lib/utils/logger';
import { BotError } from '@/lib/types/errors';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get webhook secret from headers
    const secretToken = request.headers.get('x-telegram-bot-api-secret-token');
    
    // Parse request body
    const body = await request.json();
    
    // Handle the webhook
    await veltoBot.handleWebhook(body, secretToken || undefined);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    logger.error('Telegram webhook error', { error });
    
    if (error instanceof BotError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
}
