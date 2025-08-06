import { createThirdwebClient, getContract, readContract, prepareContractCall, sendTransaction } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { Account } from "thirdweb/wallets";

// Initialize Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// Define the chain (using Sepolia testnet for development)
const chain = defineChain(11155111); // Sepolia testnet

// Contract addresses from environment
const VOTING_ADDRESS = process.env.NEXT_PUBLIC_VOTING_ADDRESS!;

// Voting ABI (minimal required functions)
const VOTING_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "uint256", "name": "artworkId", "type": "uint256" }
    ],
    "name": "voteForArtwork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "uint256", "name": "artworkId", "type": "uint256" }
    ],
    "name": "getVotes",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "uint256", "name": "artworkId", "type": "uint256" },
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "hasUserVoted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUserVoteCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Get contract instance
const getVotingContract = () => {
  return getContract({
    client,
    chain,
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
  });
};

export class VotingService {
  /**
   * Vote for an artwork
   */
  static async voteForArtwork(
    account: Account,
    campaignId: number,
    artworkId: number
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const contract = getVotingContract();

      const transaction = prepareContractCall({
        contract,
        method: "voteForArtwork",
        params: [BigInt(campaignId), BigInt(artworkId)],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      return {
        success: true,
        transactionHash: result.transactionHash,
      };
    } catch (error) {
      console.error("Error voting for artwork:", error);
      
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for specific error patterns
        if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else if (error.message.includes('Already voted')) {
          errorMessage = 'You have already voted for this artwork';
        } else if (error.message.includes('Maximum votes reached')) {
          errorMessage = 'You have reached the maximum number of votes for this campaign';
        } else if (error.message.includes('Campaign not active')) {
          errorMessage = 'This campaign is not currently active';
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get vote count for an artwork
   */
  static async getVotes(campaignId: number, artworkId: number): Promise<number> {
    try {
      const contract = getVotingContract();
      const votes = await readContract({
        contract,
        method: "getVotes",
        params: [BigInt(campaignId), BigInt(artworkId)],
      });
      return Number(votes);
    } catch (error) {
      console.error("Error fetching votes:", error);
      return 0;
    }
  }

  /**
   * Check if user has voted for an artwork
   */
  static async hasUserVoted(
    campaignId: number,
    artworkId: number,
    userAddress: string
  ): Promise<boolean> {
    try {
      const contract = getVotingContract();
      const hasVoted = await readContract({
        contract,
        method: "hasUserVoted",
        params: [BigInt(campaignId), BigInt(artworkId), userAddress],
      });
      return hasVoted;
    } catch (error) {
      console.error("Error checking user vote:", error);
      return false;
    }
  }

  /**
   * Get user's total vote count for a campaign
   */
  static async getUserVoteCount(campaignId: number, userAddress: string): Promise<number> {
    try {
      const contract = getVotingContract();
      const voteCount = await readContract({
        contract,
        method: "getUserVoteCount",
        params: [BigInt(campaignId), userAddress],
      });
      return Number(voteCount);
    } catch (error) {
      console.error("Error fetching user vote count:", error);
      return 0;
    }
  }

  /**
   * Get votes for multiple artworks in a campaign
   */
  static async getVotesForArtworks(
    campaignId: number,
    artworkIds: number[]
  ): Promise<{ [artworkId: number]: number }> {
    try {
      const votes: { [artworkId: number]: number } = {};
      
      // Fetch votes for each artwork
      await Promise.all(
        artworkIds.map(async (artworkId) => {
          votes[artworkId] = await this.getVotes(campaignId, artworkId);
        })
      );

      return votes;
    } catch (error) {
      console.error("Error fetching votes for artworks:", error);
      return {};
    }
  }

  /**
   * Check user votes for multiple artworks
   */
  static async getUserVotesForArtworks(
    campaignId: number,
    artworkIds: number[],
    userAddress: string
  ): Promise<{ [artworkId: number]: boolean }> {
    try {
      const userVotes: { [artworkId: number]: boolean } = {};
      
      // Check user votes for each artwork
      await Promise.all(
        artworkIds.map(async (artworkId) => {
          userVotes[artworkId] = await this.hasUserVoted(campaignId, artworkId, userAddress);
        })
      );

      return userVotes;
    } catch (error) {
      console.error("Error checking user votes for artworks:", error);
      return {};
    }
  }
}

export default VotingService;