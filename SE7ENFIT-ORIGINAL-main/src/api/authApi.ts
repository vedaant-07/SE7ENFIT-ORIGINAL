// Auth API - SE7EN FIT
// User and Gym Owner authentication endpoints.

import { api } from './client';

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'gym_owner';
  [key: string]: unknown;
};

export type AuthSession = {
  access_token: string;
  user?: AuthUser;
};

// User authentication
export async function userLogin(email: string, password: string): Promise<AuthSession> {
  return api.post<AuthSession>('/auth/login', { email, password }, false);
}

export async function userSignup(payload: {
  email: string;
  password: string;
  name?: string;
  mobile?: string;
}): Promise<AuthSession | { requires_otp: true }> {
  return api.post<AuthSession | { requires_otp: true }>('/auth/register', { ...payload, role: 'user' }, false);
}

// Gym Owner authentication
export async function gymOwnerLogin(email: string, password: string): Promise<AuthSession> {
  return api.post<AuthSession>('/auth/gym-owner/login', { email, password }, false);
}

export async function gymOwnerSignup(payload: {
  email: string;
  password: string;
  owner_name: string;
  gym_name: string;
  mobile?: string;
}): Promise<AuthSession | { requires_otp: true }> {
  return api.post<AuthSession | { requires_otp: true }>('/auth/gym-owner/register', { ...payload, role: 'gym_owner' }, false);
}

// Get current authenticated user
export async function getMe(): Promise<AuthUser> {
  return api.get<AuthUser>('/auth/me');
}

// Logout
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout', {});
  } catch {
    // Best-effort logout; clear token locally regardless
  }
}

// OTP verification
export async function verifyOtp(email: string, otpCode: string): Promise<AuthSession> {
  return api.post<AuthSession>('/auth/verify-otp', { email, otp_code: otpCode }, false);
}

export async function resendOtp(email: string): Promise<void> {
  return api.post('/auth/resend-otp', { email }, false);
}
