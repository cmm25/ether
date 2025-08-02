import { NextRequest, NextResponse } from 'next/server';
import { getNFTTransfers } from '@/lib/goldsky/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const nfts = await getNFTTransfers(limit);
    
    return NextResponse.json({
      success: true,
      data: nfts
    });
  } catch (error) {
    console.error('Error fetching NFT transfers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NFT transfers' },
      { status: 500 }
    );
  }
}