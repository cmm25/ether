import { Campaign, CampaignSubmission, LeaderboardResponse, VotingResponse, CampaignResponse } from '../../types/campaigns';

// Database connection - Goldsky Hosted PostgreSQL provides this automatically
// No manual configuration needed - connection string provided after pipeline deployment

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Fetch campaigns with real-time data from Goldsky
 */
export async function fetchCampaigns(
  status?: string,
  limit: number = 20,
  offset: number = 0
): Promise<CampaignResponse> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(status && { status }),
    });

    const response = await fetch(`${API_BASE_URL}/campaigns?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
}

/**
 * Fetch real-time leaderboard for a campaign
 */
export async function fetchCampaignLeaderboard(campaignId: string): Promise<LeaderboardResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/leaderboard`);
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}

/**
 * Submit a vote for a campaign submission
 */
export async function submitVote(
  campaignId: string,
  submissionId: string,
  voterAddress: string
): Promise<VotingResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submissionId,
        voterAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit vote: ${response.statusText}`);
    }

    return await response.json();
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
 * Get campaign details with submissions
 */
export async function getCampaignDetails(campaignId: string): Promise<Campaign> {
  try {
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign details: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    throw error;
  }
}

/**
 * Get real-time vote count for a submission
 */
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
 * WebSocket connection for real-time updates
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
    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/campaigns/${this.campaignId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`Connected to campaign ${this.campaignId} WebSocket`);
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'leaderboard_update':
              this.onLeaderboardUpdate(data.payload);
              break;
            case 'vote_update':
              this.onVoteUpdate(data.payload.submissionId, data.payload.votes, data.payload.rank);
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError(new Error('WebSocket connection error'));
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.onError(error as Error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.onError(new Error('Failed to reconnect to WebSocket'));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}