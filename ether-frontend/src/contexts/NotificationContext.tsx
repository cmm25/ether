"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Notification } from '../types/notifications';

interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isConnected, address } = useWallet();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!isConnected || !address || loading) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/notifications?user=${address}`);
      const json = await res.json();
      setNotifications((json.notifications || []) as Notification[]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, loading]);

  // Load notifications when wallet connects
  useEffect(() => {
    refreshNotifications();
  }, [isConnected, address, refreshNotifications]);

  // Refresh notifications every 30 seconds
  useEffect(() => {
    if (!isConnected || !address) return;

    const interval = setInterval(refreshNotifications, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [isConnected, address, refreshNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: address, id: notificationId })
      });
    } catch (e) {
      console.error('Failed to persist markAsRead', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: address, all: true })
      });
    } catch (e) {
      console.error('Failed to persist markAllAsRead', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    unreadCount,
    notifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;