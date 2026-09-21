import client from './client';
import { AuthResponse, SignupResponse, User, UserRole } from '../types/user';

export async function loginApi(email: string, password: string, role: UserRole): Promise<AuthResponse> {
  const { data } = await client.post('/auth/login', { email, password, role });
  return data;
}

export async function signupApi(payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<SignupResponse> {
  const { data } = await client.post('/auth/signup', payload);
  return data;
}

export async function forgotPasswordApi(email: string, role: UserRole): Promise<{
  message: string;
  requestId: string;
}> {
  const { data } = await client.post('/auth/forgot-password', { email, role });
  return data;
}

export async function resendPasswordOtpApi(email: string, role: UserRole): Promise<{ message: string; requestId: string }> {
  const { data } = await client.post('/auth/forgot-password/resend', { email, role });
  return data;
}

export async function verifyPasswordOtpApi(requestId: string, otp: string): Promise<{ message: string; resetToken: string }> {
  const { data } = await client.post('/auth/forgot-password/verify', { requestId, otp });
  return data;
}

export async function resetPasswordApi(resetToken: string, password: string): Promise<{ message: string }> {
  const { data } = await client.post('/auth/reset-password', { resetToken, password });
  return data;
}

export async function getMeApi(): Promise<{ user: User }> {
  const { data } = await client.get('/auth/me');
  return data;
}
