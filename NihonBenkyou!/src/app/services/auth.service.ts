import { api } from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', data);
  },

  async logout(): Promise<void> {
    return api.post('/auth/logout');
  },

  async refreshToken(): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/refresh');
  },

  async getMe(): Promise<User> {
    return api.get<User>('/auth/me');
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return api.patch('/auth/password', { currentPassword, newPassword });
  },
};
