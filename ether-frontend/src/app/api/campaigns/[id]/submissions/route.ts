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

    // In a real implementation, this would fetch submissions for the specific campaign
    // For now, we'll return all submissions
    return NextResponse.json(campaignSubmissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const submissionData = await request.json();
    
    // Find the campaign
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if campaign accepts submissions
    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Campaign is not accepting submissions' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Upload image to IPFS
    // 2. Save submission to database
    // 3. Update campaign submission count
    
    const newSubmission = {
      id: `sub-${Date.now()}`,
      ...submissionData,
      submittedAt: new Date().toISOString(),
      votes: 0,
      uniqueVoters: 0,
      userVoted: false,
      status: campaign.requiresApproval ? 'pending' : 'approved',
      submissionIndex: campaignSubmissions.length,
      currentRank: campaignSubmissions.length + 1,
      isCurrentWinner: false
    };

    return NextResponse.json(newSubmission, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}