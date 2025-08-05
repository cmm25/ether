import { createThirdwebClient, getContract, prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { Account } from "thirdweb/wallets";

// Initialize Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// Define the chain (using Sepolia testnet for development)
const chain = defineChain(11155111); // Sepolia testnet

// Contract addresses from environment
const CAMPAIGN_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_CAMPAIGN_MANAGER_ADDRESS!;
const ARTWORK_SUBMISSION_ADDRESS = process.env.NEXT_PUBLIC_ARTWORK_SUBMISSION_ADDRESS!;
const VOTING_ADDRESS = process.env.NEXT_PUBLIC_VOTING_ADDRESS!;

// Campaign Manager ABI (minimal required functions)
const CAMPAIGN_MANAGER_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "start", "type": "uint256" },
      { "internalType": "uint256", "name": "end", "type": "uint256" }
    ],
    "name": "createCampaign",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "campaignId", "type": "uint256" }],
    "name": "getCampaign",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "start", "type": "uint256" },
          { "internalType": "uint256", "name": "end", "type": "uint256" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "bool", "name": "ended", "type": "bool" },
          { "internalType": "uint256[]", "name": "artworkIds", "type": "uint256[]" }
        ],
        "internalType": "struct CampaignManager.Campaign",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCampaignsCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCreationFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "campaignId", "type": "uint256" }],
    "name": "isCampaignActive",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "uint256[]", "name": "topArtworkIds", "type": "uint256[]" }
    ],
    "name": "endCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Get contract instances
const getCampaignManagerContract = () => {
  return getContract({
    client,
    chain,
    address: CAMPAIGN_MANAGER_ADDRESS,
    abi: CAMPAIGN_MANAGER_ABI,
  });
};

const getArtworkSubmissionContract = () => {
  return getContract({
    client,
    chain,
    address: ARTWORK_SUBMISSION_ADDRESS,
  });
};

const getVotingContract = () => {
  return getContract({
    client,
    chain,
    address: VOTING_ADDRESS,
  });
};

export interface CreateCampaignParams {
  name: string;
  description: string;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
}

export interface CampaignData {
  id: number;
  name: string;
  description: string;
  start: number;
  end: number;
  creator: string;
  ended: boolean;
  artworkIds: number[];
}

export class CampaignService {
  /**
   * Create a new campaign on the blockchain
   */
  static async createCampaign(
    account: Account,
    params: CreateCampaignParams
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      console.log('=== CampaignService Debug ===');
      console.log('Contract Address:', CAMPAIGN_MANAGER_ADDRESS);
      console.log('Chain ID:', chain.id);
      console.log('Account:', account.address);
      console.log('Params:', params);

      const contract = getCampaignManagerContract();

      // First, let's verify the contract exists by checking the creation fee
      let creationFee: bigint;
      try {
        creationFee = await readContract({
          contract,
          method: "getCreationFee",
          params: [],
        });
        console.log('Creation fee (wei):', creationFee.toString());
        console.log('Creation fee (ETH):', (Number(creationFee) / 1e18).toString());
      } catch (readError) {
        console.error('Failed to read creation fee:', readError);
        return {
          success: false,
          error: `Contract not found or not deployed on this network. Please check the contract address: ${CAMPAIGN_MANAGER_ADDRESS}`,
        };
      }

      // Validate parameters
      const now = Math.floor(Date.now() / 1000);
      if (params.startTime <= now) {
        return {
          success: false,
          error: 'Start time must be in the future',
        };
      }

      if (params.endTime <= params.startTime) {
        return {
          success: false,
          error: 'End time must be after start time',
        };
      }

      const duration = params.endTime - params.startTime;
      if (duration < 3600) {
        return {
          success: false,
          error: 'Campaign duration must be at least 1 hour',
        };
      }

      if (duration > 365 * 24 * 3600) {
        return {
          success: false,
          error: 'Campaign duration cannot exceed 365 days',
        };
      }

      if (params.name.length === 0 || params.name.length > 100) {
        return {
          success: false,
          error: 'Campaign name must be between 1 and 100 characters',
        };
      }

      if (params.description.length === 0 || params.description.length > 1000) {
        return {
          success: false,
          error: 'Campaign description must be between 1 and 1000 characters',
        };
      }

      console.log('=== Parameter Validation Passed ===');
      console.log('Name:', params.name, 'Length:', params.name.length);
      console.log('Description:', params.description, 'Length:', params.description.length);
      console.log('Start Time:', params.startTime, 'Date:', new Date(params.startTime * 1000).toISOString());
      console.log('End Time:', params.endTime, 'Date:', new Date(params.endTime * 1000).toISOString());
      console.log('Duration (hours):', duration / 3600);
      console.log('Creation fee:', creationFee.toString(), 'wei');

      // Prepare the transaction
      const transaction = prepareContractCall({
        contract,
        method: "createCampaign",
        params: [params.name, params.description, BigInt(params.startTime), BigInt(params.endTime)],
        value: creationFee,
      });

      console.log('=== Transaction Prepared ===');
      console.log('Transaction:', transaction);

      // Send the transaction
      const result = await sendTransaction({
        transaction,
        account,
      });

      console.log('=== Transaction Sent ===');
      console.log('Result:', result);

      return {
        success: true,
        transactionHash: result.transactionHash,
      };
    } catch (error) {
      console.error("Error creating campaign:", error);

      // Enhanced error handling
      let errorMessage = "Unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for specific error patterns
        if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again';
        } else if (error.message.includes('Internal JSON-RPC error')) {
          errorMessage = 'Network RPC error. Please try again or switch networks';
        }
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as Record<string, unknown>;

