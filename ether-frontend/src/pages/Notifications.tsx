'use client';

import { useState, useEffect } from 'react';
import { getNotifications } from '../data/notificationsData';
import { Notification } from '../lib/blockchain/notificationService';
import { useWallet } from '../hooks/useWallet';
import { useNotifications } from '../contexts/NotificationContext';
import Link from 'next/link';

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return date.toLocaleDateString();
};

const NotificationIcon = ({ type }: { type: 'artwork' | 'voting' | 'campaign' | 'nft' }) => {
  const getIconConfig = () => {
    switch (type) {
      case 'artwork':
        return { bg: 'bg-purple-500/20 text-purple-400', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' };
      case 'voting':
        return { bg: 'bg-green-500/20 text-green-400', icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' };
      case 'campaign':
        return { bg: 'bg-blue-500/20 text-blue-400', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' };
      case 'nft':
        return { bg: 'bg-yellow-500/20 text-yellow-400', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' };
      default:
        return { bg: 'bg-gray-500/20 text-gray-400', icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z' };
    }
  };

  const { bg, icon } = getIconConfig();

  return (
    <div className={`p-2 rounded-full ${bg}`}>
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d={icon} />
      </svg>
    </div>
  );
};

const NotificationActions = ({ notification }: { notification: Notification }) => (
  <div className="flex gap-3">
    {notification.details?.artworkId && (
      <Link 
        href="/accounts?tab=submitted" 
        className="inline-flex items-center gap-1 text-purple-400 text-sm hover:text-purple-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        View Artwork
      </Link>
    )}
    {notification.details?.campaignId !== undefined && (
      <Link 
        href={`/campaigns/${notification.details.campaignId}`}
        className="inline-flex items-center gap-1 text-green-400 text-sm hover:text-green-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v9h2v-9zm4-4H11v13h2V7zm4-4H15v17h2V3z" />
        </svg>
        View Campaign
      </Link>
    )}
    {notification.type === 'voting' && !notification.details?.campaignId && (
      <Link 
        href="/campaigns" 
        className="inline-flex items-center gap-1 text-green-400 text-sm hover:text-green-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v9h2v-9zm4-4H11v13h2V7zm4-4H15v17h2V3z" />
        </svg>
        View Campaigns
      </Link>
    )}
    {notification.type === 'nft' && (
      <Link 
        href="/" 
        className="inline-flex items-center gap-1 text-yellow-400 text-sm hover:text-yellow-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
        View Gallery
      </Link>
    )}
  </div>
);

const NotificationItem = ({ notification, onMarkRead }: { notification: Notification; onMarkRead: (id: string) => void }) => {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    setFormattedDate(formatDate(notification.timestamp));
  }, [notification.timestamp]);

  return (
    <div className={`p-6 border-b border-gray-800 hover:bg-gray-900/50 transition-colors ${!notification.read ? 'bg-gray-900/30 border-l-4 border-l-purple-500' : ''}`}>
      <div className="flex items-start gap-4">
        <NotificationIcon type={notification.type} />
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-white mb-1">{notification.title}</h3>
              <p className="text-gray-300">{notification.message}</p>
            </div>
            
            {!notification.read && (
              <div className="flex items-center gap-3 ml-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <button
                  onClick={() => onMarkRead(notification.id)}
                  className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
                >
                  Mark read
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{formattedDate}</p>
            <NotificationActions notification={notification} />
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="p-12 text-center">
    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-white mb-2">No notifications yet</h3>
    <p className="text-gray-400">When you have notifications, they'll appear here.</p>
  </div>
);

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-400">
                You have <span className="font-semibold text-purple-400">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
          {notifications.length === 0 ? (
            <EmptyState />
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}