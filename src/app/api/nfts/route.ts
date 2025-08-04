import { NextRequest, NextResponse } from 'next/server';
import { getNFTTransfers, getCampaignNFTs, getNFTGallery } from '@/lib/goldsky/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const type = searchParams.get('type') || 'all'; // 'all', 'transfers', 'mints'
    
    let data;
    
    switch (type) {
      case 'transfers':
        data = await getNFTTransfers(limit);
        break;
      case 'mints':
        data = await getCampaignNFTs();
        break;
      case 'gallery':
        data = await getNFTGallery(limit);
        break;
      default:
        // Get both transfers and mints
        const [transfers, mints, gallery] = await Promise.all([
          getNFTTransfers(limit),
          getCampaignNFTs(),
          getNFTGallery(limit)
        ]);
        data = {
          transfers,
          mints,
          gallery
        };
    }
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching NFT data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NFT data' },
      { status: 500 }
    );
  }
}