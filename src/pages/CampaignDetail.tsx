'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { campaigns, campaignSubmissions } from '../data/campaignsData';
import { Campaign, CampaignSubmission } from '../types/campaigns';
import { ArrowLeft, Heart, User, Calendar, Trophy, Users, Vote } from 'lucide-react';

interface CampaignDetailPageProps {
  campaignId: string;
}

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
    <div className="flex gap-3">
      <div className="bg-gray-800 rounded-lg p-3 text-center min-w-[60px]">
        <div className="text-xl font-bold text-amber-400">{timeLeft.days}</div>
        <div className="text-xs text-gray-400">DAYS</div>
      </div>
      <div className="bg-gray-800 rounded-lg p-3 text-center min-w-[60px]">
        <div className="text-xl font-bold text-amber-400">{timeLeft.hours}</div>
        <div className="text-xs text-gray-400">HRS</div>
      </div>
      <div className="bg-gray-800 rounded-lg p-3 text-center min-w-[60px]">
        <div className="text-xl font-bold text-amber-400">{timeLeft.minutes}</div>
        <div className="text-xs text-gray-400">MIN</div>
      </div>
      <div className="bg-gray-800 rounded-lg p-3 text-center min-w-[60px]">
        <div className="text-xl font-bold text-amber-400">{timeLeft.seconds}</div>
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
      
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={submission.artistAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'} 
            alt={submission.artist}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h4 className="text-white font-medium">{submission.artist}</h4>
            <p className="text-gray-400 text-sm">
              {new Date(submission.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <h3 className="text-white font-semibold text-lg mb-2">{submission.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{submission.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className={`w-5 h-5 ${submission.userVoted ? 'text-red-400 fill-current' : 'text-purple-400'}`} />
            <span className="text-gray-300 font-medium">{submission.votes}</span>
            <span className="text-gray-500 text-sm">votes</span>
          </div>
          
          <button
            onClick={() => onVote(submission.id)}
            disabled={submission.userVoted}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              submission.userVoted 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <Vote className="w-4 h-4" />
            {submission.userVoted ? 'Voted' : 'Vote'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CampaignDetailPage({ campaignId }: CampaignDetailPageProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<CampaignSubmission[]>([]);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    const foundCampaign = campaigns.find(c => c.id === campaignId);
    if (foundCampaign && foundCampaign.status === 'active') {
      setCampaign(foundCampaign);
      // In a real app, this would fetch all submissions for the campaign
      // For now, we'll use all campaign submissions as if they belong to this campaign
      setSubmissions(campaignSubmissions);
    } else if (foundCampaign && foundCampaign.status !== 'active') {
      // Redirect back to campaigns if not active
      router.push('/campaigns');
    }
  }, [campaignId]);

  const handleVote = (submissionId: string) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId 
        ? { ...sub, votes: sub.votes + 1, userVoted: true }
        : sub
    ));
  };

  const filteredSubmissions = submissions.filter(sub => 
    filter === 'all' || sub.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400';
      case 'ended': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (!campaign) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">{campaign.title}</h1>
            <p className="text-gray-400 mt-1">Campaign Details & Submissions</p>
          </div>
        </div>

        {/* Campaign Info */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">{campaign.category}</span>
              </div>
              
              <p className="text-gray-300 text-lg mb-6">{campaign.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-2xl font-bold text-purple-400">{campaign.totalSubmissions}</span>
                  </div>
                  <div className="text-sm text-gray-400">Submissions</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Vote className="w-5 h-5 text-green-400" />
                    <span className="text-2xl font-bold text-green-400">{campaign.totalVotes}</span>
                  </div>
                  <div className="text-sm text-gray-400">Total Votes</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="text-lg font-bold text-amber-400">Gallery</span>
                  </div>
                  <div className="text-sm text-gray-400">Prize</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-lg font-bold text-blue-400">
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">End Date</div>
                </div>
              </div>
            </div>
            
            {campaign.status === 'active' && (
              <div className="lg:w-80">
                <h3 className="text-white font-semibold mb-3">Time Remaining</h3>
                <CountdownTimer endDate={campaign.endDate} />
              </div>
            )}
          </div>
        </div>

        {/* Submissions Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">All Submissions ({filteredSubmissions.length})</h2>
            
            <div className="flex gap-2">
              {(['all', 'approved', 'pending', 'rejected'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-1 text-xs">
                      ({submissions.filter(s => s.status === status).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No submissions found</h3>
              <p className="text-gray-400">
                {filter === 'all' 
                  ? 'This campaign has no submissions yet.' 
                  : `No ${filter} submissions in this campaign.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubmissions.map(submission => (
                <SubmissionCard 
                  key={submission.id} 
                  submission={submission} 
                  onVote={handleVote}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}