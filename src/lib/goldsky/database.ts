import { Pool } from 'pg';

// Goldsky PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.GOLDSKY_DATABASE_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export { pool };

// Contract addresses from pipelines
export const CONTRACTS = {
  VOTING: '0xD84125E5691da5C11d918552F4fC5B8835D074F3',
  NFT: '0xE24f6761009f89cAe3a9fCC7772fd3E4924e19eD',
  CAMPAIGN: '0x0769A45dc3CAeb1B3F311B8bb9c2C1e89ebF95Ba'
};

// Interface definitions for all pipeline data
export interface CampaignNFTMints {
  transaction_hash: string;
  sender: string;
  winner_address: string;
  nft_contract: string;
  token_id: string;
  block_number: number;
  block_timestamp: string;
}

export interface CampaignVotes {
  transaction_hash: string;
  voting_contract: string;
  topics: string; // Raw topics string
  block_number: number;
  block_timestamp: string;
  log_index: number;
}

export interface VoteEvents {
  transaction_hash: string;
  voting_contract: string;
  topics: string; // Raw comma-separated topics
  block_number: number;
  block_timestamp: string;
  log_index: number;
  event_key: string;
}

export interface CampaignAutomationTriggers {
  transaction_hash: string;
  campaign_id_topic: string;
  block_number: number;
  block_timestamp: string;
  end_type: string;
  automation_status: string;
  trigger_key: string;
}

export interface CampaignFinalWinners {
  campaign_id: string;
  submission_id: string;
  final_vote_count: number;
  final_rank: number;
  is_winner: boolean;
  mint_status: string;
  winner_key: string;
}

export interface NFTTransfers {
  transaction_hash: string;
  sender: string;
  recipient: string;
  address: string;
  token_id: string;
  block_number: number;
  block_timestamp: string;
}

// Helper function to query the database
export async function queryGoldsky(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Safe data fetching with fallback
export async function safeDataFetch<T>(fetchFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    console.warn('Pipeline data unavailable:', error);
    return fallback;
  }
}

// Universal topic parser for all vote-related tables
export const parseTopics = (topics: string) => {
  const topicArray = topics.split(',').map(t => t.trim());
  return {
    eventSignature: topicArray[0] || '',
    campaignId: topicArray[1] || '',
    submissionId: topicArray[2] || '',
    voterAddress: topicArray[3] || ''
  };
};

// Real-time vote counting from multiple sources
export async function getAllVoteData(campaignId: string): Promise<(CampaignVotes | VoteEvents)[]> {
  return safeDataFetch(async () => {
    // Get from both vote tables
    const [coreVotes, eventVotes] = await Promise.all([
      queryGoldsky(`
        SELECT transaction_hash, voting_contract, topics, block_number, block_timestamp, log_index
        FROM ether_live.campaign_votes
        WHERE voting_contract = $1
        ORDER BY block_timestamp DESC
      `, [CONTRACTS.VOTING]),
      
      queryGoldsky(`
        SELECT transaction_hash, voting_contract, topics, block_number, block_timestamp, log_index, event_key
        FROM ether_live.vote_events
        WHERE voting_contract = $1
        ORDER BY block_timestamp DESC
      `, [CONTRACTS.VOTING])
    ]);

    // Combine and deduplicate by transaction_hash
    const allVotes = [...coreVotes, ...eventVotes];
    const uniqueVotes = allVotes.filter((vote, index, self) =>
      index === self.findIndex(v => v.transaction_hash === vote.transaction_hash)
    );

    // Filter by campaign ID
    return uniqueVotes.filter(vote => {
      const parsed = parseTopics(vote.topics);
      return parsed.campaignId === campaignId;
    });
  }, []);
}

// Campaign end detection
export async function getCampaignStatus(campaignId: string): Promise<CampaignAutomationTriggers[]> {
  return safeDataFetch(async () => {
    const query = `
      SELECT campaign_id_topic, end_type, automation_status, block_timestamp, transaction_hash, block_number, trigger_key
      FROM ether_live.campaign_automation_triggers
      WHERE campaign_id_topic = $1
      ORDER BY block_timestamp DESC
      LIMIT 1
    `;
    return queryGoldsky(query, [campaignId]);
  }, []);
}

// Final winners for ended campaigns
export async function getFinalWinners(campaignId: string): Promise<CampaignFinalWinners[]> {
  return safeDataFetch(async () => {
    const query = `
      SELECT campaign_id, submission_id, final_vote_count, final_rank, is_winner, mint_status, winner_key
      FROM ether_live.campaign_final_winners
      WHERE campaign_id = $1 AND is_winner = true
      ORDER BY final_rank ASC
    `;
    return queryGoldsky(query, [campaignId]);
  }, []);
}

// NFT gallery data
export async function getNFTGallery(limit = 100): Promise<NFTTransfers[]> {
  return safeDataFetch(async () => {
    const query = `
      SELECT transaction_hash, sender, recipient, address, token_id, block_timestamp
      FROM ether_gallery.nft_transfers
      WHERE address = $1
      ORDER BY block_timestamp DESC
      LIMIT $2
    `;
    return queryGoldsky(query, [CONTRACTS.NFT, limit]);
  }, []);
}

// Minted campaign winners
export async function getCampaignNFTs(): Promise<CampaignNFTMints[]> {
  return safeDataFetch(async () => {
    const query = `
      SELECT transaction_hash, sender, winner_address, nft_contract, token_id, block_number, block_timestamp
      FROM ether_live.campaign_nft_mints
      ORDER BY block_timestamp DESC
    `;
    return queryGoldsky(query);
  }, []);
}

// Legacy functions for backward compatibility
export async function getCampaignVotes(campaignId: string) {
  const votes = await getAllVoteData(campaignId);
  
  // Process votes into leaderboard format
  const voteCounts: { [key: string]: number } = {};
  votes.forEach(vote => {
    const parsed = parseTopics(vote.topics);
    if (parsed.campaignId === campaignId) {
      voteCounts[parsed.submissionId] = (voteCounts[parsed.submissionId] || 0) + 1;
    }
  });

  const rankings = Object.entries(voteCounts)
    .map(([submissionId, voteCount]) => ({
      submission_id: submissionId,
      vote_count: voteCount,
      unique_voters: voteCount, // Simplified - could be enhanced
      current_rank: 0,
      is_current_winner: false,
      last_updated: new Date().toISOString()
    }))
    .sort((a, b) => b.vote_count - a.vote_count)
    .map((item, index) => ({
      ...item,
      current_rank: index + 1,
      is_current_winner: index < 5
    }));

  return rankings;
}

export async function getNFTTransfers(limit = 100) {
  const transfers = await getNFTGallery(limit);
  
  // Convert to legacy format
  return transfers.map(transfer => ({
    transaction_hash: transfer.transaction_hash,
    from_address: transfer.sender,
    to_address: transfer.recipient,
    token_address: transfer.address,
    token_id: transfer.token_id,
    block_timestamp: transfer.block_timestamp
  }));
}

export async function getCampaignWinners(campaignId: string) {
  const winners = await getFinalWinners(campaignId);
  
  // Convert to legacy format
  return winners.map(winner => ({
    submission_id: winner.submission_id,
    vote_count: winner.final_vote_count,
    current_rank: winner.final_rank
  }));
}