import api from './client';
import { LoginPayload, AuthResponse } from '../types/auth.types';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function me(): Promise<AuthResponse['user']> {
  const { data } = await api.get('/auth/me');
  return data;
}
