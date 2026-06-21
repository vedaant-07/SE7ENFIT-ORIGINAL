// Google OAuth Service - SE7EN FIT
// Handles Google Sign-In via expo-auth-session and sends the token to the Render backend.

declare const require: <T = unknown>(moduleName: string) => T;

import * as WebBrowser from 'expo-web-browser';
import { ResponseType } from 'expo-auth-session';
import { authService, type AuthSession, type UserRole } from './authService';
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '@/src/config/env';

WebBrowser.maybeCompleteAuthSession();

export const isGoogleConfigured = Boolean(GOOGLE_WEB_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID || GOOGLE_IOS_CLIENT_ID);

const unavailablePrompt = async () => ({
  type: 'error',
  errorCode: 'google_oauth_not_configured',
  params: {},
});

export function useGoogleAuthRequest() {
  // Avoid loading the Google provider when build-time IDs are missing. This keeps
  // User Login and Gym Owner Login from crashing just by opening the screen.
  if (!isGoogleConfigured) {
    return [null, null, unavailablePrompt] as const;
  }

  const Google = require<typeof import('expo-auth-session/providers/google')>('expo-auth-session/providers/google');
  return Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    scopes: ['openid', 'profile', 'email'],
    responseType: ResponseType.IdToken,
  });
}

type GoogleAuthResult = {
  type?: string;
  params?: Record<string, string | undefined>;
  authentication?: { idToken?: string; accessToken?: string } | null;
};

export function extractGoogleTokens(response: GoogleAuthResult): { idToken?: string; accessToken?: string } {
  const params = response.type === 'success' ? response.params ?? {} : {};
  const authentication = response.type === 'success' ? response.authentication ?? null : null;
  return {
    idToken: authentication?.idToken || params.id_token,
    accessToken: authentication?.accessToken || params.access_token,
  };
}

export async function loginWithGoogleResponse(response: GoogleAuthResult, role: UserRole): Promise<AuthSession> {
  const { idToken, accessToken } = extractGoogleTokens(response);
  if (!idToken && !accessToken) {
    throw new Error('Google sign-in failed. No Google token was returned. Recheck Google OAuth client IDs and SHA-1.');
  }
  return authService.loginWithGoogle({ idToken, accessToken, role });
}
