// Auth service — talks to your Render backend (https://se7en-fit.onrender.com).
// Routes: login, register, verifyOtp, resendOtp, me, logout.
//
// Adjust paths here if your backend uses different ones — the rest of the
// app only imports from this service, so this is the single source of truth.

import { api, apiFetch } from './apiClient';

export type AuthUser = {
  id: string;
  email: string;
  role?: 'user' | 'gym_owner';
  // The backend may attach additional fields (name, etc.).
  [key: string]: unknown;
};

export type AuthSession = {
  access_token: string;
  user?: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  // Optional fields sent in some flows.
  name?: string;
  mobile?: string;
  role?: 'user' | 'gym_owner';
};

export type VerifyOtpPayload = {
  email: string;
  otpCode: string;
};

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    // Replace with the exact backend route for email/password login.
    return api.post<AuthSession>('/auth/login', payload, false);
  },

  async register(payload: RegisterPayload): Promise<AuthSession | { requires_otp: true } | void> {
    // Web registers then triggers OTP. Backend should accept this shape.
    return api.post<AuthSession | { requires_otp: true }>('/auth/register', payload, false);
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthSession> {
    return api.post<AuthSession>('/auth/verify-otp', payload, false);
  },

  async resendOtp(email: string): Promise<void> {
    return api.post('/auth/resend-otp', { email }, false);
  },

  async me(): Promise<AuthUser> {
    return api.get<AuthUser>('/auth/me');
  },

  async logout(): Promise<void> {
    // Best-effort — clear local token even if backend call fails.
    try {
      await api.post('/auth/logout', {});
    } catch {
      /* ignored */
    }
  },

  // Google OAuth — left as a placeholder. Wire to your provider flow when ready.
  async loginWithGoogle(): Promise<never> {
    throw new Error('Google sign-in is not yet wired to the Render backend.');
  },
};
