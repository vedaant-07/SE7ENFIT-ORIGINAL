// SE7EN FIT Environment Configuration
// Backend API: Render (TiDB/MySQL + Supabase admin bridge)

const env = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env;

export const API_BASE_URL = env?.EXPO_PUBLIC_API_BASE_URL || 'https://se7en-fit.onrender.com/api';
export const ADMIN_DASHBOARD_URL = env?.EXPO_PUBLIC_ADMIN_DASHBOARD_URL || 'https://se7enfit-admin.onrender.com/admin';

export const config = {
  apiBaseUrl: API_BASE_URL,
  adminDashboardUrl: ADMIN_DASHBOARD_URL,
  appVersion: '1.0.0',
  timeout: 30000,
};
