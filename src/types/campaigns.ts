export interface Campaign {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'upcoming' | 'ended';
  startDate: string;
  endDate: string;
  totalSubmissions: number;
  totalVotes: number;
  prize: string;
  category: string;
  submissions: CampaignSubmission[];
}

export interface CampaignSubmission {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  artist: string;
  artistAvatar?: string;
  submittedAt: string;
  votes: number;
  userVoted?: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export interface VotingRound {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'ended';
  submissions: CampaignSubmission[];
  totalVotes: number;
  userCanVote: boolean;
}