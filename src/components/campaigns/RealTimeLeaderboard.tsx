'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardEntry, LeaderboardResponse } from '../../types/campaigns';
import { fetchCampaignLeaderboard, CampaignWebSocket } from '../../lib/api/campaigns';

interface RealTimeLeaderboardProps {
  campaignId: string;
  maxWinners?: number;
  showVoteButton?: boolean;
  onVote?: (submissionId: string) => void;
  userAddress?: string;
}

const RealTimeLeaderboard: React.FC<RealTimeLeaderboardProps> = ({
  campaignId,
  maxWinners = 5,
  showVoteButton = true,
  onVote,
  userAddress
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<CampaignWebSocket | null>(null);

  // Handle leaderboard updates from WebSocket
  const handleLeaderboardUpdate = useCallback((data: LeaderboardResponse) => {
    setLeaderboard(data.leaderboard);
    setIsLive(data.isLive);
    setLastUpdated(data.lastUpdated);
  }, []);

  // Handle individual vote updates
  const handleVoteUpdate = useCallback((submissionId: string, votes: number, rank: number) => {
    setLeaderboard(prev => 
      prev.map(entry => 
        entry.submissionId === submissionId 
          ? { ...entry, votes, rank, isWinner: rank <= maxWinners }
          : entry
      ).sort((a, b) => a.rank - b.rank)
    );
  }, [maxWinners]);

  // Handle WebSocket errors
  const handleWebSocketError = useCallback((error: Error) => {
    console.error('WebSocket error:', error);
    setError('Real-time connection lost. Data may not be current.');
  }, []);

  // Initialize data and WebSocket connection
  useEffect(() => {
    const initializeLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch initial leaderboard data
        const data = await fetchCampaignLeaderboard(campaignId);
        setLeaderboard(data.leaderboard);
        setIsLive(data.isLive);
        setLastUpdated(data.lastUpdated);

        // Set up WebSocket for real-time updates
        const websocket = new CampaignWebSocket(
          campaignId,
          handleLeaderboardUpdate,
          handleVoteUpdate,
          handleWebSocketError
        );
        
        websocket.connect();
        setWs(websocket);

      } catch (err) {
        console.error('Error initializing leaderboard:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLeaderboard();

    // Cleanup WebSocket on unmount
    return () => {
      if (ws) {
        ws.disconnect();
      }
    };
  }, [campaignId, handleLeaderboardUpdate, handleVoteUpdate, handleWebSocketError]);

  // Handle voting
  const handleVote = async (submissionId: string) => {
    if (onVote) {
      onVote(submissionId);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="w-16 h-16 bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="w-20 h-8 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/50 rounded-2xl border border-red-500/50 p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Leaderboard</h3>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Live Leaderboard</h2>
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">LIVE</span>
            </div>
          )}
        </div>
        {lastUpdated && (
          <div className="text-gray-400 text-sm">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Winner Zone */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <h3 className="text-lg font-semibold text-yellow-400">Top {maxWinners} Winners</h3>
        </div>
        
        <div className="grid gap-4">
          <AnimatePresence>
            {leaderboard.slice(0, maxWinners).map((entry, index) => (
              <motion.div
                key={entry.submissionId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  entry.isWinner 
                    ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/50' 
                    : 'bg-gray-800/50 border-gray-700'
                }`}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  index === 2 ? 'bg-amber-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {entry.rank}
                </div>

                {/* Artwork */}
                <div className="w-16 h-16 rounded-lg overflow-hidden">
                  <img 
                    src={entry.submission.imageUrl} 
                    alt={entry.submission.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{entry.submission.title}</h4>
                  <p className="text-gray-400 text-sm">by {entry.submission.artist}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-purple-400 text-sm font-medium">
                      {entry.votes} votes
                    </span>
                    <span className="text-gray-500 text-sm">
                      {entry.uniqueVoters} voters
                    </span>
                  </div>
                </div>

                {/* Vote Button */}
                {showVoteButton && (
                  <button
                    onClick={() => handleVote(entry.submissionId)}
                    disabled={entry.submission.userVoted}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      entry.submission.userVoted
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {entry.submission.userVoted ? 'Voted' : 'Vote'}
                  </button>
                )}

                {/* Winner Badge */}
                {entry.isWinner && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-yellow-400 text-xs font-medium">Winner</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Other Submissions */}
      {leaderboard.length > maxWinners && (
        <div>
          <h3 className="text-lg font-semibold text-gray-400 mb-4">Other Submissions</h3>
          <div className="space-y-3">
            {leaderboard.slice(maxWinners).map((entry) => (
              <motion.div
                key={entry.submissionId}
                layout
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50"
              >
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium text-white">
                  {entry.rank}
                </div>
                
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img 
                    src={entry.submission.imageUrl} 
                    alt={entry.submission.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-medium truncate">{entry.submission.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{entry.votes} votes</span>
                    <span>{entry.uniqueVoters} voters</span>
                  </div>
                </div>

                {showVoteButton && (
                  <button
                    onClick={() => handleVote(entry.submissionId)}
                    disabled={entry.submission.userVoted}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      entry.submission.userVoted
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {entry.submission.userVoted ? 'Voted' : 'Vote'}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {leaderboard.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 11H7v9h2v-9zm4-4H11v13h2V7zm4-4H15v17h2V3z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No submissions yet</h3>
          <p className="text-gray-400">Be the first to submit your artwork!</p>
        </div>
      )}
    </div>
  );
};

export default RealTimeLeaderboard;