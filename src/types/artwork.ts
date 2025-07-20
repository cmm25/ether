export interface ArtworkSubmission {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  artistAddress: string;
  stakeAmount: number;
  submissionDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  nftTokenId?: string;
  transactionHash?: string;
}

export interface StakeInfo {
  tokenSymbol: string;
  amount: number;
  contractAddress: string;
}

export interface SubmissionFormData {
  title: string;
  description: string;
  image: File | null;
}

export interface SubmissionResponse {
  success: boolean;
  submissionId?: string;
  nftTokenId?: string;
  transactionHash?: string;
  error?: string;
}