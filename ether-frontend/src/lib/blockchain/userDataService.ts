import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Initialize Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// Define the chain (Sepolia testnet)
const chain = defineChain(11155111);

// Contract addresses
const ARTWORK_SUBMISSION_ADDRESS = process.env.NEXT_PUBLIC_ARTWORK_SUBMISSION_ADDRESS!;
const VOTING_ADDRESS = process.env.NEXT_PUBLIC_VOTING_ADDRESS!;
const GALLERY_NFT_ADDRESS = process.env.NEXT_PUBLIC_GALLERY_NFT_ADDRESS!;

// Contract ABIs
const ARTWORK_SUBMISSION_ABI = [
  {
    "inputs": [],
    "name": "getArtworksCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
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
  }
] as const;

const VOTING_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "uint256", "name": "artworkId", "type": "uint256" }
    ],
    "name": "getVoteCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const GALLERY_NFT_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "index", "type": "uint256" }
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export interface SubmittedWork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  campaignId: number;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
}

export interface ApprovedNFT {
  id: string;
  tokenId: number;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  collection?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  floorPrice?: number;
}

export class UserDataService {
  /**
   * Get all submitted works by a user
   */
  static async getSubmittedWorks(userAddress: string): Promise<SubmittedWork[]> {
    try {
      const artworkContract = getContract({
        client,
        chain,
        address: ARTWORK_SUBMISSION_ADDRESS,
        abi: ARTWORK_SUBMISSION_ABI,
      });

      const votingContract = getContract({
        client,
        chain,
        address: VOTING_ADDRESS,
        abi: VOTING_ABI,
      });

      // Get total artwork count
      const totalArtworks = await readContract({
        contract: artworkContract,
        method: "getArtworksCount",
        params: [],
      });

      const userWorks: SubmittedWork[] = [];

      // Check each artwork to see if it belongs to the user
      for (let i = 0; i < Number(totalArtworks); i++) {
        try {
          const artwork = await readContract({
            contract: artworkContract,
            method: "getArtwork",
            params: [BigInt(i)],
          });

          // Check if this artwork belongs to the user
          if (artwork.artist.toLowerCase() === userAddress.toLowerCase()) {
            // Get vote count for this artwork
            let votes = 0;
            try {
              votes = Number(await readContract({
                contract: votingContract,
                method: "getVoteCount",
                params: [artwork.campaignId, BigInt(i)],
              }));
            } catch (error) {
              console.warn(`Could not get votes for artwork ${i}:`, error);
            }

            // Parse IPFS metadata to get image URL
            let imageUrl = '';
            let parsedTitle = artwork.title;
            let parsedDescription = artwork.description;

            try {
              if (artwork.artworkURI.startsWith('https://')) {
                // Fetch metadata from IPFS
                const metadataResponse = await fetch(artwork.artworkURI);
                const metadata = await metadataResponse.json();
                imageUrl = metadata.image || '';
                parsedTitle = metadata.name || artwork.title;
                parsedDescription = metadata.description || artwork.description;
              }
            } catch (error) {
              console.warn(`Could not parse metadata for artwork ${i}:`, error);
              // Use placeholder image if metadata fetch fails
              imageUrl = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&q=80';
            }

            userWorks.push({
              id: `artwork-${i}`,
              title: parsedTitle,
              description: parsedDescription,
              imageUrl,
              campaignId: Number(artwork.campaignId),
              timestamp: Number(artwork.timestamp),
              status: 'pending', // Default status, could be enhanced
              votes,
            });
          }
        } catch (error) {
          console.warn(`Error fetching artwork ${i}:`, error);
        }
      }

      return userWorks.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching submitted works:', error);
      return [];
    }
  }

  /**
   * Get all approved NFTs owned by a user
   */
  static async getApprovedNFTs(userAddress: string): Promise<ApprovedNFT[]> {
    try {
      const nftContract = getContract({
        client,
        chain,
        address: GALLERY_NFT_ADDRESS,
        abi: GALLERY_NFT_ABI,
      });

      // Get user's NFT balance
      const balance = await readContract({
        contract: nftContract,
        method: "balanceOf",
        params: [userAddress],
      });

      const userNFTs: ApprovedNFT[] = [];

      // Get each NFT owned by the user
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await readContract({
            contract: nftContract,
            method: "tokenOfOwnerByIndex",
            params: [userAddress, BigInt(i)],
          });

          const tokenURI = await readContract({
            contract: nftContract,
            method: "tokenURI",
            params: [tokenId],
          });

          // Parse metadata
          let title = `NFT #${tokenId}`;
          let description = '';
          let imageUrl = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&q=80';

          try {
            if (tokenURI.startsWith('https://')) {
              const metadataResponse = await fetch(tokenURI);
              const metadata = await metadataResponse.json();
              title = metadata.name || title;
              description = metadata.description || '';
              imageUrl = metadata.image || imageUrl;
            }
          } catch (error) {
            console.warn(`Could not parse metadata for NFT ${tokenId}:`, error);
          }

          userNFTs.push({
            id: `nft-${tokenId}`,
            tokenId: Number(tokenId),
            title,
            description,
            imageUrl,
            collection: 'Ether Gallery',
          });
        } catch (error) {
          console.warn(`Error fetching NFT at index ${i}:`, error);
        }
      }

      return userNFTs;
    } catch (error) {
      console.error('Error fetching approved NFTs:', error);
      return [];
    }
  }

  /**
   * Get user's collections (placeholder for now)
   */
  static async getCollections(userAddress: string): Promise<Collection[]> {
    try {
      // For now, return a basic collection based on user's NFTs
      const nfts = await this.getApprovedNFTs(userAddress);
      
      if (nfts.length > 0) {
        return [
          {
            id: 'ether-gallery',
            name: 'Ether Gallery',
            description: 'Your approved artworks from Ether campaigns',
            itemCount: nfts.length,
            floorPrice: 0.1, // Placeholder
          }
        ];
      }

      return [];
    } catch (error) {
      console.error('Error fetching collections:', error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userAddress: string): Promise<{
    totalSubmissions: number;
    totalNFTs: number;
    totalVotes: number;
    totalCollections: number;
  }> {
    try {
      const [submittedWorks, approvedNFTs, collections] = await Promise.all([
        this.getSubmittedWorks(userAddress),
        this.getApprovedNFTs(userAddress),
        this.getCollections(userAddress),
      ]);

      const totalVotes = submittedWorks.reduce((sum, work) => sum + work.votes, 0);

      return {
        totalSubmissions: submittedWorks.length,
        totalNFTs: approvedNFTs.length,
        totalVotes,
        totalCollections: collections.length,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalSubmissions: 0,
        totalNFTs: 0,
        totalVotes: 0,
        totalCollections: 0,
      };
    }
  }
}

export default UserDataService;