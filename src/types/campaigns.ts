export interface Campaign {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'upcoming' | 'ended' | 'processing' | 'completed';
  startDate: string;
  endDate: string;
  totalSubmissions: number;
  totalVotes: number;
  prize: string;
  category: string;
  submissions: CampaignSubmission[];
  // Blockchain integration fields
  contractAddress?: string;
  chainId?: number;
  blockNumber?: number;
  transactionHash?: string;
  // Campaign settings
  maxSubmissions?: number;
  votingPeriodHours: number;
  winnersCount: number;
  requiresApproval: boolean;
  // Real-time data
  isLive?: boolean;
  lastUpdated?: string;
}

export interface CampaignSubmission {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  artist: string;
  artistAddress?: string; // Wallet address
  artistAvatar?: string;
  submittedAt: string;
  votes: number;
  uniqueVoters?: number;
  userVoted?: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'winner' | 'minted';
  // Blockchain integration
  submissionIndex?: number;
  ipfsHash?: string;
  metadataUri?: string;
  // Voting data
  currentRank?: number;
  isCurrentWinner?: boolean;
  lastVoteTime?: string;
  // NFT data (if minted)
  nftTokenId?: string;
  nftContract?: string;
  mintTransactionHash?: string;
  mintedAt?: string;
}

export interface VotingRound {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'ended' | 'processing';
  submissions: CampaignSubmission[];
  totalVotes: number;
  userCanVote: boolean;
  // Real-time leaderboard
  leaderboard?: LeaderboardEntry[];
  lastUpdated?: string;
}

export interface LeaderboardEntry {
  submissionId: string;
  rank: number;
  votes: number;
  uniqueVoters: number;
  isWinner: boolean;
  submission: CampaignSubmission;
}

// Blockchain event types
export interface VoteEvent {
  campaignId: string;
  submissionId: string;
  voterAddress: string;
  blockNumber: number;
  blockTimestamp: string;
  transactionHash: string;
}

export interface CampaignEvent {
  campaignId: string;
  eventType: 'started' | 'ended' | 'winners_selected';
  blockNumber: number;
  blockTimestamp: string;
  transactionHash: string;
}

export interface WinnerStatusChange {
  campaignId: string;
  submissionId: string;
  statusChange: 'became_winner' | 'lost_winner_status';
  newRank: number;
  voteCount: number;
  timestamp: string;
}

// NFT minting types
export interface NFTMint {
  campaignId: string;
  submissionId: string;
  winnerAddress: string;
  nftContract: string;
  tokenId: string;
  transactionHash: string;
  blockNumber: number;
  blockTimestamp: string;
  metadataUri: string;
}

// API response types
export interface CampaignResponse {
  campaigns: Campaign[];
  totalCount: number;
  hasMore: boolean;
}

export interface LeaderboardResponse {
  campaignId: string;
  leaderboard: LeaderboardEntry[];
  lastUpdated: string;
  isLive: boolean;
}

export interface VotingResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  newVoteCount?: number;
  newRank?: number;
}