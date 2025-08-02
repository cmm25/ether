import { Pool } from 'pg';

// Goldsky PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.GOLDSKY_DATABASE_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export { pool };

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

// Campaign data queries
export async function getCampaignVotes(campaignId: string) {
  const query = `
    SELECT 
      submission_id,
      vote_count,
      unique_voters,
      current_rank,
      is_current_winner,
      last_updated
    FROM ether_live.live_leaderboard 
    WHERE campaign_id = $1 
    ORDER BY current_rank ASC
  `;
  return queryGoldsky(query, [campaignId]);
}

export async function getNFTTransfers(limit = 100) {
  const query = `
    SELECT 
      transaction_hash,
      from_address,
      to_address,
      token_address,
      token_id,
      block_timestamp
    FROM ether_gallery.nft_transfers 
    ORDER BY block_timestamp DESC 
    LIMIT $1
  `;
  return queryGoldsky(query, [limit]);
}

export async function getCampaignWinners(campaignId: string) {
  const query = `
    SELECT 
      submission_id,
      vote_count,
      current_rank
    FROM ether_live.live_leaderboard 
    WHERE campaign_id = $1 
      AND is_current_winner = true
    ORDER BY current_rank ASC
  `;
  return queryGoldsky(query, [campaignId]);
}