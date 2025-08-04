import { WorkItem } from '../types/accounts';

export const submittedWorks: WorkItem[] = [
  {
    id: 'sub-1',
    title: 'Digital Dreamscape',
    description: 'An abstract digital artwork exploring the boundaries between reality and imagination.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    category: 'Digital Art',
    submittedAt: '2024-01-15T10:30:00Z',
    status: 'pending'
  },
  {
    id: 'sub-2',
    title: 'Neon Cityscape',
    description: 'A vibrant cyberpunk-inspired cityscape with neon lights and futuristic architecture.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    category: 'Digital Art',
    submittedAt: '2024-01-14T15:45:00Z',
    status: 'approved'
  },
  {
    id: 'sub-3',
    title: 'Abstract Geometry',
    description: 'Geometric patterns and shapes creating a mesmerizing visual experience.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    category: 'Abstract',
    submittedAt: '2024-01-13T09:20:00Z',
    status: 'rejected'
  },
  {
    id: 'sub-4',
    title: 'Ocean Waves',
    description: 'A serene digital representation of ocean waves in motion.',
    imageUrl: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80',
    category: 'Nature',
    submittedAt: '2024-01-12T14:10:00Z',
    status: 'pending'
  },
  {
    id: 'sub-5',
    title: 'Cosmic Journey',
    description: 'An exploration of space and time through digital artistry.',
    imageUrl: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&q=80',
    category: 'Space',
    submittedAt: '2024-01-11T11:30:00Z',
    status: 'pending'
  },
  {
    id: 'sub-6',
    title: 'Urban Reflection',
    description: 'City lights reflected in glass surfaces creating abstract patterns.',
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&q=80',
    category: 'Photography',
    submittedAt: '2024-01-10T16:45:00Z',
    status: 'approved'
  }
];

export const approvedNfts: WorkItem[] = [
  {
    id: 'nft-1',
    title: 'Neon Cityscape',
    description: 'A vibrant cyberpunk-inspired cityscape with neon lights and futuristic architecture.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    category: 'Digital Art',
    submittedAt: '2024-01-14T15:45:00Z',
    status: 'approved',
    price: 0.5,
    tokenId: 'ETH-001'
  },
  {
    id: 'nft-2',
    title: 'Urban Reflection',
    description: 'City lights reflected in glass surfaces creating abstract patterns.',
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&q=80',
    category: 'Photography',
    submittedAt: '2024-01-10T16:45:00Z',
    status: 'approved',
    price: 0.3,
    tokenId: 'ETH-002'
  },
  {
    id: 'nft-3',
    title: 'Ethereal Landscape',
    description: 'A mystical landscape that blurs the line between reality and fantasy.',
    imageUrl: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80',
    category: 'Landscape',
    submittedAt: '2024-01-08T12:20:00Z',
    status: 'approved',
    price: 0.8,
    tokenId: 'ETH-003'
  },
  {
    id: 'nft-4',
    title: 'Digital Mandala',
    description: 'Intricate geometric patterns forming a beautiful digital mandala.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    category: 'Abstract',
    submittedAt: '2024-01-05T09:15:00Z',
    status: 'approved',
    price: 0.6,
    tokenId: 'ETH-004'
  }
];

export const collections: WorkItem[] = [
  {
    id: 'col-1',
    title: 'Digital Dreams Collection',
    description: 'A curated collection of surreal digital artworks exploring the subconscious mind.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    category: 'Collection',
    submittedAt: '2024-01-20T10:00:00Z',
    status: 'approved'
  },
  {
    id: 'col-2',
    title: 'Neon Futures',
    description: 'Cyberpunk-inspired artworks depicting futuristic cityscapes and technology.',
    imageUrl: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&q=80',
    category: 'Collection',
    submittedAt: '2024-01-18T14:30:00Z',
    status: 'approved'
  },
  {
    id: 'col-3',
    title: 'Abstract Emotions',
    description: 'Emotional expressions through abstract forms and vibrant colors.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    category: 'Collection',
    submittedAt: '2024-01-15T09:15:00Z',
    status: 'approved'
  }
];