import NotificationService, { Notification } from '../lib/blockchain/notificationService';

// Export a function to get notifications instead of static data
export const getNotifications = async (userAddress?: string): Promise<Notification[]> => {
  if (userAddress) {
    return await NotificationService.getUserNotifications(userAddress);
  } else {
    return await NotificationService.getGeneralNotifications();
  }
};

// For backward compatibility, export empty arrays that will be replaced by async calls
export const notifications: Notification[] = [];
export const allNotifications: Notification[] = [];
