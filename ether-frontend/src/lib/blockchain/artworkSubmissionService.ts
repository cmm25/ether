import { createThirdwebClient, getContract, prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { Account } from "thirdweb/wallets";
import IPFSService from "../ipfs/ipfsService";

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
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "string", "name": "artworkURI", "type": "string" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" }
    ],
    "name": "submitArtwork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUserSubmissionCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SUBMISSIONS_PER_CAMPAIGN",
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

export interface SubmitArtworkParams {
  campaignId: number;
  title: string;
  description: string;
  imageFile: File;
  artistAddress: string;
}

export interface SubmissionResult {
  success: boolean;
  transactionHash?: string;
  artworkId?: number;
  ipfsHash?: string;
  ipfsUrl?: string;
  error?: string;
}

export class ArtworkSubmissionService {
  /**
   * Submit artwork to a campaign
   */
  static async submitArtwork(
    account: Account,
    params: SubmitArtworkParams
  ): Promise<SubmissionResult> {
    try {
      console.log('=== Artwork Submission Process Started ===');
      console.log('Campaign ID:', params.campaignId);
      console.log('Title:', params.title);
      console.log('Artist:', params.artistAddress);

      // Step 1: Upload artwork to IPFS
      console.log('Step 1: Uploading artwork to IPFS...');
      const ipfsResult = await IPFSService.uploadArtwork(
        params.imageFile,
        params.title,
        params.description,
        params.artistAddress,
        params.campaignId.toString()
      );

      if (!ipfsResult.success) {
        return {
          success: false,
          error: `IPFS upload failed: ${ipfsResult.error}`,
        };
      }

      console.log('IPFS upload successful:');
      console.log('- Image Hash:', ipfsResult.imageHash);
      console.log('- Metadata Hash:', ipfsResult.metadataHash);
      console.log('- Metadata URL:', ipfsResult.metadataUrl);

      // Step 2: Validate submission limits
      console.log('Step 2: Checking submission limits...');
      const canSubmit = await this.canUserSubmit(params.campaignId, params.artistAddress);
      if (!canSubmit.allowed) {
        return {
          success: false,
          error: canSubmit.reason,
        };
      }

      // Step 3: Submit to blockchain
      console.log('Step 3: Submitting to blockchain...');
      const contract = getArtworkSubmissionContract();

      // Validate inputs before submission
      if (!params.title || params.title.length === 0 || params.title.length > 100) {
        return {
          success: false,
          error: 'Title must be between 1 and 100 characters',
        };
      }

      if (!params.description || params.description.length === 0 || params.description.length > 500) {
        return {
          success: false,
          error: 'Description must be between 1 and 500 characters',
        };
      }

      if (!ipfsResult.metadataUrl) {
        return {
          success: false,
          error: 'Invalid IPFS metadata URL',
        };
      }

      const transaction = prepareContractCall({
        contract,
        method: "submitArtwork",
        params: [
          BigInt(params.campaignId),
          ipfsResult.metadataUrl,
          params.title,
          params.description
        ],
      });

      console.log('Transaction prepared, sending...');
      const result = await sendTransaction({
        transaction,
        account,
      });

      console.log('Transaction sent successfully:');
      console.log('- Transaction Hash:', result.transactionHash);

      return {
        success: true,
        transactionHash: result.transactionHash,
        ipfsHash: ipfsResult.metadataHash,
        ipfsUrl: ipfsResult.metadataUrl,
      };
    } catch (error) {
      console.error("Error submitting artwork:", error);

      // Enhanced error handling
      let errorMessage = "Unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for specific error patterns
        if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else if (error.message.includes('Campaign not active')) {
          errorMessage = 'This campaign is not currently accepting submissions';
        } else if (error.message.includes('Maximum submissions reached')) {
          errorMessage = 'You have reached the maximum number of submissions for this campaign';
        } else if (error.message.includes('Invalid title length')) {
          errorMessage = 'Title must be between 1 and 100 characters';
        } else if (error.message.includes('Invalid description length')) {
          errorMessage = 'Description must be between 1 and 500 characters';
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if user can submit to a campaign
   */
  static async canUserSubmit(
    campaignId: number,
    userAddress: string
  ): Promise<{ allowed: boolean; reason?: string; currentCount?: number; maxAllowed?: number }> {
    try {
      const contract = getArtworkSubmissionContract();

      // Get user's current submission count for this campaign
      const currentCount = await readContract({
        contract,
        method: "getUserSubmissionCount",
        params: [BigInt(campaignId), userAddress],
      });

      // Get maximum submissions allowed per campaign
      const maxSubmissions = await readContract({
        contract,
        method: "MAX_SUBMISSIONS_PER_CAMPAIGN",
        params: [],
      });

      const currentCountNum = Number(currentCount);
      const maxSubmissionsNum = Number(maxSubmissions);

      if (currentCountNum >= maxSubmissionsNum) {
        return {
          allowed: false,
          reason: `Maximum submissions reached (${maxSubmissionsNum}) for this campaign`,
          currentCount: currentCountNum,
          maxAllowed: maxSubmissionsNum,
        };
      }

      return {
        allowed: true,
        currentCount: currentCountNum,
        maxAllowed: maxSubmissionsNum,
      };
    } catch (error) {
      console.error("Error checking submission eligibility:", error);
      return {
        allowed: false,
        reason: "Unable to verify submission eligibility",
      };
    }
  }

  /**
   * Get user's submission count for a campaign
   */
  static async getUserSubmissionCount(campaignId: number, userAddress: string): Promise<number> {
    try {
      const contract = getArtworkSubmissionContract();
      const count = await readContract({
        contract,
        method: "getUserSubmissionCount",
        params: [BigInt(campaignId), userAddress],
      });
      return Number(count);
    } catch (error) {
      console.error("Error fetching user submission count:", error);
      return 0;
    }
  }

  /**
   * Get maximum submissions allowed per campaign
   */
  static async getMaxSubmissionsPerCampaign(): Promise<number> {
    try {
      const contract = getArtworkSubmissionContract();
      const max = await readContract({
        contract,
        method: "MAX_SUBMISSIONS_PER_CAMPAIGN",
        params: [],
      });
      return Number(max);
    } catch (error) {
      console.error("Error fetching max submissions:", error);
      return 3; // Default fallback
    }
  }

  /**
   * Validate artwork file
   */
  static validateArtworkFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'File must be an image',
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 10MB',
      };
    }

    // Check supported formats
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Supported formats: JPEG, PNG, GIF, WebP',
      };
    }

    return { valid: true };
  }

  /**
   * Estimate gas cost for submission (optional utility)
   */
  static async estimateSubmissionCost(): Promise<{ estimatedGas: string; error?: string }> {
    try {
      // This would typically involve calling estimateGas on the contract
      // For now, return a rough estimate
      return {
        estimatedGas: '0.001', // ETH
      };
    } catch (error) {
      return {
        estimatedGas: '0.001',
        error: 'Unable to estimate gas cost',
      };
    }
  }
}

export default ArtworkSubmissionService;