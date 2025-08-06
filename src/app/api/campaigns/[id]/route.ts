import { NextRequest, NextResponse } from 'next/server';
import { campaigns, campaignSubmissions } from '../../../../data/campaignsData';

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

    // In a real implementation, this would fetch submissions from database
    // For now, we'll use the static data and associate submissions with the campaign
    const campaignWithSubmissions = {
      ...campaign,
      submissions: campaignSubmissions,
      isLive: campaign.status === 'active',
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(campaignWithSubmissions);
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const updateData = await request.json();
    
    // Find the campaign
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
    
    if (campaignIndex === -1) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // In a real implementation, this would update the database
    // For now, we'll just return the updated data
    const updatedCampaign = {
      ...campaigns[campaignIndex],
      ...updateData,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}