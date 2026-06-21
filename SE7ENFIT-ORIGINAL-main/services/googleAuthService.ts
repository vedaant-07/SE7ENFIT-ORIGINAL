// Google OAuth Service - SE7EN FIT
// Android APK uses native Google Sign-In to avoid OAuth custom-scheme 400 errors.

import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { authService, type AuthSession, type UserRole } from './authService';
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '@/src/config/env';

export const isGoogleConfigured = Boolean(GOOGLE_WEB_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID || GOOGLE_IOS_CLIENT_ID);

type GoogleAuthResult = {
  type?: string;
  params?: Record<string, string | undefined>;
  authentication?: { idToken?: string; accessToken?: string } | null;
  errorCode?: string;
};

type NativeGoogleModule = {
  GoogleSignin: {
    configure: (options: Record<string, unknown>) => void;
    hasPlayServices: (options?: Record<string, unknown>) => Promise<boolean>;
    signIn: () => Promise<unknown>;
    getTokens: () => Promise<{ idToken?: string; accessToken?: string }>;
  };
};

function readNestedString(value: unknown, path: string[]): string | undefined {
  let current: unknown = value;
  for (const key of path) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' && current.trim() ? current : undefined;
}

function makeErrorResponse(errorCode: string): GoogleAuthResult {
  return { type: 'error', errorCode, params: {} };
}

export function useGoogleAuthRequest() {
  const [response, setResponse] = useState<GoogleAuthResult | null>(null);

  const promptAsync = useCallback(async () => {
    if (!isGoogleConfigured) {
      const result = makeErrorResponse('google_oauth_not_configured');
      setResponse(result);
      return result;
    }

    if (Platform.OS === 'web') {
      const result = makeErrorResponse('google_web_not_supported_in_apk_build');
      setResponse(result);
      return result;
    }

    try {
      const nativeGoogle = require('@react-native-google-signin/google-signin') as NativeGoogleModule;
      nativeGoogle.GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
        offlineAccess: false,
        forceCodeForRefreshToken: false,
      });
      await nativeGoogle.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await nativeGoogle.GoogleSignin.signIn();
      const tokens = await nativeGoogle.GoogleSignin.getTokens().catch(() => ({}));
      const idToken = tokens.idToken || readNestedString(signInResult, ['idToken']) || readNestedString(signInResult, ['data', 'idToken']);
      const accessToken = tokens.accessToken || readNestedString(signInResult, ['accessToken']) || readNestedString(signInResult, ['data', 'accessToken']);

      if (!idToken && !accessToken) {
        const result = makeErrorResponse('google_token_missing');
        setResponse(result);
        return result;
      }

      const result: GoogleAuthResult = {
        type: 'success',
        params: { id_token: idToken, access_token: accessToken },
        authentication: { idToken, accessToken },
      };
      setResponse(result);
      return result;
    } catch (error) {
      const result = makeErrorResponse(error instanceof Error ? error.message : 'google_native_sign_in_failed');
      setResponse(result);
      return result;
    }
  }, []);

  useEffect(() => {
    setResponse(null);
  }, []);

  return [isGoogleConfigured ? {} : null, response, promptAsync] as const;
}

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
