import { NextRequest, NextResponse } from 'next/server';
import { getCampaignVotes } from '@/lib/goldsky/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const votes = await getCampaignVotes(campaignId);
    
    return NextResponse.json({
      success: true,
      data: votes
    });
  } catch (error) {
    console.error('Error fetching campaign votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign votes' },
      { status: 500 }
    );
  }
}