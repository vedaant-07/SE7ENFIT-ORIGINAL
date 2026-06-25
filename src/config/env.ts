// SE7EN FIT environment configuration.
// For local/dev builds, set EXPO_PUBLIC_API_BASE_URL in your shell or EAS environment.
// Example: EXPO_PUBLIC_API_BASE_URL=https://se7en-fit.onrender.com

const runtimeEnv = (
  globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }
).process?.env;

export const API_BASE_URL =
  runtimeEnv?.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'https://se7en-fit.onrender.com';

export const config = {
  apiBaseUrl: API_BASE_URL,
  appVersion: '1.0.0',
  timeoutMs: 30000,
};
