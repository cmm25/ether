'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Campaign, CampaignSubmission } from '../../../types/campaigns';
import { getCampaignDetails, submitVote } from '../../../lib/api/campaigns';
import RealTimeLeaderboard from '../../../components/campaigns/RealTimeLeaderboard';
import AppLayout from '../../../components/Layout/AppLayout';

const CountdownTimer = ({ endDate }: { endDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex gap-4 text-center">
      <div className="bg-gray-800 rounded-lg p-3 min-w-[60px]">
        <div className="text-2xl font-bold text-purple-400">{timeLeft.days}</div>
        <div className="text-xs text-gray-400">DAYS</div>
      </div>
      <div className="bg-gray-800 rounded-lg p-3 min-w-[60px]">
        <div className="text-2xl font-bold text-purple-400">{timeLeft.hours}</div>
        <div className="text-xs text-gray-400">HRS</div>
      </div>
      <div className="bg-gray-800 rounded-lg p-3 min-w-[60px]">
        <div className="text-2xl font-bold text-purple-400">{timeLeft.minutes}</div>
        <div className="text-xs text-gray-400">MIN</div>
      </div>
      <div className="bg-gray-800 rounded-lg p-3 min-w-[60px]">
        <div className="text-2xl font-bold text-purple-400">{timeLeft.seconds}</div>
        <div className="text-xs text-gray-400">SEC</div>
      </div>
    </div>
  );
};

