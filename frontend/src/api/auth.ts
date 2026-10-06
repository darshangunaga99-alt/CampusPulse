import { apiClient } from './client';
import { ApiResponse, AuthResponse, LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '../types';
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
        try {
          return JSON.parse(savedUserStr);
        } catch {
          // ignore error and rethrow below
        }
      }
    }
    throw err;
  }
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
  try {
    const response = await apiClient.patch<ApiResponse<User>>('/auth/me', payload);
    return response.data.data;
  } catch (err: any) {
    if (err.isNetworkError || !navigator.onLine) {
      const savedUserStr = localStorage.getItem('campuspulse_user');
      const currentUser: User = savedUserStr ? JSON.parse(savedUserStr) : mockUsers.student;
      const fn = payload.first_name !== undefined ? (payload.first_name.trim() || null) : currentUser.first_name;
      const mn = payload.middle_name !== undefined ? (payload.middle_name.trim() || null) : currentUser.middle_name;
      const ln = payload.last_name !== undefined ? (payload.last_name.trim() || null) : currentUser.last_name;

      const fullName = [fn, mn, ln].filter(Boolean).join(' ') || fn || currentUser.name;

      const updatedUser: User = {
        ...currentUser,
        first_name: fn,
        middle_name: mn,
        last_name: ln,
        usn: payload.usn !== undefined ? (payload.usn.trim() || null) : currentUser.usn,
        course: payload.course !== undefined ? (payload.course.trim() || null) : currentUser.course,
        department: payload.department !== undefined ? (payload.department.trim() || null) : currentUser.department,
        email: payload.email ? payload.email.trim() : currentUser.email,
        phone_number: payload.phone_number !== undefined ? (payload.phone_number.trim() || null) : currentUser.phone_number,
        name: fullName,
      };
      localStorage.setItem('campuspulse_user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw err;
  }
};
