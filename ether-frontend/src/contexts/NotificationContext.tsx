"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '../hooks/useWallet';
import { getNotifications } from '../data/notificationsData';
import { Notification } from '../lib/blockchain/notificationService';

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

  const refreshNotifications = async () => {
    if (!isConnected || !address || loading) return;

    try {
      setLoading(true);
      const userNotifications = await getNotifications(address);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications when wallet connects
  useEffect(() => {
    refreshNotifications();
  }, [isConnected, address]);

  // Refresh notifications every 30 seconds
  useEffect(() => {
    if (!isConnected || !address) return;

    const interval = setInterval(refreshNotifications, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [isConnected, address]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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