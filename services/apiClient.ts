// Base API client for the SE7EN-FIT Render backend.
// All app code imports from this — no direct fetch() elsewhere.
//
// Backend: https://se7en-fit.onrender.com (existing) → TiDB/MySQL
// Auth: bearer token stored in SecureStore, attached as Authorization header.

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const API_BASE_URL = 'https://se7en-fit.onrender.com';

const TOKEN_KEY = 'se7enfit_auth_token';
const USER_KEY = 'se7enfit_user'; // cached user object (JSON)

// On web, SecureStore is unavailable — fall back to localStorage.
const storeToken = async (token: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

const readToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
};

const deleteToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

const storeUser = async (user: unknown) => {
  const json = JSON.stringify(user);
  if (Platform.OS === 'web') {
    localStorage.setItem(USER_KEY, json);
    return;
  }
  await SecureStore.setItemAsync(USER_KEY, json);
};

export const readCachedUser = async <T = unknown>(): Promise<T | null> => {
  let json: string | null;
  if (Platform.OS === 'web') {
    json = localStorage.getItem(USER_KEY);
  } else {
    json = await SecureStore.getItemAsync(USER_KEY);
  }
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};

const deleteUser = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(USER_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(USER_KEY);
};

export const tokenStore = {
  set: storeToken,
  get: readToken,
  clear: deleteToken,
};

export const userStore = {
  set: storeUser,
  get: readCachedUser,
  clear: deleteUser,
};

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  // When false, no Authorization header is attached (e.g. login/register).
  auth?: boolean;
  // Query params for GET.
  query?: Record<string, string | number | boolean | undefined>;
  // Override the default JSON content type (e.g. multipart/form-data).
  contentType?: string;
  // Raw body string when caller has already serialized (e.g. FormData).
  rawBody?: BodyInit;
};

const buildQuery = (query?: RequestOptions['query']): string => {
  if (!query) return '';
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return params.length ? `?${params.join('&')}` : '';
};

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    auth = true,
    query,
    contentType = 'application/json',
    rawBody,
  } = options;

  const url = `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}${buildQuery(query)}`;

  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;

  if (auth) {
    const token = await readToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers };
  if (rawBody !== undefined) {
    init.body = rawBody;
  } else if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new ApiError(
      'Network error. Check your connection and that the backend is reachable.',
      0,
      { error: String(e) },
    );
  }

  const isJson =
    res.headers.get('content-type')?.includes('application/json') ?? false;
  const parsed = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (isJson && parsed && typeof parsed === 'object' && 'message' in parsed && String((parsed as { message: unknown }).message)) ||
      (typeof parsed === 'string' && parsed) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, parsed);
  }

  return parsed as T;
}

// Convenience verbs.
export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) =>
    apiFetch<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    apiFetch<T>(path, { method: 'POST', body, auth }),
  put: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
