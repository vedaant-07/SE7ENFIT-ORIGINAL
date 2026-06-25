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

type BackendAuthResponse = {
  success: boolean;
  message?: string;
  token: string;
  user: AuthUser;
};

// User authentication
export async function userLogin(email: string, password: string): Promise<AuthSession> {
  const response = await api.post<BackendAuthResponse>('/auth/login', { email, password, role: 'user' }, false);
  return {
    access_token: response.token,
    user: response.user
  };
}

export async function userSignup(payload: {
  email: string;
  password: string;
  name?: string;
  mobile?: string;
}): Promise<AuthSession | { requires_otp: true }> {
  const response = await api.post<BackendAuthResponse>('/auth/register', { ...payload, role: 'user' }, false);
  if (response.token) {
    return {
      access_token: response.token,
      user: response.user
    };
  }
  return { requires_otp: true };
}

// Gym Owner authentication
export async function gymOwnerLogin(email: string, password: string): Promise<AuthSession> {
  const response = await api.post<BackendAuthResponse>('/auth/login', { email, password, role: 'gym_owner' }, false);
  return {
    access_token: response.token,
    user: response.user
  };
}

export async function gymOwnerSignup(payload: {
  email: string;
  password: string;
  name?: string;
  gym_name?: string;
  mobile?: string;
}): Promise<AuthSession | { requires_otp: true }> {
  const response = await api.post<BackendAuthResponse>('/auth/register', { ...payload, role: 'gym_owner' }, false);
  if (response.token) {
    return {
      access_token: response.token,
      user: response.user
    };
  }
  return { requires_otp: true };
}

// Google Login
export async function googleLogin(idToken: string, role: 'user' | 'gym_owner' = 'user'): Promise<AuthSession> {
  const response = await api.post<BackendAuthResponse>('/auth/google', { idToken, role }, false);
  return {
    access_token: response.token,
    user: response.user
  };
}

// Get current authenticated user
export async function getMe(): Promise<AuthUser> {
  const response = await api.get<{ success: boolean; user: AuthUser }>('/auth/me');
  return response.user;
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
  const response = await api.post<BackendAuthResponse>('/auth/verify-otp', { email, otp_code: otpCode }, false);
  return {
    access_token: response.token,
    user: response.user
  };
}

export async function resendOtp(email: string): Promise<void> {
  return api.post('/auth/resend-otp', { email }, false);
}
