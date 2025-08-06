import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import UserDataService from "./userDataService";

// Initialize Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// Define the chain (Sepolia testnet)
const chain = defineChain(11155111);

// Contract addresses
const CAMPAIGN_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_CAMPAIGN_MANAGER_ADDRESS!;
const ARTWORK_SUBMISSION_ADDRESS = process.env.NEXT_PUBLIC_ARTWORK_SUBMISSION_ADDRESS!;
const VOTING_ADDRESS = process.env.NEXT_PUBLIC_VOTING_ADDRESS!;

export interface Notification {
  id: string;
  type: 'artwork' | 'voting' | 'campaign' | 'nft';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  details?: {
    artworkId?: string;
    campaignId?: number;
    status?: 'approved' | 'rejected' | 'pending';
    sessionId?: string;
    sessionStatus?: 'open' | 'closed';
    transactionHash?: string;
  };
}

// Contract ABIs for events
const CAMPAIGN_MANAGER_ABI = [
  {
    "inputs": [],
    "name": "getCampaignsCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
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
  }
] as const;

export class NotificationService {
  /**
   * Generate notifications for a user based on their blockchain activity
   */
  static async getUserNotifications(userAddress: string): Promise<Notification[]> {
    try {
      const notifications: Notification[] = [];

      // Get user's submitted works and generate artwork notifications
      const submittedWorks = await UserDataService.getSubmittedWorks(userAddress);
      
      for (const work of submittedWorks) {
        // Create notification for each submitted artwork
        notifications.push({
          id: `artwork-${work.id}`,
          type: 'artwork',
          title: `Artwork ${work.status.charAt(0).toUpperCase() + work.status.slice(1)}`,
          message: `Your artwork "${work.title}" has been ${work.status}.`,
          timestamp: new Date(work.timestamp * 1000).toISOString(),
          read: false,
          details: {
            artworkId: work.id,
            campaignId: work.campaignId,
            status: work.status,
          }
        });

        // If artwork has votes, create voting notification
        if (work.votes > 0) {
          notifications.push({
            id: `votes-${work.id}`,
            type: 'voting',
            title: 'Your Artwork Received Votes!',
            message: `Your artwork "${work.title}" has received ${work.votes} vote${work.votes > 1 ? 's' : ''}!`,
            timestamp: new Date(work.timestamp * 1000 + 3600000).toISOString(), // 1 hour after submission
            read: false,
            details: {
              artworkId: work.id,
              campaignId: work.campaignId,
            }
          });
        }
      }

      // Get user's NFTs and generate NFT notifications
      const approvedNFTs = await UserDataService.getApprovedNFTs(userAddress);
      
      for (const nft of approvedNFTs) {
        notifications.push({
          id: `nft-${nft.id}`,
          type: 'nft',
          title: 'Artwork Minted as NFT!',
          message: `Your artwork "${nft.title}" has been minted as NFT #${nft.tokenId}!`,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last week
          read: false,
          details: {
            artworkId: nft.id,
          }
        });
      }

      // Add campaign notifications
      await this.addCampaignNotifications(notifications, userAddress);

      // Sort by timestamp (newest first)
      return notifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    } catch (error) {
      console.error('Error generating user notifications:', error);
      return [];
    }
  }