        if ('message' in errorObj) {
          errorMessage = String(errorObj.message);
        } else if ('reason' in errorObj) {
          errorMessage = String(errorObj.reason);
        } else if ('code' in errorObj) {
          if (errorObj.code === 4001) {
            errorMessage = 'Transaction was rejected by user';
          } else if (errorObj.code === -32603) {
            errorMessage = 'Internal JSON-RPC error. Please check your network connection and contract deployment';
          } else {
            errorMessage = `Transaction failed with code: ${errorObj.code}`;
          }
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get campaign details from the blockchain
   */
  static async getCampaign(campaignId: number): Promise<CampaignData | null> {
    try {
      const contract = getCampaignManagerContract();
      const campaign = await readContract({
        contract,
        method: "getCampaign",
        params: [BigInt(campaignId)],
      });

      return {
        id: campaignId,
        name: campaign.name,
        description: campaign.description,
        start: Number(campaign.start),
        end: Number(campaign.end),
        creator: campaign.creator,
        ended: campaign.ended,
        artworkIds: campaign.artworkIds.map((id: bigint) => Number(id)),
      };
    } catch (error) {
      console.error("Error fetching campaign:", error);
      return null;
    }
  }

  /**
   * Get total number of campaigns
   */
  static async getCampaignsCount(): Promise<number> {
    try {
      const contract = getCampaignManagerContract();
      const count = await readContract({
        contract,
        method: "getCampaignsCount",
        params: [],
      });
      return Number(count);
    } catch (error) {
      console.error("Error fetching campaigns count:", error);
      return 0;
    }
  }

  /**
   * Get all campaigns from the blockchain
   */
  static async getAllCampaigns(): Promise<CampaignData[]> {
    try {
      const count = await this.getCampaignsCount();
      const campaigns: CampaignData[] = [];

      for (let i = 0; i < count; i++) {
        const campaign = await this.getCampaign(i);
        if (campaign) {
          campaigns.push(campaign);
        }
      }

      return campaigns;
    } catch (error) {
      console.error("Error fetching all campaigns:", error);
      return [];
    }
  }

  /**
   * Check if a campaign is currently active
   */
  static async isCampaignActive(campaignId: number): Promise<boolean> {
    try {
      const contract = getCampaignManagerContract();
      const isActive = await readContract({
        contract,
        method: "isCampaignActive",
        params: [BigInt(campaignId)],
      });
      return isActive;
    } catch (error) {
      console.error("Error checking campaign status:", error);
      return false;
    }
  }

  /**
   * End a campaign (only creator can do this)
   */
  static async endCampaign(
    account: Account,
    campaignId: number,
    topArtworkIds: number[]
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const contract = getCampaignManagerContract();

      const transaction = prepareContractCall({
        contract,
        method: "endCampaign",
        params: [BigInt(campaignId), topArtworkIds.map(id => BigInt(id))],
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
      console.error("Error ending campaign:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get creation fee in wei
   */
  static async getCreationFee(): Promise<bigint> {
    try {
      const contract = getCampaignManagerContract();
      return await readContract({
        contract,
        method: "getCreationFee",
        params: [],
      });
    } catch (error) {
      console.error("Error fetching creation fee:", error);
      return BigInt(0);
    }
  }

  /**
   * Convert blockchain campaign data to frontend format
   */
  static formatCampaignForFrontend(campaign: CampaignData): any {
    const now = Date.now() / 1000;
    let status: 'upcoming' | 'active' | 'ended' = 'upcoming';

    if (campaign.ended) {
      status = 'ended';
    } else if (now >= campaign.start && now <= campaign.end) {
      status = 'active';
    } else if (now > campaign.end) {
      status = 'ended';
    }

    return {
      id: campaign.id.toString(),
      title: campaign.name,
      description: campaign.description,
      status,
      startDate: new Date(campaign.start * 1000).toISOString(),
      endDate: new Date(campaign.end * 1000).toISOString(),
      totalSubmissions: campaign.artworkIds.length,
      totalVotes: 0, // This would need to be fetched from voting contract
      prize: 'Featured in Gallery',
      category: 'Digital Art', // This could be enhanced to store category on-chain
      submissions: [],
      creator: campaign.creator,
      transactionHash: '', // This could be stored if needed
      winnersCount: 3, // Default value, could be made configurable
      votingPeriodHours: Math.floor((campaign.end - campaign.start) / 3600),
      requiresApproval: false,
    };
  }
}

export default CampaignService;