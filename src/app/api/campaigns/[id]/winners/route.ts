import { NextRequest, NextResponse } from 'next/server';
import { getFinalWinners } from '@/lib/goldsky/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const winners = await getFinalWinners(campaignId);
    
    return NextResponse.json({
      success: true,
      data: winners
    });
  } catch (error) {
    console.error('Error fetching campaign winners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign winners' },
      { status: 500 }
    );
  }
}