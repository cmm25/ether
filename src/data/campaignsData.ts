import { Campaign, CampaignSubmission, VotingRound } from '../types/campaigns';

export const campaignSubmissions: CampaignSubmission[] = [
  {
    id: 'sub-1',
    title: 'Digital Dreamscape',
    description: 'An abstract digital artwork exploring the boundaries between reality and imagination.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    artist: 'Alex Chen',
    artistAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    submittedAt: '2024-01-15T10:30:00Z',
    votes: 127,
    userVoted: false,
    status: 'approved'
  },
  {
    id: 'sub-2',
    title: 'Neon Cityscape',
    description: 'A vibrant cyberpunk-inspired cityscape with neon lights and futuristic architecture.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    artist: 'Maya Rodriguez',
    artistAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80',
    submittedAt: '2024-01-14T15:45:00Z',
    votes: 89,
    userVoted: true,
    status: 'approved'
  },
  {
    id: 'sub-3',
    title: 'Abstract Geometry',
    description: 'Geometric patterns and shapes creating a mesmerizing visual experience.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    artist: 'Jordan Kim',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    submittedAt: '2024-01-13T09:20:00Z',
    votes: 156,
    userVoted: false,
    status: 'pending'
  },
  {
    id: 'sub-4',
    title: 'Ocean Waves',
    description: 'A serene digital representation of ocean waves in motion.',
    imageUrl: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80',
    artist: 'Sam Taylor',
    artistAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    submittedAt: '2024-01-12T14:10:00Z',
    votes: 203,
    userVoted: true,
    status: 'approved'
  },
  {
    id: 'sub-5',
    title: 'Cosmic Journey',
    description: 'An exploration of space and time through digital artistry.',
    imageUrl: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&q=80',
    artist: 'Riley Park',
    artistAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    submittedAt: '2024-01-11T11:30:00Z',
    votes: 78,
    userVoted: false,
    status: 'approved'
  }
];

export const campaigns: Campaign[] = [
  {
    id: 'camp-1',
    title: 'Digital Art Revolution',
    description: 'Showcase the future of digital art with cutting-edge techniques and innovative concepts.',
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-02-01T23:59:59Z',
    totalSubmissions: 45,
    totalVotes: 1247,
    prize: 'Featured in Gallery',
    category: 'Digital Art',
    submissions: campaignSubmissions.slice(0, 3)
  },
  {
    id: 'camp-2',
    title: 'Abstract Expressions',
    description: 'Explore the boundaries of abstract art in the digital realm.',
    status: 'upcoming',
    startDate: '2024-02-15T00:00:00Z',
    endDate: '2024-03-15T23:59:59Z',
    totalSubmissions: 0,
    totalVotes: 0,
    prize: 'Featured in Gallery',
    category: 'Abstract',
    submissions: []
  },
  {
    id: 'camp-3',
    title: 'Nature & Technology',
    description: 'Blend natural elements with technological innovation.',
    status: 'ended',
    startDate: '2023-12-01T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    totalSubmissions: 67,
    totalVotes: 2156,
    prize: 'Featured in Gallery',
    category: 'Mixed Media',
    submissions: campaignSubmissions.slice(3, 5)
  }
];

export const votingRounds: VotingRound[] = [
  {
    id: 'round-1',
    campaignId: 'camp-1',
    title: 'Digital Art Revolution - Round 1',
    description: 'Vote for your favorite submissions in the first round of judging.',
    startDate: '2024-01-20T00:00:00Z',
    endDate: '2024-01-27T23:59:59Z',
    status: 'active',
    submissions: campaignSubmissions.slice(0, 3),
    totalVotes: 456,
    userCanVote: true
  },
  {
    id: 'round-2',
    campaignId: 'camp-1',
    title: 'Digital Art Revolution - Final Round',
    description: 'Final voting round to determine the winner.',
    startDate: '2024-01-28T00:00:00Z',
    endDate: '2024-02-01T23:59:59Z',
    status: 'upcoming',
    submissions: [],
    totalVotes: 0,
    userCanVote: true
  }
];