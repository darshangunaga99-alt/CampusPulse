import { apiClient } from './client';
import { ApiResponse, FeedbackPayload, FeedbackResponse } from '../types';

export const submitFeedback = async (
  requestId: string,
  payload: FeedbackPayload
): Promise<FeedbackResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<FeedbackResponse>>(
      `/requests/${requestId}/feedback`,
      payload
    );
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      return {
        id: `feedback_${Date.now().toString().slice(-4)}`,
        request_id: requestId,
        rating: payload.rating,
        comment: payload.comment,
        resolved: payload.resolved,
        created_at: new Date().toISOString(),
      };
    }
    throw err;
  }
};
