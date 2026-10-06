import { apiClient } from './client';
import { ApiResponse, AnalyticsDashboard, DepartmentAnalytics, MapAnalyticsItem } from '../types';
import { mockDashboardAnalytics, mockDepartmentAnalytics, mockMapAnalytics } from '../mock/mockData';

export const getDashboardAnalytics = async (): Promise<AnalyticsDashboard> => {
  try {
    const response = await apiClient.get<ApiResponse<AnalyticsDashboard>>('/analytics/dashboard');
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      return mockDashboardAnalytics;
    }
    throw err;
  }
};

export const getDepartmentAnalytics = async (): Promise<DepartmentAnalytics[]> => {
  try {
    const response = await apiClient.get<ApiResponse<DepartmentAnalytics[]>>('/analytics/departments');
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      return mockDepartmentAnalytics;
    }
    throw err;
  }
};

export const getMapAnalytics = async (): Promise<MapAnalyticsItem[]> => {
  try {
    const response = await apiClient.get<ApiResponse<MapAnalyticsItem[]>>('/analytics/map');
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      return mockMapAnalytics;
    }
    throw err;
  }
};
