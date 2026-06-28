// Root entry — auth gate with role-based navigation.
//   - loading → LoadingScreen
//   - admin/staff role → /admin
//   - user role → /(user)
//   - gym_owner role → /(gym-owner)
//   - not authed → /welcome

import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';

const ADMIN_ROLES = new Set(['super_admin', 'admin', 'staff']);

export default function Index() {
  const { isLoadingAuth, user, token } = useAuth();

  // Show loading while checking auth state
  if (isLoadingAuth) {
    return <LoadingScreen />;
  }

  // Not authenticated → welcome screen
  if (!token || !user) {
    return <Redirect href="/welcome" />;
  }

  // Role-based navigation
  const role = user.role;

  if (role && ADMIN_ROLES.has(role)) {
    return <Redirect href="/admin" />;
  }

  if (role === 'gym_owner') {
    return <Redirect href="/(gym-owner)/dashboard" />;
  }

  // Default to user app
  return <Redirect href="/(user)" />;
}
