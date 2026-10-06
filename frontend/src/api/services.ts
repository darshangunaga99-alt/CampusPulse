import { apiClient } from './client';
import { ApiResponse, ServiceItem } from '../types';
import { mockServices } from '../mock/mockData';

export const getServices = async (params?: { category?: string; active?: boolean }): Promise<ServiceItem[]> => {
  try {
    const response = await apiClient.get<ApiResponse<ServiceItem[]>>('/services', { params });
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      let filtered = [...mockServices];
      if (params?.category) {
        filtered = filtered.filter((s) => s.category === params.category);
      }
      if (params?.active !== undefined) {
        filtered = filtered.filter((s) => s.active === params.active);
      }
      return filtered;
    }
    throw err;
  }
};
