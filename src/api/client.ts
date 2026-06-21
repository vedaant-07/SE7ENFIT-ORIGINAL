// API Client for SE7EN FIT
// Base Axios-like client using fetch with auth token injection, timeout, and error handling.
// Token stored in SecureStore (not AsyncStorage).

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/env';

const TOKEN_KEY = 'se7enfit_auth_token';
const USER_KEY = 'se7enfit_user';
const REQUEST_TIMEOUT = 30000;

// SecureStore fallback for web (localStorage)
const secureSet = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const secureGet = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
};

const secureDelete = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
};

export const tokenStore = {
  set: (token: string) => secureSet(TOKEN_KEY, token),
  get: () => secureGet(TOKEN_KEY),
  clear: () => secureDelete(TOKEN_KEY),
};

export const userCache = {
  set: (user: unknown) => secureSet(USER_KEY, JSON.stringify(user)),
  get: async <T>(): Promise<T | null> => {
    const json = await secureGet(USER_KEY);
    if (!json) return null;
    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  },
  clear: () => secureDelete(USER_KEY),
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
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
};

const buildQueryString = (query?: RequestOptions['query']): string => {
  if (!query) return '';
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return params.length > 0 ? `?${params.join('&')}` : '';
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, query, headers: extraHeaders = {} } = options;

  const queryString = buildQueryString(query);
  const url = `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}${queryString}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (auth) {
    const token = await tokenStore.get();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const isJson = response.headers.get('content-type')?.includes('application/json') ?? false;
    let data: unknown = null;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch {
      // Response body parsing failed
    }

    if (!response.ok) {
      let message: string;
      if (isJson && data && typeof data === 'object' && 'message' in data) {
        message = String((data as { message: unknown }).message);
      } else if (typeof data === 'string' && data) {
        message = data;
      } else {
        message = `Request failed (${response.status})`;
      }
      throw new ApiError(message, response.status, data ?? undefined);
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 0);
    }
    throw new ApiError('Network error. Check your connection.', 0, { error: String(error) });
  }
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) =>
    apiRequest<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    apiRequest<T>(path, { method: 'POST', body, auth }),
  put: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) =>
    apiRequest<T>(path, { method: 'DELETE' }),
};
