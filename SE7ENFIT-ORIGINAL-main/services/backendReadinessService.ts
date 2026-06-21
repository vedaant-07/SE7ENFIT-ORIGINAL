// Backend readiness / endpoint contract service - SE7EN FIT
// This centralizes the production endpoint contract used by the app.

import { apiFetch, API_BASE_URL } from './apiClient';

export type BackendEndpoint = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  area: 'auth' | 'user' | 'gym_owner' | 'ads' | 'tracking' | 'notifications' | 'payments';
  requiredForProduction: boolean;
};

export const BACKEND_ENDPOINT_CONTRACT: BackendEndpoint[] = [
  { method: 'POST', path: '/auth/login', area: 'auth', requiredForProduction: true },
  { method: 'POST', path: '/auth/register', area: 'auth', requiredForProduction: true },
  { method: 'GET', path: '/auth/me', area: 'auth', requiredForProduction: true },
  { method: 'POST', path: '/auth/logout', area: 'auth', requiredForProduction: true },
  { method: 'GET', path: '/users/me/profile', area: 'user', requiredForProduction: true },
  { method: 'GET', path: '/tracking', area: 'tracking', requiredForProduction: true },
  { method: 'POST', path: '/tracking', area: 'tracking', requiredForProduction: true },
  { method: 'POST', path: '/tracking/bulk', area: 'tracking', requiredForProduction: true },
  { method: 'POST', path: '/tracking/live-sessions', area: 'tracking', requiredForProduction: true },
  { method: 'PATCH', path: '/tracking/live-sessions/:id', area: 'tracking', requiredForProduction: true },
  { method: 'GET', path: '/gym-owners/me', area: 'gym_owner', requiredForProduction: true },
  { method: 'GET', path: '/gym-owner/members', area: 'gym_owner', requiredForProduction: true },
  { method: 'GET', path: '/gym-owner/attendance', area: 'gym_owner', requiredForProduction: true },
  { method: 'GET', path: '/advertisements/user-dashboard', area: 'ads', requiredForProduction: true },
  { method: 'GET', path: '/gym-owner/advertisements', area: 'ads', requiredForProduction: true },
  { method: 'POST', path: '/notifications/register-device', area: 'notifications', requiredForProduction: true },
  { method: 'POST', path: '/notifications/unregister-device', area: 'notifications', requiredForProduction: true },
  { method: 'POST', path: '/payments/create-order', area: 'payments', requiredForProduction: false },
  { method: 'POST', path: '/payments/verify', area: 'payments', requiredForProduction: false },
];

export async function checkBackendReachability(): Promise<{ ok: boolean; baseUrl: string; message: string }> {
  try {
    await apiFetch('/health', { method: 'GET', auth: false });
    return { ok: true, baseUrl: API_BASE_URL, message: 'Backend health endpoint reachable.' };
  } catch {
    try {
      await apiFetch('/', { method: 'GET', auth: false });
      return { ok: true, baseUrl: API_BASE_URL, message: 'Backend root reachable. Add /health for stronger monitoring.' };
    } catch {
      return { ok: false, baseUrl: API_BASE_URL, message: 'Backend not reachable from this device/network.' };
    }
  }
}
