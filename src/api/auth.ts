import client from './client';
import { AuthResponse, User } from '../types/user';

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
}

export async function getMeApi(): Promise<{ user: User }> {
  const { data } = await client.get('/auth/me');
  return data;
}
