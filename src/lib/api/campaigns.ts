import { Campaign, CampaignSubmission, LeaderboardResponse, VotingResponse, CampaignResponse } from '../../types/campaigns';

// Database connection - Goldsky Hosted PostgreSQL provides this automatically
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Fetch campaigns from blockchain
 */
export async function fetchCampaigns(
  status?: string,
  limit: number = 20,
  offset: number = 0
): Promise<CampaignResponse> {
  try {
    // Import blockchain service
    const CampaignService = (await import('../blockchain/campaignService')).default;
    
    // Fetch all campaigns from blockchain
    const blockchainCampaigns = await CampaignService.getAllCampaigns();
    
    // Format campaigns for frontend
    let formattedCampaigns = blockchainCampaigns.map(campaign =>
      CampaignService.formatCampaignForFrontend(campaign)
    );
    
    // Filter by status if provided
    if (status) {
      formattedCampaigns = formattedCampaigns.filter(campaign => campaign.status === status);
    }
    
    // Apply pagination
    const paginatedCampaigns = formattedCampaigns.slice(offset, offset + limit);
    
    return {
      campaigns: paginatedCampaigns,
      totalCount: formattedCampaigns.length,
      hasMore: offset + limit < formattedCampaigns.length
    };
  } catch (error) {
    console.error('Error fetching campaigns from blockchain:', error);
    
    // Fallback to empty response
    return {
      campaigns: [],
      totalCount: 0,
      hasMore: false
    };
  }
}

export async function fetchCampaignLeaderboard(campaignId: string): Promise<LeaderboardResponse> {
  try {
    // Import blockchain services
    const CampaignService = (await import('../blockchain/campaignService')).default;
    const ArtworkService = (await import('../blockchain/artworkService')).default;
    const VotingService = (await import('../blockchain/votingService')).default;
    
    // Convert string ID to number for blockchain call
    const numericId = parseInt(campaignId);
    if (isNaN(numericId)) {
      throw new Error('Invalid campaign ID');
    }
    
    // Fetch campaign from blockchain
    const blockchainCampaign = await CampaignService.getCampaign(numericId);
    
    if (!blockchainCampaign) {
      throw new Error('Campaign not found');
    }
    
    // Fetch artworks for this campaign
    const artworks = await ArtworkService.getArtworksByCampaign(numericId);
    
    // Fetch votes for all artworks
    const artworkIds = artworks.map(artwork => artwork.id);
    const votesData = await VotingService.getVotesForArtworks(numericId, artworkIds);
    
    // Format submissions with vote data
    const submissions = artworks.map(artwork => {
      const votes = votesData[artwork.id] || 0;
      return ArtworkService.formatArtworkForFrontend(artwork, votes, false);
    });
    
    // Sort submissions by votes (descending) and create leaderboard
    submissions.sort((a, b) => b.votes - a.votes);
    
    const winnersCount = 3; // Default winners count
    const leaderboard = submissions.map((submission, index) => ({
      submissionId: submission.id,
      rank: index + 1,
      votes: submission.votes,
      uniqueVoters: submission.uniqueVoters || Math.floor(submission.votes * 0.8),
      isWinner: index < winnersCount,
      submission: {
        ...submission,
        currentRank: index + 1,
        isCurrentWinner: index < winnersCount
      }
    }));

    const now = Date.now() / 1000;
    const isLive = !blockchainCampaign.ended && 
                   now >= blockchainCampaign.start && 
                   now <= blockchainCampaign.end;

    return {
      campaignId,
      leaderboard,
      lastUpdated: new Date().toISOString(),
      isLive
    };
  } catch (error) {
    console.error('Error fetching leaderboard from blockchain:', error);
    throw error;
  }
}

/**
 * Submit a vote for a campaign submission using blockchain
 */
