// Google OAuth Service - SE7EN FIT
// Uses expo-auth-session to get a Google ID token, then sends it to the Render backend.
//
// Setup required:
// 1. Google Cloud Console: https://console.cloud.google.com/apis/credentials
// 2. Create OAuth 2.0 Client IDs for Web, Android, and iOS
// 3. Add to .env:
//    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
//    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxx.apps.googleusercontent.com
//    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
// 4. For Android builds, add SHA-1 fingerprint to Google Console
// 5. For iOS builds, add bundle ID com.se7enfit.app

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType } from 'expo-auth-session';

// Close browser tab after redirect automatically
WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

export const isGoogleConfigured = Boolean(GOOGLE_WEB_CLIENT_ID);

/**
 * Hook to create the Google OAuth request.
 * Uses responseType 'id_token' so the backend can verify with Google directly.
 * Call promptAsync() to open the Google sign-in page.
 */
export function useGoogleAuthRequest() {
  return Google.useAuthRequest(
    {
      webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
      androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
      iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
      // Request ID token so backend can verify via Google's tokeninfo API
      responseType: ResponseType.IdToken,
      scopes: ['openid', 'profile', 'email'],
    }
  );
}

/**
 * Extract the Google ID token from an expo-auth-session success response.
 * Returns null if no token found.
 */
export function extractGoogleIdToken(
  response: ReturnType<typeof useGoogleAuthRequest>[1]
): string | null {
  if (!response || response.type !== 'success') return null;

  // ID token comes in params.id_token when using ResponseType.IdToken
  const params = (response as { type: 'success'; params?: Record<string, string> }).params;
  if (params?.id_token) return params.id_token;

  // Fallback: id_token from authentication object
  const auth = (response as { type: 'success'; authentication?: { idToken?: string | null } }).authentication;
  if (auth?.idToken) return auth.idToken;

  return null;
}
