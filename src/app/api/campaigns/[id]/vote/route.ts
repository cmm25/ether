import { NextRequest, NextResponse } from 'next/server';
import { campaigns, campaignSubmissions } from '../../../../../data/campaignsData';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const { submissionId, voterAddress } = await request.json();
    
    // Find the campaign
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if campaign is active
    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      );
    }

    // Find the submission
    const submissionIndex = campaignSubmissions.findIndex(s => s.id === submissionId);
    
    if (submissionIndex === -1) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // In a real implementation, you would:
    // 1. Check if user has already voted for this submission
    // 2. Record the vote in the database
    // 3. Update vote counts
    // 4. Trigger real-time updates via WebSocket

    // For now, we'll simulate a successful vote
    const newVoteCount = campaignSubmissions[submissionIndex].votes + 1;
    
    // Calculate new rank (simplified)
    const sortedSubmissions = [...campaignSubmissions].sort((a, b) => {
      if (a.id === submissionId) return b.votes - newVoteCount;
      if (b.id === submissionId) return newVoteCount - a.votes;
      return b.votes - a.votes;
    });
    
    const newRank = sortedSubmissions.findIndex(s => s.id === submissionId) + 1;

    return NextResponse.json({
      success: true,
      newVoteCount,
      newRank,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}` // Mock transaction hash
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}