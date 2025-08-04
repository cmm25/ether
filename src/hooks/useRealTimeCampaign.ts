import { useState, useEffect, useCallback } from 'react';
import { 
  getAllVoteData, 
  getCampaignStatus, 
  getFinalWinners, 
  getCampaignNFTs,
  parseTopics,
  CampaignVotes,
  VoteEvents,
  CampaignAutomationTriggers,
  CampaignFinalWinners,
  CampaignNFTMints
} from '@/lib/goldsky/database';

export interface LeaderboardEntry {
  submissionId: string;
  voteCount: number;
  rank: number;
  isWinner: boolean;
}

export interface CampaignRealTimeData {
  voteData: (CampaignVotes | VoteEvents)[];
  leaderboard: LeaderboardEntry[];
  campaignStatus: string;
  finalWinners: CampaignFinalWinners[];
  nftMints: CampaignNFTMints[];
  isEnded: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Comprehensive real-time hook for all pipeline data
 */
export const useRealTimeCampaign = (campaignId: string, pollInterval: number = 1000) => {
  const [data, setData] = useState<CampaignRealTimeData>({
    voteData: [],
    leaderboard: [],
    campaignStatus: 'active',
    finalWinners: [],
    nftMints: [],
    isEnded: false,
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const pollAllData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Get all data sources in parallel
      const [votes, status, winners, nfts] = await Promise.all([
        getAllVoteData(campaignId),
        getCampaignStatus(campaignId),
        getFinalWinners(campaignId),
        getCampaignNFTs()
      ]);

      // Process votes into leaderboard
      const voteCounts: { [key: string]: number } = {};
      votes.forEach(vote => {
        const parsed = parseTopics(vote.topics);
        if (parsed.campaignId === campaignId) {
          voteCounts[parsed.submissionId] = (voteCounts[parsed.submissionId] || 0) + 1;
        }
      });

      const rankings = Object.entries(voteCounts)
        .map(([submissionId, voteCount]) => ({
          submissionId,
          voteCount,
          rank: 0,
          isWinner: false
        }))
        .sort((a, b) => b.voteCount - a.voteCount)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
          isWinner: index < 5
        }));

      const currentStatus = status[0]?.automation_status || 'active';
      const isEnded = currentStatus === 'pending_processing' || currentStatus === 'completed';

      setData({
        voteData: votes,
        leaderboard: rankings,
        campaignStatus: currentStatus,
        finalWinners: winners,
        nftMints: nfts,
        isEnded,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Failed to fetch campaign data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch campaign data'
      }));
    }
  }, [campaignId]);

  useEffect(() => {
    if (!campaignId) return;

    // Initial fetch
    pollAllData();

    // Set up polling interval
    const interval = setInterval(pollAllData, pollInterval);

    return () => clearInterval(interval);
  }, [campaignId, pollInterval, pollAllData]);

  return data;
};

/**
 * Hook for real-time vote updates for a specific submission
 */
export const useSubmissionVotes = (campaignId: string, submissionId: string, pollInterval: number = 2000) => {
  const [voteData, setVoteData] = useState({
    voteCount: 0,
    rank: 0,
    isWinner: false,
    isLoading: true,
    error: null as string | null
  });

  const fetchSubmissionVotes = useCallback(async () => {
    try {
      const votes = await getAllVoteData(campaignId);
      
      // Count votes for this specific submission
      let submissionVotes = 0;
      const allSubmissionVotes: { [key: string]: number } = {};
      
      votes.forEach(vote => {
        const parsed = parseTopics(vote.topics);
        if (parsed.campaignId === campaignId) {
          allSubmissionVotes[parsed.submissionId] = (allSubmissionVotes[parsed.submissionId] || 0) + 1;
          if (parsed.submissionId === submissionId) {
            submissionVotes++;
          }
        }
      });

      // Calculate rank
      const sortedSubmissions = Object.entries(allSubmissionVotes)
        .sort(([, a], [, b]) => b - a);
      
      const rank = sortedSubmissions.findIndex(([id]) => id === submissionId) + 1;
      const isWinner = rank > 0 && rank <= 5;

      setVoteData({
        voteCount: submissionVotes,
        rank: rank || 0,
        isWinner,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Failed to fetch submission votes:', error);
      setVoteData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch votes'
      }));
    }
  }, [campaignId, submissionId]);

  useEffect(() => {
    if (!campaignId || !submissionId) return;

    fetchSubmissionVotes();
    const interval = setInterval(fetchSubmissionVotes, pollInterval);

    return () => clearInterval(interval);
  }, [campaignId, submissionId, pollInterval, fetchSubmissionVotes]);

  return voteData;
};

/**
 * Hook for monitoring campaign status changes
 */
export const useCampaignStatus = (campaignId: string, pollInterval: number = 5000) => {
  const [statusData, setStatusData] = useState({
    status: 'active',
    endType: null as string | null,
    endTimestamp: null as string | null,
    isEnded: false,
    isLoading: true,
    error: null as string | null
  });

  const fetchStatus = useCallback(async () => {
    try {
      const status = await getCampaignStatus(campaignId);
      const latestStatus = status[0];

      if (latestStatus) {
        const isEnded = latestStatus.automation_status === 'pending_processing' || 
                       latestStatus.automation_status === 'completed';

        setStatusData({
          status: latestStatus.automation_status,
          endType: latestStatus.end_type,
          endTimestamp: latestStatus.block_timestamp,
          isEnded,
          isLoading: false,
          error: null
        });
      } else {
        setStatusData(prev => ({
          ...prev,
          isLoading: false,
          error: null
        }));
      }

    } catch (error) {
      console.error('Failed to fetch campaign status:', error);
      setStatusData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch status'
      }));
    }
  }, [campaignId]);

  useEffect(() => {
    if (!campaignId) return;

    fetchStatus();
    const interval = setInterval(fetchStatus, pollInterval);

    return () => clearInterval(interval);
  }, [campaignId, pollInterval, fetchStatus]);

  return statusData;
};

/**
 * Hook for real-time NFT gallery updates
 */
export const useNFTGallery = (pollInterval: number = 10000) => {
  const [nftData, setNftData] = useState({
    nfts: [] as CampaignNFTMints[],
    isLoading: true,
    error: null as string | null,
    lastUpdated: null as Date | null
  });

  const fetchNFTs = useCallback(async () => {
    try {
      const nfts = await getCampaignNFTs();
      
      setNftData({
        nfts,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      setNftData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch NFTs'
      }));
    }
  }, []);

  useEffect(() => {
    fetchNFTs();
    const interval = setInterval(fetchNFTs, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, fetchNFTs]);

  return nftData;
};