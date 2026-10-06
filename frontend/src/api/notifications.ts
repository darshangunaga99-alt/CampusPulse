import { apiClient } from './client';
import { ApiResponse, NotificationItem } from '../types';
import { mockNotifications } from '../mock/mockData';

export const getNotifications = async (params?: {
  unread?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ items: NotificationItem[]; unread_count: number }> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{ items: NotificationItem[]; unread_count: number }>
    >('/notifications', { params });
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      let items = [...mockNotifications];
      if (params?.unread) {
        items = items.filter((n) => !n.read);
      }
      const unread_count = mockNotifications.filter((n) => !n.read).length;
      return {
        items,
        unread_count,
      };
    }
    throw err;
  }
};

export const markNotificationRead = async (
  notificationId: string
): Promise<{ notification_id: string; read: boolean }> => {
  try {
    const response = await apiClient.patch<
      ApiResponse<{ notification_id: string; read: boolean }>
    >(`/notifications/${notificationId}/read`);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      const match = mockNotifications.find((n) => n.id === notificationId);
      if (match) {
        match.read = true;
      }
      return {
        notification_id: notificationId,
        read: true,
      };
    }
    throw err;
  }
};
