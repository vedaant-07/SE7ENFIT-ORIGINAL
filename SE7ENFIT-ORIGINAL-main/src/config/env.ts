// SE7EN FIT Environment Configuration
// Google OAuth client IDs are public identifiers, but still kept in build-time env
// so APKs can be rebuilt safely for debug, preview, and production signing keys.

type RuntimeEnv = Record<string, string | undefined>;

const runtimeEnv = (globalThis as unknown as { process?: { env?: RuntimeEnv } }).process?.env ?? {};

export const API_BASE_URL = runtimeEnv.EXPO_PUBLIC_API_BASE_URL || 'https://se7en-fit.onrender.com';

export const GOOGLE_WEB_CLIENT_ID = runtimeEnv.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

export const GOOGLE_ANDROID_CLIENT_ID = runtimeEnv.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

export const GOOGLE_IOS_CLIENT_ID = runtimeEnv.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

export const config = {
  apiBaseUrl: API_BASE_URL,
  googleWebClientId: GOOGLE_WEB_CLIENT_ID,
  googleAndroidClientId: GOOGLE_ANDROID_CLIENT_ID,
  googleIosClientId: GOOGLE_IOS_CLIENT_ID,
  appVersion: '1.0.0',
  timeout: 30000,
};