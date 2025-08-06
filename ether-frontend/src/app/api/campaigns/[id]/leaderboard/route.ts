import { NextRequest, NextResponse } from 'next/server';
import { campaigns, campaignSubmissions } from '../../../../../data/campaignsData';
import { LeaderboardEntry } from '../../../../../types/campaigns';

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

    // Create leaderboard from submissions
    // Sort by votes in descending order and assign ranks
    const sortedSubmissions = [...campaignSubmissions]
      .sort((a, b) => b.votes - a.votes)
      .map((submission, index) => ({
        ...submission,
        currentRank: index + 1,
        isCurrentWinner: index < (campaign.winnersCount || 3)
      }));

    const leaderboard: LeaderboardEntry[] = sortedSubmissions.map((submission, index) => ({
      submissionId: submission.id,
      rank: index + 1,
      votes: submission.votes,
      uniqueVoters: submission.uniqueVoters || Math.floor(submission.votes * 0.8), // Estimate unique voters
      isWinner: index < (campaign.winnersCount || 3),
      submission: submission
    }));

    return NextResponse.json({
      campaignId,
      leaderboard,
      lastUpdated: new Date().toISOString(),
      isLive: campaign.status === 'active'
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}