const SubmissionGrid = ({ 
  submissions, 
  onVote, 
  userAddress 
}: { 
  submissions: CampaignSubmission[]; 
  onVote: (submissionId: string) => void;
  userAddress?: string;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {submissions.map((submission) => (
        <motion.div
          key={submission.id}
          layout
          className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden hover:border-purple-500/50 transition-all group"
        >
          <div className="aspect-video relative overflow-hidden">
            <img 
              src={submission.imageUrl} 
              alt={submission.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                submission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                submission.status === 'winner' ? 'bg-yellow-500/20 text-yellow-400' :
                submission.status === 'minted' ? 'bg-purple-500/20 text-purple-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {submission.status}
              </span>
            </div>
            {submission.currentRank && submission.currentRank <= 5 && (
              <div className="absolute top-3 left-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  submission.currentRank === 1 ? 'bg-yellow-500 text-black' :
                  submission.currentRank === 2 ? 'bg-gray-400 text-black' :
                  submission.currentRank === 3 ? 'bg-amber-600 text-white' :
                  'bg-purple-600 text-white'
                }`}>
                  {submission.currentRank}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={submission.artistAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'} 
                alt={submission.artist}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <span className="text-gray-300 text-sm">{submission.artist}</span>
                {submission.artistAddress && (
                  <div className="text-xs text-gray-500">
                    {submission.artistAddress.slice(0, 6)}...{submission.artistAddress.slice(-4)}
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="text-white font-semibold mb-2">{submission.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{submission.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="text-gray-300">{submission.votes}</span>
                </div>
                {submission.uniqueVoters && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2 1l-3 4v7h9zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm1.5 16v-7l-3-4c-.46-.63-1.2-1-2-1H.54c-.67 0-1.26.34-1.42.87L1.5 16H4v6h3z"/>
                    </svg>
                    <span className="text-gray-500 text-sm">{submission.uniqueVoters}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => onVote(submission.id)}
                disabled={submission.userVoted}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  submission.userVoted 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {submission.userVoted ? 'Voted' : 'Vote'}
              </button>
            </div>

            {submission.isCurrentWinner && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-yellow-400 text-sm font-medium">Current Winner</span>
              </div>
            )}

            {submission.status === 'minted' && submission.nftTokenId && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-purple-400 text-sm font-medium">Minted as NFT #{submission.nftTokenId}</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'leaderboard'>('leaderboard');
  const [userAddress, setUserAddress] = useState<string>(''); // This would come from wallet connection

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        const data = await getCampaignDetails(campaignId);
        setCampaign(data);
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign details');
      } finally {
        setIsLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const handleVote = async (submissionId: string) => {
    if (!userAddress) {
      // Handle wallet connection
      alert('Please connect your wallet to vote');
      return;
    }

    try {
      const result = await submitVote(campaignId, submissionId, userAddress);
      if (result.success) {
        // Update local state optimistically
        setCampaign(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            submissions: prev.submissions.map(sub =>
              sub.id === submissionId
                ? { ...sub, votes: sub.votes + 1, userVoted: true }
                : sub
            )
          };
        });
      } else {
        alert(result.error || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to submit vote');
    }
  };

  const handleSubmitArtwork = () => {
    router.push(`/submit-artwork?campaign=${campaignId}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-7xl mx-auto p-6 sm:p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>
              <div className="h-4 bg-gray-700 rounded mb-8 w-2/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="h-64 bg-gray-700 rounded-2xl"></div>
                </div>
                <div className="h-64 bg-gray-700 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !campaign) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-7xl mx-auto p-6 sm:p-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Campaign Not Found</h3>
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => router.push('/campaigns')}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Back to Campaigns
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400';
      case 'ended': return 'bg-gray-500/20 text-gray-400';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400';
      case 'completed': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.push('/campaigns')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </button>
              <div>
                <h1 className="text-4xl font-bold">{campaign.title}</h1>
                <p className="text-gray-400 text-lg">{campaign.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>

            {/* Campaign Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{campaign.totalSubmissions}</div>
                <div className="text-sm text-gray-400">Submissions</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{campaign.totalVotes}</div>
                <div className="text-sm text-gray-400">Total Votes</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-yellow-400">{campaign.prize}</div>
                <div className="text-sm text-gray-400">Prize Pool</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-blue-400">{campaign.winnersCount}</div>
                <div className="text-sm text-gray-400">Winners</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-amber-400">{campaign.category}</div>
                <div className="text-sm text-gray-400">Category</div>
              </div>
            </div>

            {/* Countdown Timer */}
            {campaign.status === 'active' && (
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 mb-6">
                <h3 className="text-white font-semibold mb-4">Time Remaining</h3>
                <CountdownTimer endDate={campaign.endDate} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {campaign.status === 'active' && (
                <button
                  onClick={handleSubmitArtwork}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  Submit Artwork
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Live Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'submissions'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              All Submissions
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
          </div>

          {/* Content */}
          {activeTab === 'leaderboard' && (
            <RealTimeLeaderboard
              campaignId={campaignId}
              maxWinners={campaign.winnersCount}
              onVote={handleVote}
              userAddress={userAddress}
            />
          )}

          {activeTab === 'submissions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">All Submissions ({campaign.submissions.length})</h2>
              </div>
              <SubmissionGrid
                submissions={campaign.submissions}
                onVote={handleVote}
                userAddress={userAddress}
              />
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Campaign Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Start Date</label>
                    <div className="text-white">{new Date(campaign.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">End Date</label>
                    <div className="text-white">{new Date(campaign.endDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Voting Period</label>
                    <div className="text-white">{campaign.votingPeriodHours} hours</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Winners Count</label>
                    <div className="text-white">{campaign.winnersCount} submissions will be minted as NFTs</div>
                  </div>
                  {campaign.maxSubmissions && (
                    <div>
                      <label className="text-gray-400 text-sm">Max Submissions</label>
                      <div className="text-white">{campaign.maxSubmissions}</div>
                    </div>
                  )}
                  <div>
                    <label className="text-gray-400 text-sm">Approval Required</label>
                    <div className="text-white">{campaign.requiresApproval ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">1</div>
                    <div>
                      <div className="text-white font-medium">Submit Your Artwork</div>
                      <div className="text-gray-400 text-sm">Upload your digital art to participate in the campaign</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">2</div>
                    <div>
                      <div className="text-white font-medium">Community Voting</div>
                      <div className="text-gray-400 text-sm">Community members vote for their favorite submissions</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">3</div>
                    <div>
                      <div className="text-white font-medium">Winners Selected</div>
                      <div className="text-gray-400 text-sm">Top {campaign.winnersCount} submissions with most votes win</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">4</div>
                    <div>
                      <div className="text-white font-medium">NFT Minting</div>
                      <div className="text-gray-400 text-sm">Winning artworks are automatically minted as NFTs</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">5</div>
                    <div>
                      <div className="text-white font-medium">Gallery Display</div>
                      <div className="text-gray-400 text-sm">Minted NFTs are displayed in the main gallery</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}