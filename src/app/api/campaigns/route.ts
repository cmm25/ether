import { NextRequest, NextResponse } from 'next/server';
import { campaigns } from '../../../data/campaignsData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredCampaigns = campaigns;

    // Filter by status if provided
    if (status) {
      filteredCampaigns = campaigns.filter(campaign => campaign.status === status);
    }

    // Apply pagination
    const paginatedCampaigns = filteredCampaigns.slice(offset, offset + limit);

    return NextResponse.json({
      campaigns: paginatedCampaigns,
      totalCount: filteredCampaigns.length,
      hasMore: offset + limit < filteredCampaigns.length
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const campaignData = await request.json();
    
    // In a real implementation, this would save to database
    // For now, we'll just return the data with a generated ID
    const newCampaign = {
      id: `camp-${Date.now()}`,
      ...campaignData,
      totalSubmissions: 0,
      totalVotes: 0,
      submissions: [],
      votingPeriodHours: campaignData.votingPeriodHours || 168, // 7 days default
      winnersCount: campaignData.winnersCount || 3,
      requiresApproval: campaignData.requiresApproval || false,
      isLive: true,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}