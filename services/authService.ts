// Auth service — talks to your Render backend (https://se7en-fit.onrender.com/api).
// Routes: login, register, verifyOtp, resendOtp, me, logout.
//
// Adjust paths here if your backend uses different ones — the rest of the
// app only imports from this service, so this is the single source of truth.

import { api, apiFetch } from './apiClient';

export type AppRole = 'user' | 'gym_owner' | 'super_admin' | 'admin' | 'staff';

export type AuthUser = {
  id: string;
  email: string;
  role?: AppRole;
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
  async login(payload: LoginPayload & { role?: 'user' | 'gym_owner' }): Promise<AuthSession> {
    const response = await api.post<{ success: boolean; token: string; user: AuthUser }>('/auth/login', payload, false);
    return {
      access_token: response.token,
      user: response.user,
    };
  },

  async register(payload: RegisterPayload): Promise<AuthSession | { requires_otp: true } | void> {
    const response = await api.post<{ success: boolean; token: string; user: AuthUser }>('/auth/register', payload, false);
    if (response.token) {
      return {
        access_token: response.token,
        user: response.user,
      };
    }
    return;
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthSession> {
    const response = await api.post<{ success: boolean; token: string; user: AuthUser }>('/auth/verify-otp', payload, false);
    return {
      access_token: response.token,
      user: response.user,
    };
  },

  async resendOtp(email: string): Promise<void> {
    return api.post('/auth/resend-otp', { email }, false);
  },

  async me(): Promise<AuthUser> {
    const response = await api.get<{ success: boolean; user: AuthUser }>('/auth/me');
    return response.user;
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
