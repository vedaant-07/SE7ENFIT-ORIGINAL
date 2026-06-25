import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/env';
import { googleLogin as googleLoginBackend } from '../api/authApi';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleLogin = (role: 'user' | 'gym_owner' = 'user') => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    // For Android/iOS native builds, we need expo-google-sign-in, but for expo go and web, expo-auth-session works
    // In production, you should set these from env vars
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['email', 'profile'],
  });

  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();
      
      if (result.type === 'success' && result.authentication?.idToken) {
        const authSession = await googleLoginBackend(result.authentication.idToken, role);
        return authSession;
      }
      
      throw new Error('Google login cancelled or failed');
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  return {
    signInWithGoogle,
    loading: request === null,
    isLoading: request === null,
    request,
    response,
  };
};
