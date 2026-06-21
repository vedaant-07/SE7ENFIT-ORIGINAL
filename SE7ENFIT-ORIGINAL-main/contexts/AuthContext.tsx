// Auth context for SE7EN FIT mobile.
// Surface: isLoadingAuth, authError, login, logout, etc.
// Token is stored in SecureStore (native) / localStorage (web).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { authService, type AuthUser, type LoginPayload, type RegisterPayload } from '@/services/authService';
import { tokenStore, userStore } from '@/services/apiClient';
import { ApiError } from '@/services/apiClient';

export type AuthErrorState = { type: string; message?: string } | null;

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoadingAuth: boolean;
  authError: AuthErrorState;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  verifyOtp: (email: string, otpCode: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setSession: (token: string, user?: AuthUser) => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<AuthErrorState>(null);

  // Guard against concurrent /auth/me calls during boot.
  const bootStartedRef = useRef(false);

  const setSession = useCallback(async (newToken: string, newUser?: AuthUser) => {
    await tokenStore.set(newToken);
    setToken(newToken);
    if (newUser) {
      setUser(newUser);
      await userStore.set(newUser);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    if (!token) return null;
    try {
      const me = await authService.me();
      setUser(me);
      await userStore.set(me);
      return me;
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        // Token invalid — drop session.
        await tokenStore.clear();
        await userStore.clear();
        setToken(null);
        setUser(null);
      }
      return null;
    }
  }, [token]);

  // Boot: restore token + try /auth/me. Falls back to cached user if backend
  // is unreachable so the UI can still render.
  useEffect(() => {
    if (bootStartedRef.current) return;
    bootStartedRef.current = true;
    (async () => {
      const storedToken = await tokenStore.get();
      const cachedUser = await userStore.get<AuthUser>();
      if (cachedUser) setUser(cachedUser);
      if (!storedToken) {
        setToken(null);
        setIsLoadingAuth(false);
        return;
      }
      setToken(storedToken);
      try {
        const me = await authService.me();
        setUser(me);
        await userStore.set(me);
      } catch (e) {
        // In production, never allow a cached user through with a token that the
        // backend has explicitly rejected. Keep cached user only for non-auth
        // failures such as temporary network issues.
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          await tokenStore.clear();
          await userStore.clear();
          setToken(null);
          setUser(null);
        }
      } finally {
        setIsLoadingAuth(false);
      }
    })();
  }, [refreshUser]);

  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthUser> => {
      setAuthError(null);
      try {
        const session = await authService.login(payload);
        if (!session?.access_token) {
          throw new ApiError('No access token returned from server.', 500);
        }
        await setSession(session.access_token, session.user);
        // If backend didn't return user in login response, fetch /me.
        if (!session.user) {
          const me = await authService.me();
          setUser(me);
          await userStore.set(me);
          return me;
        }
        return session.user;
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Login failed';
        setAuthError({ type: 'login_failed', message: msg });
        throw e;
      }
    },
    [setSession],
  );

  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    setAuthError(null);
    try {
      const session = await authService.register(payload);
      // If backend returns tokens immediately (no OTP step), hydrate session.
      if (session && typeof session === 'object' && 'access_token' in session && session.access_token) {
        await setSession(session.access_token, (session as { user?: AuthUser }).user);
      }
      // Otherwise the caller navigates to the OTP step.
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Registration failed';
      setAuthError({ type: 'register_failed', message: msg });
      throw e;
    }
  }, [setSession]);

  const verifyOtp = useCallback(
    async (email: string, otpCode: string): Promise<AuthUser> => {
      setAuthError(null);
      try {
        const session = await authService.verifyOtp({ email, otpCode });
        if (!session?.access_token) {
          throw new ApiError('No access token returned from server.', 500);
        }
        await setSession(session.access_token, session.user);
        if (!session.user) {
          const me = await authService.me();
          setUser(me);
          await userStore.set(me);
          return me;
        }
        return session.user;
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Verification failed';
        setAuthError({ type: 'otp_failed', message: msg });
        throw e;
      }
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    await tokenStore.clear();
    await userStore.clear();
    setUser(null);
    setToken(null);
    setAuthError(null);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoadingAuth,
      authError,
      login,
      register,
      verifyOtp,
      logout,
      setSession,
      refreshUser,
      clearAuthError,
    }),
    [user, token, isLoadingAuth, authError, login, register, verifyOtp, logout, setSession, refreshUser, clearAuthError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
