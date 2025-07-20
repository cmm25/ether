export type AccountTab = 'Submitted Works' | 'Approved NFTs' | 'Collections';

export type WorkStatus = 'pending' | 'approved' | 'rejected';

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  submittedAt: string;
  status?: WorkStatus;
  price?: number; // For approved NFTs
  tokenId?: string; // For approved NFTs
}