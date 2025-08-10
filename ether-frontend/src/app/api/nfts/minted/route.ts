import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching minted NFTs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch minted NFTs' },
      { status: 500 }
    );
  }
}