export async function submitVote(
  campaignId: string,
  submissionId: string,
  voterAddress: string
): Promise<VotingResponse> {
  try {
    // For now, we'll return an error indicating that voting should be done through the UI
    throw new Error('Voting must be done through the connected wallet interface');
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
}

/**
 * Create a new campaign
 */
export async function createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
  try {
    const response = await fetch(`${API_BASE_URL}/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create campaign: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

/**
 * Submit artwork to a campaign
 */
export async function submitArtwork(
  campaignId: string,
  submissionData: Partial<CampaignSubmission>
): Promise<CampaignSubmission> {
  try {
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit artwork: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting artwork:', error);
    throw error;
  }
}

/**
 * Get campaign details with submissions from blockchain
 */
export async function getCampaignDetails(campaignId: string): Promise<Campaign> {
  try {
    // Import blockchain services
    const CampaignService = (await import('../blockchain/campaignService')).default;
    const ArtworkService = (await import('../blockchain/artworkService')).default;
    const VotingService = (await import('../blockchain/votingService')).default;
    
    // Convert string ID to number for blockchain call
    const numericId = parseInt(campaignId);
    if (isNaN(numericId)) {
      throw new Error('Invalid campaign ID');
    }
    
    // Fetch campaign from blockchain
    const blockchainCampaign = await CampaignService.getCampaign(numericId);
    
    if (!blockchainCampaign) {
      throw new Error('Campaign not found');
    }
    
    // Format for frontend
    const formattedCampaign = CampaignService.formatCampaignForFrontend(blockchainCampaign);
    
    // Fetch artworks for this campaign
    const artworks = await ArtworkService.getArtworksByCampaign(numericId);
    
    // Fetch votes for all artworks
    const artworkIds = artworks.map(artwork => artwork.id);
    const votesData = await VotingService.getVotesForArtworks(numericId, artworkIds);
    
    // Format submissions with vote data
    const submissions = artworks.map(artwork => {
      const votes = votesData[artwork.id] || 0;
      return ArtworkService.formatArtworkForFrontend(artwork, votes, false);
    });
    
    // Sort submissions by votes (descending) and assign ranks
    submissions.sort((a, b) => b.votes - a.votes);
    submissions.forEach((submission, index) => {
      submission.currentRank = index + 1;
      submission.isCurrentWinner = index < (formattedCampaign.winnersCount || 3);
    });
    
    // Calculate total votes
    const totalVotes = submissions.reduce((sum, submission) => sum + submission.votes, 0);
    
    return {
      ...formattedCampaign,
      submissions,
      totalSubmissions: submissions.length,
      totalVotes,
      isLive: formattedCampaign.status === 'active',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching campaign details from blockchain:', error);
    throw error;
  }
}

export async function getSubmissionVotes(
  campaignId: string,
  submissionId: string
): Promise<{ votes: number; uniqueVoters: number; rank: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/submissions/${submissionId}/votes`);
    if (!response.ok) {
      throw new Error(`Failed to fetch submission votes: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching submission votes:', error);
    throw error;
  }
}

/**
 * Check if user has voted for a submission
 */
export async function checkUserVote(
  campaignId: string,
  submissionId: string,
  userAddress: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/campaigns/${campaignId}/submissions/${submissionId}/votes/check?address=${userAddress}`
    );
    if (!response.ok) {
      throw new Error(`Failed to check user vote: ${response.statusText}`);
    }

    const result = await response.json();
    return result.hasVoted;
  } catch (error) {
    console.error('Error checking user vote:', error);
    return false;
  }
}

/**
 * Get campaign winners (final results)
 */
export async function getCampaignWinners(campaignId: string): Promise<CampaignSubmission[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/winners`);
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign winners: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching campaign winners:', error);
    throw error;
  }
}

/**
 * Get minted NFTs from campaigns
 */
export async function getMintedNFTs(limit: number = 50): Promise<CampaignSubmission[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/nfts/minted?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch minted NFTs: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching minted NFTs:', error);
    throw error;
  }
}

/**
 * WebSocket connection for real-time updates (disabled for now)
 */
export class CampaignWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    private campaignId: string,
    private onLeaderboardUpdate: (leaderboard: LeaderboardResponse) => void,
    private onVoteUpdate: (submissionId: string, votes: number, rank: number) => void,
    private onError: (error: Error) => void
  ) {}

  connect() {
    // WebSocket connection disabled - using blockchain polling instead
    console.log('WebSocket connection disabled - using blockchain data directly');
  }

  private attemptReconnect() {
    // No reconnection needed
  }

  disconnect() {
    // No connection to disconnect
  }

  sendMessage(message: any) {
    // No WebSocket to send messages to
  }
}