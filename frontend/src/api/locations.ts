import { apiClient } from './client';
import { ApiResponse, LocationDetail } from '../types';
import { mockLocations } from '../mock/mockData';

export const getLocation = async (locationCode: string): Promise<LocationDetail> => {
  try {
    const response = await apiClient.get<ApiResponse<LocationDetail>>(`/locations/${locationCode}`);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      const match = mockLocations[locationCode];
      if (match) return match;
      return {
        code: locationCode,
        building: 'CSE Block',
        floor: 2,
        room: 'Lab 2',
        latitude: 12.9716,
        longitude: 77.5946,
      };
    }
    throw err;
  }
};
