import { NextRequest, NextResponse } from 'next/server';
import { campaigns, campaignSubmissions } from '../../../../../data/campaignsData';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    
    // Find the campaign
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Get winners based on vote count
    const sortedSubmissions = [...campaignSubmissions]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, campaign.winnersCount || 3)
      .map((submission, index) => ({
        ...submission,
        currentRank: index + 1,
        isCurrentWinner: true,
        status: campaign.status === 'completed' ? 'winner' : submission.status
      }));

    return NextResponse.json(sortedSubmissions);
  } catch (error) {
    console.error('Error fetching winners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winners' },
      { status: 500 }
    );
  }
}