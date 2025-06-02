import { NextRequest, NextResponse } from 'next/server';
import { checkExpiredSubscriptions } from '@/lib/services/subscription-manager';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify cron job authorization (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Starting subscription check cron job');
    
    const result = await checkExpiredSubscriptions();
    
    logger.info('Subscription check completed', { result });
    
    return NextResponse.json({
      success: true,
      ...result,
    });
    
  } catch (error) {
    logger.error('Subscription checker cron error', { error });
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
