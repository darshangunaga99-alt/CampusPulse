import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('campuspulse_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle status codes and error formats
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Handle 401 Unauthorized
      if (status === 401) {
        localStorage.removeItem('campuspulse_token');
        localStorage.removeItem('campuspulse_user');
        window.dispatchEvent(new CustomEvent('campuspulse:unauthorized'));
      }

      // Format custom error
      const errorMessage =
        data?.error?.message ||
        (status === 403
          ? 'You do not have permission to perform this action.'
          : status === 404
          ? 'The requested resource was not found.'
          : status === 422
          ? 'Validation error: Please check your input parameters.'
          : status === 500
          ? 'Internal server error occurred on the backend.'
          : 'An unexpected error occurred.');

      const formattedError = new Error(errorMessage);
      (formattedError as any).code = data?.error?.code || `HTTP_${status}`;
      (formattedError as any).status = status;
      (formattedError as any).details = data?.error?.details;

      return Promise.reject(formattedError);
    } else if (error.request) {
      // Network / Connection Error
      const networkError = new Error(
        'Backend server connection failed. Please ensure the backend is running at ' + API_BASE_URL
      );
      (networkError as any).code = 'NETWORK_ERROR';
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);
