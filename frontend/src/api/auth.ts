import { apiClient } from './client';
import { ApiResponse, AuthResponse, LoginPayload, RegisterPayload, User } from '../types';
import { mockUsers } from '../mock/mockData';

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      // Mock fallback
      const mockUser: User = {
        id: `usr_${Date.now().toString().slice(-4)}`,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        department: payload.role === 'student' ? 'Computer Science' : 'IT Operations',
      };
      return {
        user: mockUser,
        access_token: `mock_jwt_token_${mockUser.id}`,
        token_type: 'bearer',
      };
    }
    throw err;
  }
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      // Mock login fallback matching email domain/prefix or fallback to student/admin
      let userRole: keyof typeof mockUsers = 'student';
      if (payload.email.includes('admin')) userRole = 'admin';
      else if (payload.email.includes('staff')) userRole = 'staff';
      else if (payload.email.includes('head') || payload.email.includes('dept')) userRole = 'department_head';
      else if (payload.email.includes('audit')) userRole = 'auditor';

      const user = mockUsers[userRole];
      return {
        user: { ...user, email: payload.email },
        access_token: `mock_jwt_token_${user.id}`,
        token_type: 'bearer',
      };
    }
    throw err;
  }
};

export const getMe = async (): Promise<User> => {
  try {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      const savedUserStr = localStorage.getItem('campuspulse_user');
      if (savedUserStr) {
        return JSON.parse(savedUserStr);
      }
      return mockUsers.student;
    }
    throw err;
  }
};
