import { Notification } from '../types/notifications';
import { submittedWorks } from './accountsData';

// Generate notifications from submitted works
export const notifications: Notification[] = submittedWorks.map(work => ({
  id: `notif-${work.id}`,
  type: 'artwork',
  title: `Artwork ${work.status.charAt(0).toUpperCase() + work.status.slice(1)}`,
  message: `Your artwork "${work.title}" has been ${work.status}.`,
  timestamp: work.submittedAt,
  read: false,
  details: {
    artworkId: work.id,
    status: work.status as 'approved' | 'rejected' | 'pending'
  }
}));

// Add some voting notifications
const votingNotifications: Notification[] = [
  {
    id: 'vot-1',
    type: 'voting',
    title: 'Voting Session Opened',
    message: 'A new voting session for artwork approvals is now open. Cast your votes!',
    timestamp: '2024-01-20T10:00:00Z',
    read: false,
    details: {
      sessionId: 'session-001',
      sessionStatus: 'open'
    }
  },
  {
    id: 'vot-2',
    type: 'voting',
    title: 'Voting Session Closed',
    message: 'The voting session for January artworks has closed. Results will be announced soon.',
    timestamp: '2024-01-25T18:00:00Z',
    read: false,
    details: {
      sessionId: 'session-001',
      sessionStatus: 'closed'
    }
  }
];

// Combine all notifications and sort by timestamp
export const allNotifications = [...notifications, ...votingNotifications].sort((a, b) => 
  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
);
