// Base API client for the SE7EN-FIT Render backend.
// All app code imports from this — no direct fetch() elsewhere.

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL as CONFIG_API_BASE_URL } from '@/src/config/env';

export const API_BASE_URL = CONFIG_API_BASE_URL;

const TOKEN_KEY = 'se7enfit_auth_token';
const USER_KEY = 'se7enfit_user';

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
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
  contentType?: string;
  rawBody?: BodyInit;
};

const buildQuery = (query?: RequestOptions['query']): string => {
  if (!query) return '';
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return params.length ? `?${params.join('&')}` : '';
};

const extractMessageFromBody = (body: unknown): string | null => {
  if (!body) return null;
  if (typeof body === 'string') {
    const text = body.trim();
    if (!text) return null;
    const isHtml = /<!doctype html|<html|<body|<pre>/i.test(text);
    if (isHtml) {
      const pre = text.match(/<pre>([\s\S]*?)<\/pre>/i)?.[1]
        ?.replace(/<[^>]+>/g, '')
        ?.replace(/&lt;/g, '<')
        ?.replace(/&gt;/g, '>')
        ?.replace(/&amp;/g, '&')
        ?.trim();
      if (pre?.includes('Cannot POST')) {
        return 'Login service is not available on the backend yet. Please check Render API routes.';
      }
      return 'Server returned an invalid HTML response. Please check backend API route configuration.';
    }
    return text.slice(0, 180);
  }
  if (typeof body === 'object') {
    const record = body as Record<string, unknown>;
    const candidates = [record.message, record.error, record.detail, record.description];
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
  }
  return null;
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
      'Network error. Check your internet connection and Render backend status.',
      0,
      { error: String(e) },
    );
  }

  const contentTypeHeader = res.headers.get('content-type') ?? '';
  const isJson = contentTypeHeader.includes('application/json');
  const parsed = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message = extractMessageFromBody(parsed) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, parsed);
  }

  return parsed as T;
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) =>
    apiFetch<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    apiFetch<T>(path, { method: 'POST', body, auth }),
  put: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
