import { NextRequest, NextResponse } from 'next/server';
import { campaigns, campaignSubmissions } from '../../../../../data/campaignsData';
import type { Campaign } from '../../../../../types/campaigns';
import { supabaseServer as supabase } from '../../../../../lib/supabase/serverClient';
import { Notification } from '../../../../../types/notifications';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;

    const campaign = campaigns.find((c: Campaign) => c.id === campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const winners = [...campaignSubmissions]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, campaign.winnersCount || 5)
      .map((submission, index) => ({
        ...submission,
        currentRank: index + 1,
        isCurrentWinner: true,
        status: campaign.status === 'completed' ? 'winner' : submission.status
      }));

    return NextResponse.json(winners);
  } catch (error) {
    console.error('Error fetching winners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winners' },
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
    const campaign = campaigns.find((c: Campaign) => c.id === campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const statusAllowsNotify = campaign.status === 'completed' || campaign.status === 'ended';
    if (!statusAllowsNotify) {
      return NextResponse.json({ error: 'Campaign not finalized for mint notifications' }, { status: 400 });
    }

    const top = (campaign.winnersCount || 5);
    const winners = [...campaignSubmissions]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, top);

    const toUpsert = winners.map((w, idx) => {
      const userAddress: string = w.artistAddress || w.artist;
      const notifId = `mint-ready-${campaignId}-${w.id ?? idx}`;
      const payload: Notification = {
        id: notifId,
        type: 'nft',
        title: 'You won! Mint your NFT',
        message: `Your artwork "${w.title}" is a top winner. Click to mint your NFT now.`,
        timestamp: new Date().toISOString(),
        read: false,
        details: { artworkId: String(w.id ?? w.submissionIndex ?? idx), campaignId: Number(campaignId) }
      };
      return {
        id: notifId,
        user_address: userAddress,
        payload,
        read: false,
        timestamp: payload.timestamp,
      };
    });

    if (toUpsert.length) {
      const { error } = await supabase
        .from('notifications')
        .upsert(toUpsert, { onConflict: 'id,user_address' });
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({ success: true, notified: toUpsert.length });
  } catch (error) {
    console.error('Error notifying winners:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to notify winners' },
      { status: 500 }
    );
  }
}