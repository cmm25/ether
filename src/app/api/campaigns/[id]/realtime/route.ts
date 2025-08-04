import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllVoteData, 
  getCampaignStatus, 
  getFinalWinners, 
  getCampaignNFTs,
  parseTopics
} from '@/lib/goldsky/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    
    // Get all data sources in parallel
    const [votes, status, winners, nfts] = await Promise.all([
      getAllVoteData(campaignId),
      getCampaignStatus(campaignId),
      getFinalWinners(campaignId),
      getCampaignNFTs()
    ]);

    // Process votes into leaderboard
    const voteCounts: { [key: string]: number } = {};
    votes.forEach(vote => {
      const parsed = parseTopics(vote.topics);
      if (parsed.campaignId === campaignId) {
        voteCounts[parsed.submissionId] = (voteCounts[parsed.submissionId] || 0) + 1;
      }
    });

    const leaderboard = Object.entries(voteCounts)
      .map(([submissionId, voteCount]) => ({
        submissionId,
        voteCount,
        rank: 0,
        isWinner: false
      }))
      .sort((a, b) => b.voteCount - a.voteCount)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        isWinner: index < 5
      }));

    const currentStatus = status[0]?.automation_status || 'active';
    const isEnded = currentStatus === 'pending_processing' || currentStatus === 'completed';

    return NextResponse.json({
      success: true,
      data: {
        voteData: votes,
        leaderboard,
        campaignStatus: currentStatus,
        finalWinners: winners,
        nftMints: nfts,
        isEnded,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching real-time campaign data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch real-time campaign data' },
      { status: 500 }
    );
  }
}