import { NextRequest, NextResponse } from 'next/server';
import { campaignSubmissions } from '../../../../data/campaignsData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Filter submissions that have been minted as NFTs
    const mintedNFTs = campaignSubmissions
      .filter(submission => submission.status === 'minted' || submission.status === 'winner')
      .map(submission => ({
        ...submission,
        status: 'minted' as const,
        nftTokenId: submission.nftTokenId || `${Math.floor(Math.random() * 10000)}`,
        nftContract: submission.nftContract || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        mintTransactionHash: submission.mintTransactionHash || `0x${Math.random().toString(16).substr(2, 64)}`,
        mintedAt: submission.mintedAt || new Date().toISOString(),
        metadataUri: submission.metadataUri || `https://ipfs.io/ipfs/Qm${Math.random().toString(36).substr(2, 44)}`
      }))
      .slice(0, limit);

    return NextResponse.json(mintedNFTs);
  } catch (error) {
    console.error('Error fetching minted NFTs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch minted NFTs' },
      { status: 500 }
    );
  }
}