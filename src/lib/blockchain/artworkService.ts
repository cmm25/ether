import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Initialize Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// Define the chain (using Sepolia testnet for development)
const chain = defineChain(11155111); // Sepolia testnet

// Contract addresses from environment
const ARTWORK_SUBMISSION_ADDRESS = process.env.NEXT_PUBLIC_ARTWORK_SUBMISSION_ADDRESS!;

// Artwork Submission ABI (minimal required functions)
const ARTWORK_SUBMISSION_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "artworkId", "type": "uint256" }],
    "name": "getArtwork",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
          { "internalType": "address", "name": "artist", "type": "address" },
          { "internalType": "string", "name": "artworkURI", "type": "string" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "exists", "type": "bool" }
        ],
        "internalType": "struct ArtworkSubmission.Artwork",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getArtworksCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Get contract instance
const getArtworkSubmissionContract = () => {
  return getContract({
    client,
    chain,
    address: ARTWORK_SUBMISSION_ADDRESS,
    abi: ARTWORK_SUBMISSION_ABI,
  });
};

export interface ArtworkData {
  id: number;
  campaignId: number;
  artist: string;
  artworkURI: string;
  title: string;
  description: string;
  timestamp: number;
  exists: boolean;
}

export class ArtworkService {
  /**
   * Get artwork details from the blockchain
   */
  static async getArtwork(artworkId: number): Promise<ArtworkData | null> {
    try {
      const contract = getArtworkSubmissionContract();
      const artwork = await readContract({
        contract,
        method: "getArtwork",
        params: [BigInt(artworkId)],
      });

      if (!artwork.exists) {
        return null;
      }

      return {
        id: artworkId,
        campaignId: Number(artwork.campaignId),
        artist: artwork.artist,
        artworkURI: artwork.artworkURI,
        title: artwork.title,
        description: artwork.description,
        timestamp: Number(artwork.timestamp),
        exists: artwork.exists,
      };
    } catch (error) {
      console.error("Error fetching artwork:", error);
      return null;
    }
  }

  /**
   * Get total number of artworks
   */
  static async getArtworksCount(): Promise<number> {
    try {
      const contract = getArtworkSubmissionContract();
      const count = await readContract({
        contract,
        method: "getArtworksCount",
        params: [],
      });
      return Number(count);
    } catch (error) {
      console.error("Error fetching artworks count:", error);
      return 0;
    }
  }

  /**
   * Get all artworks for a specific campaign
   */
  static async getArtworksByCampaign(campaignId: number): Promise<ArtworkData[]> {
    try {
      const totalCount = await this.getArtworksCount();
      const artworks: ArtworkData[] = [];

      // Fetch all artworks and filter by campaign
      for (let i = 0; i < totalCount; i++) {
        const artwork = await this.getArtwork(i);
        if (artwork && artwork.campaignId === campaignId) {
          artworks.push(artwork);
        }
      }

      return artworks;
    } catch (error) {
      console.error("Error fetching artworks by campaign:", error);
      return [];
    }
  }

  /**
   * Get all artworks
   */
  static async getAllArtworks(): Promise<ArtworkData[]> {
    try {
      const totalCount = await this.getArtworksCount();
      const artworks: ArtworkData[] = [];

      for (let i = 0; i < totalCount; i++) {
        const artwork = await this.getArtwork(i);
        if (artwork) {
          artworks.push(artwork);
        }
      }

      return artworks;
    } catch (error) {
      console.error("Error fetching all artworks:", error);
      return [];
    }
  }

  /**
   * Convert blockchain artwork data to frontend submission format
   */
  static formatArtworkForFrontend(artwork: ArtworkData, votes: number = 0, userVoted: boolean = false): any {
    return {
      id: `artwork-${artwork.id}`,
      title: artwork.title,
      description: artwork.description,
      imageUrl: artwork.artworkURI,
      artist: artwork.artist,
      artistAddress: artwork.artist,
      artistAvatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80`, // Default avatar
      submittedAt: new Date(artwork.timestamp * 1000).toISOString(),
      votes: votes,
      uniqueVoters: Math.floor(votes * 0.8), // Estimate
      userVoted: userVoted,
      status: 'approved' as const, // Assume approved if on blockchain
      submissionIndex: artwork.id,
      ipfsHash: artwork.artworkURI,
      metadataUri: artwork.artworkURI,
      currentRank: 0, // Will be calculated based on votes
      isCurrentWinner: false, // Will be determined by ranking
      lastVoteTime: new Date().toISOString(),
    };
  }
}

export default ArtworkService;