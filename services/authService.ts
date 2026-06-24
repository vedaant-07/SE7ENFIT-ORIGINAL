// Auth service — talks to your Render backend (https://se7en-fit.onrender.com).
// Server mounts auth routes at: /api/auth/*
// Backend response shape: { success, token, user } — normalized to { access_token, user } here.

import { apiFetch } from './apiClient';

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role?: string; // 'USER' | 'OWNER' | 'ADMIN'
  [key: string]: unknown;
};

export type AuthSession = {
  access_token: string;
  user?: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
  role?: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  mobile?: string;
  role?: string;
};

export type VerifyOtpPayload = {
  email: string;
  otpCode: string;
};

// Backend returns { success, token, user } — normalize to { access_token, user }.
type BackendAuthResponse = {
  success?: boolean;
  token?: string;
  access_token?: string;
  user?: AuthUser;
  message?: string;
};

function normalizeSession(raw: BackendAuthResponse): AuthSession {
  const token = raw.access_token || raw.token || '';
  const user = raw.user;

  // Normalize backend role (OWNER/USER) to lowercase for frontend
  if (user && user.role) {
    if (String(user.role).toUpperCase() === 'OWNER') {
      user.role = 'gym_owner';
    } else if (String(user.role).toUpperCase() === 'USER') {
      user.role = 'user';
    } else if (String(user.role).toUpperCase() === 'ADMIN') {
      user.role = 'admin';
    }
  }

  return { access_token: token, user };
}

// Backend /me returns { success, user } — extract just the user.
type BackendMeResponse = {
  success?: boolean;
  user?: AuthUser;
};

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const raw = await apiFetch<BackendAuthResponse>('/api/auth/login', {
      method: 'POST',
      body: payload,
      auth: false,
    });
    return normalizeSession(raw);
  },

  async register(payload: RegisterPayload): Promise<AuthSession | { requires_otp: true } | void> {
    const raw = await apiFetch<BackendAuthResponse>('/api/auth/register', {
      method: 'POST',
      body: {
        email: payload.email,
        password: payload.password,
        name: payload.name,
        phone: payload.mobile,
        role: payload.role,
      },
      auth: false,
    });
    if (raw.token || raw.access_token) {
      return normalizeSession(raw);
    }
  },

  async loginWithGoogle(idToken: string, role?: string): Promise<AuthSession> {
    const raw = await apiFetch<BackendAuthResponse>('/api/auth/google', {
      method: 'POST',
      body: { idToken, role },
      auth: false,
    });
    return normalizeSession(raw);
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthSession> {
    const raw = await apiFetch<BackendAuthResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: payload,
      auth: false,
    });
    return normalizeSession(raw);
  },

  async resendOtp(email: string): Promise<void> {
    await apiFetch('/api/auth/resend-otp', {
      method: 'POST',
      body: { email },
      auth: false,
    });
  },

  async me(): Promise<AuthUser> {
    const raw = await apiFetch<BackendMeResponse | AuthUser>('/api/auth/me', {
      method: 'GET',
      auth: true,
    });
    // Handle both { success, user } and plain user object
    if (raw && typeof raw === 'object' && 'user' in raw && (raw as BackendMeResponse).user) {
      const user = (raw as BackendMeResponse).user!;
      return normalizeSession({ user }).user!;
    }
    return raw as AuthUser;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST', body: {} });
    } catch {
      /* ignored — always clear local token */
    }
  },
};
