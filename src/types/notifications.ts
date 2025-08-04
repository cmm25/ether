export interface Notification {
  id: string;
  type: 'artwork' | 'voting';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  details?: {
    artworkId?: string;
    status?: 'approved' | 'rejected' | 'in_review';
    sessionId?: string;
    sessionStatus?: 'open' | 'closed';
  };
}