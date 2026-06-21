// Google OAuth Service - SE7EN FIT
// Handles Google Sign-In via expo-auth-session and sends the token to the Render backend.
//
// Setup required:
// 1. Create a project at https://console.cloud.google.com/apis/credentials
// 2. Add OAuth 2.0 Client IDs (Web, Android, iOS)
// 3. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
//    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in your .env file
// 4. Backend must implement: POST /auth/google
//    - Accepts: { token: googleAccessToken }
//    - Returns: { access_token: jwtToken, user: AuthUser }

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { api } from './apiClient';
import type { AuthSession } from './authService';

// Required for expo-auth-session to close the browser after redirect.
WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

export const isGoogleConfigured = Boolean(GOOGLE_WEB_CLIENT_ID);

/**
 * Send the Google access token to the Render backend.
 * Backend must verify the token with Google and return a JWT session.
 *
 * TODO: Backend must implement POST /auth/google
 * Expected request body: { token: string, provider: 'google' }
 * Expected response: { access_token: string, user: AuthUser }
 */
export async function loginWithGoogleToken(googleAccessToken: string): Promise<AuthSession> {
  return api.post<AuthSession>('/auth/google', {
    token: googleAccessToken,
    provider: 'google',
  }, false);
}

// Re-export the hook builder for use in components.
// Usage in component:
//   const [request, response, promptAsync] = useGoogleAuthRequest();
export function useGoogleAuthRequest() {
  return Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    redirectUri: makeRedirectUri({ scheme: 'se7enfit' }),
  });
}
