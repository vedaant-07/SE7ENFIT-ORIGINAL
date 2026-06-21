// SE7EN FIT Environment Configuration
// Client IDs are public OAuth identifiers, not secrets. Environment variables override these defaults.

type RuntimeEnv = Record<string, string | undefined>;

const runtimeEnv = (globalThis as unknown as { process?: { env?: RuntimeEnv } }).process?.env ?? {};

export const API_BASE_URL = runtimeEnv.EXPO_PUBLIC_API_BASE_URL || 'https://se7en-fit.onrender.com';

export const GOOGLE_WEB_CLIENT_ID =
  runtimeEnv.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '10666408411-4t6tm45luqqa1q8la40f8q44r5js1rik.apps.googleusercontent.com';

export const GOOGLE_ANDROID_CLIENT_ID =
  runtimeEnv.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '106664084110iaj88pvijfgcl4it0cff6dm62326h1d.apps.googleusercontent.com';

export const GOOGLE_IOS_CLIENT_ID =
  runtimeEnv.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

export const config = {
  apiBaseUrl: API_BASE_URL,
  googleWebClientId: GOOGLE_WEB_CLIENT_ID,
  googleAndroidClientId: GOOGLE_ANDROID_CLIENT_ID,
  googleIosClientId: GOOGLE_IOS_CLIENT_ID,
  appVersion: '1.0.0',
  timeout: 30000,
};
