'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Campaign, VotingRound, CampaignSubmission } from '../types/campaigns';
import CreateCampaignForm from '../components/CreateCampaignForm';
import { useCampaigns } from '../hooks/useCampaigns';
import { useWallet } from '../hooks/useWallet';

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

const SubmissionCard = ({ submission, onVote }: { submission: CampaignSubmission; onVote: (id: string) => void }) => {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden hover:border-purple-500/50 transition-all group">
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
            'bg-red-500/20 text-red-400'
          }`}>
            {submission.status}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <img 
            src={submission.artistAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'} 
            alt={submission.artist}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-gray-300 text-sm">{submission.artist}</span>
        </div>
        
        <h3 className="text-white font-semibold mb-2">{submission.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{submission.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="text-gray-300">{submission.votes}</span>
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
      </div>
    </div>
  );
};

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const router = useRouter();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400';
      case 'ended': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleCampaignClick = () => {
    if (campaign.status === 'active') {
      router.push(`/campaigns/${campaign.id}`);
    }
  };

  return (
    <div 
      className={`bg-gray-900/50 rounded-2xl border border-gray-800 p-6 transition-all ${
        campaign.status === 'active' 
          ? 'hover:border-purple-500/50 cursor-pointer group' 
          : 'opacity-75'
      }`}
      onClick={handleCampaignClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{campaign.title}</h2>
          <p className="text-gray-400">{campaign.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
          {campaign.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{campaign.totalSubmissions}</div>
          <div className="text-sm text-gray-400">Submissions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{campaign.totalVotes}</div>
          <div className="text-sm text-gray-400">Total Votes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-400">{campaign.prize}</div>
          <div className="text-sm text-gray-400">Prize Pool</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{campaign.category}</div>
          <div className="text-sm text-gray-400">Category</div>
        </div>
      </div>
      
      {campaign.status === 'active' && (
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Time Remaining</h3>
          <CountdownTimer endDate={campaign.endDate} />
        </div>
      )}
      
      {campaign.submissions.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-4">Featured Submissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaign.submissions.slice(0, 3).map(submission => (
              <div key={submission.id} className="aspect-video relative rounded-lg overflow-hidden">
                <img 
                  src={submission.imageUrl} 
                  alt={submission.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-end p-3">
                  <div>
                    <div className="text-white font-medium text-sm">{submission.title}</div>
                    <div className="text-gray-300 text-xs">{submission.artist}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const VotingRoundCard = ({ round, onVote }: { round: VotingRound; onVote: (submissionId: string) => void }) => {
  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{round.title}</h3>
          <p className="text-gray-400">{round.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          round.status === 'active' ? 'bg-green-500/20 text-green-400' :
          round.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {round.status}
        </span>
      </div>
      
      {round.status === 'active' && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3">Voting Ends In</h4>
          <CountdownTimer endDate={round.endDate} />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {round.submissions.map(submission => (
          <SubmissionCard 
            key={submission.id} 
            submission={submission} 
            onVote={onVote}
          />
        ))}
      </div>
    </div>
  );
};

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'voting'>('campaigns');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Use blockchain data instead of mock data
  const { 
    campaigns: campaignData, 
    isLoading, 
    error,
    getActiveCampaigns,
    getUpcomingCampaigns,
    getEndedCampaigns,
    fetchCampaigns
  } = useCampaigns();
  
  const { isConnected } = useWallet();

  const handleVote = (submissionId: string) => {
    // TODO: Implement blockchain voting
    console.log('Voting for submission:', submissionId);
  };

  const handleCreateCampaign = (newCampaign: Campaign) => {
    // Campaign creation is handled by the blockchain service
    // The campaigns list will be automatically refreshed
    console.log('Campaign created:', newCampaign);
  };

  const activeCampaigns = getActiveCampaigns();
  const upcomingCampaigns = getUpcomingCampaigns();
  const endedCampaigns = getEndedCampaigns();

  // For now, use empty arrays for voting rounds until voting is implemented
  const activeVotingRounds: VotingRound[] = [];
  const upcomingVotingRounds: VotingRound[] = [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Campaigns & Voting</h1>
            <p className="text-gray-400 text-lg">Participate in art campaigns and vote for your favorite submissions</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Create Campaign
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'campaigns'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('voting')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'voting'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Active Voting
          </button>
        </div>

        {activeTab === 'campaigns' ? (
          <div className="space-y-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading campaigns from blockchain...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Error Loading Campaigns</h3>
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchCampaigns}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {activeCampaigns.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-green-400">Active Campaigns</h2>
                    <div className="space-y-6">
                      {activeCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                      ))}
                    </div>
                  </div>
                )}

                {upcomingCampaigns.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-blue-400">Upcoming Campaigns</h2>
                    <div className="space-y-6">
                      {upcomingCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                      ))}
                    </div>
                  </div>
                )}

                {endedCampaigns.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-400">Past Campaigns</h2>
                    <div className="space-y-6">
                      {endedCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                      ))}
                    </div>
                  </div>
                )}

                {campaignData.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Campaigns Yet</h3>
                    <p className="text-gray-400 mb-4">Be the first to create a campaign on the blockchain!</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium"
                    >
                      Create First Campaign
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {activeVotingRounds.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-green-400">Active Voting Rounds</h2>
                <div className="space-y-6">
                  {activeVotingRounds.map(round => (
                    <VotingRoundCard key={round.id} round={round} onVote={handleVote} />
                  ))}
                </div>
              </div>
            )}

            {upcomingVotingRounds.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-blue-400">Upcoming Voting Rounds</h2>
                <div className="space-y-6">
                  {upcomingVotingRounds.map(round => (
                    <VotingRoundCard key={round.id} round={round} onVote={handleVote} />
                  ))}
                </div>
              </div>
            )}

            {activeVotingRounds.length === 0 && upcomingVotingRounds.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v9h2v-9zm4-4H11v13h2V7zm4-4H15v17h2V3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No active voting rounds</h3>
                <p className="text-gray-400">Check back later for new voting opportunities.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateCampaignForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateCampaign}
      />
    </div>
  );
}