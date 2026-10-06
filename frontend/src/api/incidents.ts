import { apiClient } from './client';
import { ApiResponse, IncidentDetail, IncidentItem, Pagination } from '../types';
import { mockIncidents } from '../mock/mockData';

export const getIncidents = async (params?: {
  status?: string;
  priority?: string;
  department?: string;
  building?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: IncidentItem[]; pagination: Pagination }> => {
  try {
    const response = await apiClient.get<ApiResponse<{ items: IncidentItem[]; pagination: Pagination }>>(
      '/incidents',
      { params }
    );
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      let items: IncidentItem[] = mockIncidents.map((inc) => ({
        id: inc.id,
        incident_number: inc.incident_number,
        title: inc.title,
        status: inc.status,
        priority: inc.priority,
        affected_students: inc.affected_students,
        department: inc.department,
        created_at: inc.created_at,
      }));

      if (params?.status) {
        items = items.filter((i) => i.status === params.status);
      }
      if (params?.priority) {
        items = items.filter((i) => i.priority === params.priority);
      }
      if (params?.department) {
        items = items.filter((i) => i.department.toLowerCase().includes(params.department!.toLowerCase()));
      }
      if (params?.search) {
        const query = params.search.toLowerCase();
        items = items.filter(
          (i) => i.title.toLowerCase().includes(query) || i.incident_number.toLowerCase().includes(query)
        );
      }

      const page = params?.page || 1;
      const limit = params?.limit || 20;

      return {
        items,
        pagination: {
          page,
          limit,
          total: items.length,
          total_pages: Math.max(1, Math.ceil(items.length / limit)),
        },
      };
    }
    throw err;
  }
};

export const getIncident = async (incidentId: string): Promise<IncidentDetail> => {
  try {
    const response = await apiClient.get<ApiResponse<IncidentDetail>>(`/incidents/${incidentId}`);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      const match = mockIncidents.find((i) => i.id === incidentId);
      if (match) return match;
      return mockIncidents[0];
    }
    throw err;
  }
};

export const followIncident = async (incidentId: string): Promise<{ incident_id: string; following: boolean }> => {
  try {
    const response = await apiClient.post<ApiResponse<{ incident_id: string; following: boolean }>>(
      `/incidents/${incidentId}/follow`
    );
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      return {
        incident_id: incidentId,
        following: true,
      };
    }
    throw err;
  }
};