  /**
   * Add campaign-related notifications
   */
  private static async addCampaignNotifications(notifications: Notification[], userAddress: string): Promise<void> {
    try {
      const campaignContract = getContract({
        client,
        chain,
        address: CAMPAIGN_MANAGER_ADDRESS,
        abi: CAMPAIGN_MANAGER_ABI,
      });

      // Get total campaigns
      const totalCampaigns = await readContract({
        contract: campaignContract,
        method: "getCampaignsCount",
        params: [],
      });

      const now = Math.floor(Date.now() / 1000);
      let activeCampaignCount = 0;
      
      // Check all campaigns for active ones and recent activity
      for (let i = 0; i < Number(totalCampaigns); i++) {
        try {
          const campaign = await readContract({
            contract: campaignContract,
            method: "getCampaign",
            params: [BigInt(i)],
          });

          const startTime = Number(campaign.start);
          const endTime = Number(campaign.end);
          const isActive = startTime <= now && endTime > now && !campaign.ended;

          // Count active campaigns
          if (isActive) {
            activeCampaignCount++;
          }

          // Campaign started notification (last 24 hours)
          if (startTime <= now && startTime > now - 86400) {
            notifications.push({
              id: `campaign-start-${i}`,
              type: 'campaign',
              title: 'New Campaign Started!',
              message: `"${campaign.name}" campaign is now accepting submissions and voting!`,
              timestamp: new Date(startTime * 1000).toISOString(),
              read: false,
              details: {
                campaignId: i,
              }
            });
          }

          // Active campaign voting notification
          if (isActive) {
            notifications.push({
              id: `campaign-voting-${i}`,
              type: 'voting',
              title: 'Active Voting Campaign!',
              message: `Vote for your favorite artworks in "${campaign.name}" campaign!`,
              timestamp: new Date(Math.max(startTime * 1000, Date.now() - 12 * 60 * 60 * 1000)).toISOString(), // 12 hours ago or start time
              read: false,
              details: {
                campaignId: i,
              }
            });
          }

          // Campaign ending soon notification (24 hours)
          if (endTime > now && endTime - now < 86400 && !campaign.ended) {
            const hoursLeft = Math.ceil((endTime - now) / 3600);
            notifications.push({
              id: `campaign-ending-${i}`,
              type: 'campaign',
              title: 'Campaign Ending Soon!',
              message: `"${campaign.name}" ends in ${hoursLeft} hours. Vote now before it's too late!`,
              timestamp: new Date(now * 1000).toISOString(),
              read: false,
              details: {
                campaignId: i,
              }
            });
          }

          // Campaign ended notification (last 24 hours)
          if (campaign.ended && endTime <= now && endTime > now - 86400) {
            notifications.push({
              id: `campaign-end-${i}`,
              type: 'campaign',
              title: 'Campaign Ended!',
              message: `"${campaign.name}" voting has ended. Check the results and winners!`,
              timestamp: new Date(endTime * 1000).toISOString(),
              read: false,
              details: {
                campaignId: i,
              }
            });
          }

        } catch (error) {
          console.warn(`Error fetching campaign ${i}:`, error);
        }
      }

      // Add general active voting notification if there are active campaigns
      if (activeCampaignCount > 0) {
        notifications.push({
          id: 'active-voting-general',
          type: 'voting',
          title: `${activeCampaignCount} Active Campaign${activeCampaignCount > 1 ? 's' : ''}!`,
          message: `There ${activeCampaignCount > 1 ? 'are' : 'is'} ${activeCampaignCount} active campaign${activeCampaignCount > 1 ? 's' : ''} with voting open. Participate now!`,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          read: false,
          details: {}
        });
      }

    } catch (error) {
      console.error('Error adding campaign notifications:', error);
    }
  }

  /**
   * Get general platform notifications (not user-specific)
   */
  static async getGeneralNotifications(): Promise<Notification[]> {
    try {
      const notifications: Notification[] = [];

      // Add some general platform notifications
      notifications.push({
        id: 'platform-welcome',
        type: 'campaign',
        title: 'Welcome to Ether!',
        message: 'Start your creative journey by submitting your first artwork to an active campaign.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        read: false,
      });

      return notifications;

    } catch (error) {
      console.error('Error generating general notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read (in a real app, this would update a database)
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      // In a real implementation, you would update this in a database
      // For now, we'll just return true
      console.log(`Marking notification ${notificationId} as read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userAddress: string): Promise<boolean> {
    try {
      // In a real implementation, you would update all user notifications in a database
      console.log(`Marking all notifications as read for user ${userAddress}`);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
}

export default NotificationService;