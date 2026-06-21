// SE7EN FIT Environment Configuration
// Backend API: Render (TiDB/MySQL)

const env = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env;

export const API_BASE_URL = env?.EXPO_PUBLIC_API_BASE_URL || 'https://se7en-fit.onrender.com';

export const config = {
  apiBaseUrl: API_BASE_URL,
  appVersion: '1.0.0',
  timeout: 30000,
};
