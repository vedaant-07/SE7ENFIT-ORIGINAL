// Auth API - SE7EN FIT
// Future API layer. Kept aligned with active services/authService.ts to avoid old /auth-only calls.

import { api, ApiError } from './client';

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

type RawAuthSession = AuthSession & { token?: string; accessToken?: string; jwt?: string; data?: RawAuthSession };

const shouldFallback = (error: unknown) => error instanceof ApiError && (error.status === 404 || error.status === 405);

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

function normalizeSession(raw: RawAuthSession): AuthSession {
  const source = raw?.data && typeof raw.data === 'object' ? raw.data : raw;
  const token = source?.access_token || source?.token || source?.accessToken || source?.jwt;
  if (!token || typeof token !== 'string') {
    throw new ApiError('No access token returned from server.', 500, raw);
  }
  return { access_token: token, user: source.user };
}

export async function userLogin(email: string, password: string): Promise<AuthSession> {
  const raw = await postWithFallback<RawAuthSession>(['/api/auth/login', '/auth/login'], { email, password, role: 'user' }, false);
  return normalizeSession(raw);
}

export async function userSignup(payload: {
  email: string;
  password: string;
  name?: string;
  mobile?: string;
}): Promise<AuthSession | { requires_otp: true }> {
  const raw = await postWithFallback<RawAuthSession | { requires_otp: true }>(['/api/auth/register', '/auth/register'], { ...payload, role: 'user' }, false);
  if ('requires_otp' in raw) return raw;
  return normalizeSession(raw);
}

export async function gymOwnerLogin(email: string, password: string): Promise<AuthSession> {
  const raw = await postWithFallback<RawAuthSession>(['/api/auth/login', '/auth/login'], { email, password, role: 'gym_owner' }, false);
  return normalizeSession(raw);
}

export async function gymOwnerSignup(payload: {
  email: string;
  password: string;
  owner_name: string;
  gym_name: string;
  mobile?: string;
}): Promise<AuthSession | { requires_otp: true }> {
  const raw = await postWithFallback<RawAuthSession | { requires_otp: true }>(['/api/auth/register', '/auth/register'], { ...payload, role: 'gym_owner' }, false);
  if ('requires_otp' in raw) return raw;
  return normalizeSession(raw);
}

export async function getMe(): Promise<AuthUser> {
  try {
    return await api.get<AuthUser>('/api/auth/me');
  } catch (error) {
    if (shouldFallback(error)) return api.get<AuthUser>('/auth/me');
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await postWithFallback(['/api/auth/logout', '/auth/logout'], {}, true);
  } catch {
    // Best-effort logout; clear token locally regardless.
  }
}

export async function verifyOtp(email: string, otpCode: string): Promise<AuthSession> {
  const raw = await postWithFallback<RawAuthSession>(['/api/auth/verify-otp', '/auth/verify-otp'], { email, otp_code: otpCode }, false);
  return normalizeSession(raw);
}

export async function resendOtp(email: string): Promise<void> {
  await postWithFallback(['/api/auth/resend-otp', '/auth/resend-otp'], { email }, false);
}
