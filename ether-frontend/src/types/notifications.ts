export type NotificationType = 'artwork' | 'voting' | 'campaign' | 'nft';

export interface NotificationDetails {
  artworkId?: string;
  campaignId?: number;
  status?: 'approved' | 'rejected' | 'pending' | 'in_review';
  sessionId?: string;
  sessionStatus?: 'open' | 'closed';
  transactionHash?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  details?: NotificationDetails;
}

export interface StoredNotification extends Notification {
  user_address: string;
}