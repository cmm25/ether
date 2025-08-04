import { NextRequest, NextResponse } from 'next/server';
import { getCampaignStatus } from '@/lib/goldsky/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const status = await getCampaignStatus(campaignId);
    
    return NextResponse.json({
      success: true,
      data: status[0] || null
    });
  } catch (error) {
    console.error('Error fetching campaign status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign status' },
      { status: 500 }
    );
  }
}