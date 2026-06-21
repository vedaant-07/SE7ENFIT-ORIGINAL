// Auth service — talks to your Render backend.
// Production route preference: /api/auth/* with /auth/* fallback for older backend builds.

import { api, ApiError } from './apiClient';

export type UserRole = 'user' | 'gym_owner';

export type AuthUser = {
  id: string;
  email: string;
  role?: UserRole;
  [key: string]: unknown;
};

export type AuthSession = {
  access_token: string;
  user?: AuthUser;
};

type RawAuthSession = AuthSession & {
  token?: string;
  accessToken?: string;
  jwt?: string;
  data?: RawAuthSession;
};

export type LoginPayload = {
  email: string;
  password: string;
  role?: UserRole;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  mobile?: string;
  role?: UserRole;
  [key: string]: unknown;
};

export type VerifyOtpPayload = {
  email: string;
  otpCode: string;
};

const shouldFallback = (error: unknown) =>
  error instanceof ApiError && (error.status === 404 || error.status === 405);

async function postWithFallback<T>(paths: string[], body?: unknown, auth = false): Promise<T> {
  let lastError: unknown;
  for (const path of paths) {
    try {
      return await api.post<T>(path, body, auth);
    } catch (error) {
      lastError = error;
      if (!shouldFallback(error)) break;
    }
  }
  throw lastError;
}

async function getWithFallback<T>(paths: string[]): Promise<T> {
  let lastError: unknown;
  for (const path of paths) {
    try {
      return await api.get<T>(path);
    } catch (error) {
      lastError = error;
      if (!shouldFallback(error)) break;
    }
  }
  throw lastError;
}

function normalizeRole(role: unknown): UserRole | undefined {
  if (typeof role !== 'string') return undefined;
  const normalized = role.toLowerCase();
  if (normalized === 'user') return 'user';
  if (normalized === 'owner' || normalized === 'gym_owner' || normalized === 'gym-owner') return 'gym_owner';
  return undefined;
}

function normalizeUser(user?: AuthUser): AuthUser | undefined {
  if (!user) return undefined;
  const role = normalizeRole(user.role);
  return role ? { ...user, role } : user;
}

function fallbackNameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'SE7EN FIT User';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()) || 'SE7EN FIT User';
}

function normalizeSession(raw: RawAuthSession): AuthSession {
  const source = raw?.data && typeof raw.data === 'object' ? raw.data : raw;
  const token = source?.access_token || source?.token || source?.accessToken || source?.jwt;
  if (!token || typeof token !== 'string') {
    throw new ApiError('No access token returned from server.', 500, raw);
  }
  return {
    access_token: token,
    user: normalizeUser(source.user),
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const raw = await postWithFallback<RawAuthSession>(['/api/auth/login', '/auth/login'], payload, false);
    return normalizeSession(raw);
  },

  async register(payload: RegisterPayload): Promise<AuthSession | { requires_otp: true } | void> {
    const email = payload.email.trim();
    const body: RegisterPayload = {
      ...payload,
      email,
      name: typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : fallbackNameFromEmail(email),
    };
    const raw = await postWithFallback<RawAuthSession | { requires_otp: true } | void>(['/api/auth/register', '/auth/register'], body, false);
    if (raw && typeof raw === 'object' && 'requires_otp' in raw) return raw;
    if (raw && typeof raw === 'object') return normalizeSession(raw as RawAuthSession);
    return raw;
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthSession> {
    const raw = await postWithFallback<RawAuthSession>(['/api/auth/verify-otp', '/auth/verify-otp'], payload, false);
    return normalizeSession(raw);
  },

  async resendOtp(email: string): Promise<void> {
    await postWithFallback(['/api/auth/resend-otp', '/auth/resend-otp'], { email }, false);
  },

  async me(): Promise<AuthUser> {
    const raw = await getWithFallback<AuthUser | { user: AuthUser } | { data: { user: AuthUser } }>(['/api/auth/me', '/auth/me']);
    if ('user' in raw && raw.user) return normalizeUser(raw.user) ?? raw.user;
    if ('data' in raw && raw.data?.user) return normalizeUser(raw.data.user) ?? raw.data.user;
    return normalizeUser(raw as AuthUser) ?? (raw as AuthUser);
  },

  async logout(): Promise<void> {
    try {
      await postWithFallback(['/api/auth/logout', '/auth/logout'], {}, true);
    } catch {
      // Best-effort only — local token is cleared by AuthContext.
    }
  },

  async loginWithGoogle(params: { idToken?: string; accessToken?: string; role: UserRole }): Promise<AuthSession> {
    const raw = await postWithFallback<RawAuthSession>(['/api/auth/google', '/auth/google'], {
      provider: 'google',
      role: params.role,
      idToken: params.idToken,
      accessToken: params.accessToken,
      token: params.idToken || params.accessToken,
    }, false);
    return normalizeSession(raw);
  },
};