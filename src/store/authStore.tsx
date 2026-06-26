// Auth Store - SE7EN FIT
// Centralized auth state management with role-based access.
// Token stored in SecureStore (not AsyncStorage).

import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react';
import { tokenStore, userCache, ApiError } from '../api/client';
import * as authApi from '../api/authApi';
import type { AuthUser } from '../api/authApi';

export type UserRole = 'user' | 'gym_owner' | null;

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type AuthStore = AuthState & {
  loginUser: (email: string, password: string) => Promise<AuthUser>;
  signupUser: (payload: { email: string; password: string; name?: string; mobile?: string }) => Promise<void>;
  loginGymOwner: (email: string, password: string) => Promise<AuthUser>;
  signupGymOwner: (payload: { email: string; password: string; owner_name: string; gym_name: string; mobile?: string }) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setSession: (token: string, user?: AuthUser) => Promise<void>;
};

const demoUsers: Record<'user' | 'gym_owner', AuthUser & { password: string }> = {
  user: {
    id: 'demo-user-001',
    email: 'user@se7en.fit',
    password: 'user123',
    name: 'Demo SE7EN FIT User',
    role: 'user',
    membershipStatus: 'active',
    linkedGymId: 'demo-gym-001',
    points: 1250,
  },
  gym_owner: {
    id: 'demo-owner-001',
    email: 'owner@se7en.fit',
    password: 'owner123',
    name: 'Demo Gym Owner',
    role: 'gym_owner',
    gymId: 'demo-gym-001',
    gymName: 'SE7EN FIT Demo Gym',
  },
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

function getDemoUser(role: 'user' | 'gym_owner', email: string, password: string): AuthUser | null {
  const demo = demoUsers[role];
  if (normalizeEmail(email) !== demo.email || password !== demo.password) {
    return null;
  }

  const user = { ...demo } as AuthUser & { password?: string };
  delete user.password;
  return user;
}

function createDemoToken(role: 'user' | 'gym_owner') {
  return `demo-${role}-token-${Date.now()}`;
}

const AuthStoreContext = createContext<AuthStore | undefined>(undefined);

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const restoreAttempted = useRef(false);

  const role: UserRole = user?.role || null;
  const isAuthenticated = !!token && !!user;

  const setSession = useCallback(async (newToken: string, newUser?: AuthUser) => {
    await tokenStore.set(newToken);
    setToken(newToken);
    if (newUser) {
      setUser(newUser);
      await userCache.set(newUser);
    }
  }, []);

  const restoreSession = useCallback(async () => {
    if (restoreAttempted.current) return;
    restoreAttempted.current = true;

    const storedToken = await tokenStore.get();
    const cachedUser = await userCache.get<AuthUser>();

    if (cachedUser) {
      setUser(cachedUser);
    }

    if (!storedToken) {
      setToken(null);
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    if (storedToken.startsWith('demo-') && cachedUser) {
      setIsLoading(false);
      return;
    }

    try {
      const me = await authApi.getMe();
      setUser(me);
      await userCache.set(me);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        await tokenStore.clear();
        await userCache.clear();
        setToken(null);
        setUser(null);
      }
      // Keep cached user if backend is unreachable
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const loginUser = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const demoUser = getDemoUser('user', email, password);
    if (demoUser) {
      await setSession(createDemoToken('user'), demoUser);
      return demoUser;
    }

    const session = await authApi.userLogin(email, password);
    if (!session?.access_token) {
      throw new ApiError('No access token returned from server.', 500);
    }
    await setSession(session.access_token, session.user);
    if (!session.user) {
      const me = await authApi.getMe();
      setUser(me);
      await userCache.set(me);
      return me;
    }
    return session.user;
  }, [setSession]);

  const signupUser = useCallback(async (payload: {
    email: string;
    password: string;
    name?: string;
    mobile?: string;
  }): Promise<void> => {
    const result = await authApi.userSignup(payload);
    if (result && 'access_token' in result && result.access_token) {
      await setSession(result.access_token, result.user);
    }
    // If requires_otp, caller navigates to OTP screen
  }, [setSession]);

  const loginGymOwner = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const demoUser = getDemoUser('gym_owner', email, password);
    if (demoUser) {
      await setSession(createDemoToken('gym_owner'), demoUser);
      return demoUser;
    }

    const session = await authApi.gymOwnerLogin(email, password);
    if (!session?.access_token) {
      throw new ApiError('No access token returned from server.', 500);
    }
    await setSession(session.access_token, session.user);
    if (!session.user) {
      const me = await authApi.getMe();
      setUser(me);
      await userCache.set(me);
      return me;
    }
    return session.user;
  }, [setSession]);

  const signupGymOwner = useCallback(async (payload: {
    email: string;
    password: string;
    owner_name: string;
    gym_name: string;
    mobile?: string;
  }): Promise<void> => {
    const result = await authApi.gymOwnerSignup(payload);
    if (result && 'access_token' in result && result.access_token) {
      await setSession(result.access_token, result.user);
    }
  }, [setSession]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort logout
    }
    await tokenStore.clear();
    await userCache.clear();
    setToken(null);
    setUser(null);
  }, []);

  const store = useMemo<AuthStore>(() => ({
    token,
    user,
    role,
    isAuthenticated,
    isLoading,
    loginUser,
    signupUser,
    loginGymOwner,
    signupGymOwner,
    logout,
    restoreSession,
    setSession,
  }), [token, user, role, isAuthenticated, isLoading, loginUser, signupUser, loginGymOwner, signupGymOwner, logout, restoreSession, setSession]);

  return (
    <AuthStoreContext.Provider value={store}>
      {children}
    </AuthStoreContext.Provider>
  );
}

export function useAuthStore(): AuthStore {
  const store = useContext(AuthStoreContext);
  if (!store) {
    throw new Error('useAuthStore must be used within an AuthStoreProvider');
  }
  return store;
}
