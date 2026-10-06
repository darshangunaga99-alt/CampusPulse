import { apiClient } from './client';
import {
  ApiResponse,
  AIAnalysisRequest,
  AIAnalysisResult,
  DuplicateCheckRequest,
  DuplicateCheckResult,
  CreateRequestPayload,
  CreateRequestResponse,
  RequestDetail,
  RequestListItem,
  RequestTimelineItem,
  UpdateStatusPayload,
  AssignRequestPayload,
  Pagination,
} from '../types';
import {
  mockRequests,
  mockTimelines,
  simulateAIAnalysis,
  simulateDuplicateCheck,
} from '../mock/mockData';

// 1. Analyze Request via AI
export const analyzeRequest = async (payload: AIAnalysisRequest): Promise<AIAnalysisResult> => {
  try {
    const response = await apiClient.post<ApiResponse<AIAnalysisResult>>('/requests/analyze', payload);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      return simulateAIAnalysis(payload.description, payload.location as any);
    }
    throw err;
  }
};

// 2. Check Duplicates
export const checkDuplicates = async (payload: DuplicateCheckRequest): Promise<DuplicateCheckResult> => {
  try {
    const response = await apiClient.post<ApiResponse<DuplicateCheckResult>>('/requests/check-duplicates', payload);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      return simulateDuplicateCheck(payload.description);
    }
    throw err;
  }
};

// 3. Create Request
export const createRequest = async (payload: CreateRequestPayload): Promise<CreateRequestResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<CreateRequestResponse>>('/requests', payload);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      const newId = `req_${Date.now().toString().slice(-4)}`;
      const ticketNum = `REQ-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toISOString();
      const slaDeadline = new Date(Date.now() + 8 * 3600 * 1000).toISOString();

      const newReq: RequestDetail = {
        id: newId,
        ticket_number: ticketNum,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        priority: payload.priority,
        department: payload.category === 'it_support' || payload.category === 'lab_equipment' ? 'IT' : 'Facilities',
        status: 'pending',
        assigned_to: null,
        location: payload.location,
        estimated_completion: null,
        sla_deadline: slaDeadline,
        created_at: now,
        updated_at: now,
      };

      mockRequests.unshift(newReq);
      mockTimelines[newId] = [
        {
          id: `hist_${Date.now()}`,
          action: 'Request created',
          status: 'pending',
          actor: { id: 'usr_student_01', name: 'Rahul Kumar' },
          timestamp: now,
          comment: 'Submitted through student portal.',
        },
      ];

      return {
        id: newId,
        ticket_number: ticketNum,
        status: 'pending',
        priority: payload.priority,
        category: payload.category,
        department: newReq.department,
        created_at: now,
        sla_deadline: slaDeadline,
      };
    }
    throw err;
  }
};

// 4. Get My Requests (Student)
export const getMyRequests = async (params?: {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: RequestListItem[]; pagination: Pagination }> => {
  try {
    const response = await apiClient.get<ApiResponse<{ items: RequestListItem[]; pagination: Pagination }>>(
      '/requests/my',
      { params }
    );
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      let items: RequestListItem[] = mockRequests.map((r) => ({
        id: r.id,
        ticket_number: r.ticket_number,
        title: r.title,
        status: r.status,
        priority: r.priority,
        category: r.category,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));

      if (params?.status) {
        items = items.filter((i) => i.status === params.status);
      }
      if (params?.category) {
        items = items.filter((i) => i.category === params.category);
      }
      if (params?.priority) {
        items = items.filter((i) => i.priority === params.priority);
      }
      if (params?.search) {
        const query = params.search.toLowerCase();
        items = items.filter(
          (i) => i.title.toLowerCase().includes(query) || i.ticket_number.toLowerCase().includes(query)
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

// 5. Get Single Request Details
export const getRequest = async (requestId: string): Promise<RequestDetail> => {
  try {
    const response = await apiClient.get<ApiResponse<RequestDetail>>(`/requests/${requestId}`);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      const match = mockRequests.find((r) => r.id === requestId);
      if (match) return match;
      return mockRequests[0];
    }
    throw err;
  }
};

// 6. Get Request Timeline
export const getRequestTimeline = async (requestId: string): Promise<RequestTimelineItem[]> => {
  try {
    const response = await apiClient.get<ApiResponse<RequestTimelineItem[]>>(`/requests/${requestId}/timeline`);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      return (
        mockTimelines[requestId] || [
          {
            id: 'hist_default',
            action: 'Request logged',
            status: 'pending',
            actor: { id: 'usr_sys', name: 'Campus System' },
            timestamp: new Date().toISOString(),
            comment: null,
          },
        ]
      );
    }
    throw err;
  }
};

// 7. Update Request Status
export const updateRequestStatus = async (
  requestId: string,
  payload: UpdateStatusPayload
): Promise<{ request_id: string; status: string; updated_at: string }> => {
  try {
    const response = await apiClient.patch<
      ApiResponse<{ request_id: string; status: string; updated_at: string }>
    >(`/requests/${requestId}/status`, payload);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      const now = new Date().toISOString();
      const match = mockRequests.find((r) => r.id === requestId);
      if (match) {
        match.status = payload.status;
        match.updated_at = now;
      }
      if (!mockTimelines[requestId]) {
        mockTimelines[requestId] = [];
      }
      mockTimelines[requestId].push({
        id: `hist_${Date.now()}`,
        action: `Status updated to ${payload.status.replace('_', ' ')}`,
        status: payload.status,
        actor: { id: 'usr_staff_01', name: 'Anil Sharma' },
        timestamp: now,
        comment: payload.comment || null,
      });

      return {
        request_id: requestId,
        status: payload.status,
        updated_at: now,
      };
    }
    throw err;
  }
};

// 8. Assign Request
export const assignRequest = async (
  requestId: string,
  payload: AssignRequestPayload
): Promise<{ request_id: string; assigned_to: { id: string; name: string }; assignment_type: string }> => {
  try {
    const response = await apiClient.post<
      ApiResponse<{ request_id: string; assigned_to: { id: string; name: string }; assignment_type: string }>
    >(`/requests/${requestId}/assign`, payload);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      const match = mockRequests.find((r) => r.id === requestId);
      const assignedUser = { id: payload.staff_id, name: 'Anil Sharma' };
      if (match) {
        match.assigned_to = assignedUser;
        match.status = 'assigned';
        match.updated_at = new Date().toISOString();
      }
      return {
        request_id: requestId,
        assigned_to: assignedUser,
        assignment_type: 'manual',
      };
    }
    throw err;
  }
};

// 9. Staff Queue
export const getStaffRequests = async (params?: {
  status?: string;
  priority?: string;
  category?: string;
  department?: string;
  assigned_to?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: RequestDetail[]; pagination: Pagination }> => {
  try {
    const response = await apiClient.get<ApiResponse<{ items: RequestDetail[]; pagination: Pagination }>>(
      '/staff/requests',
      { params }
    );
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      let items = [...mockRequests];

      if (params?.status) {
        items = items.filter((i) => i.status === params.status);
      }
      if (params?.priority) {
        items = items.filter((i) => i.priority === params.priority);
      }
      if (params?.category) {
        items = items.filter((i) => i.category === params.category);
      }
      if (params?.department) {
        items = items.filter((i) => i.department.toLowerCase().includes(params.department!.toLowerCase()));
      }
      if (params?.search) {
        const query = params.search.toLowerCase();
        items = items.filter(
          (i) =>
            i.title.toLowerCase().includes(query) ||
            i.ticket_number.toLowerCase().includes(query) ||
            i.location.building.toLowerCase().includes(query)
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
