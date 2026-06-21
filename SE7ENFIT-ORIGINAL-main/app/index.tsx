// Root entry — auth gate with role-based navigation.
//   - loading → LoadingScreen
//   - user role → /(user)
//   - gym_owner role → /(gym-owner)
//   - not authed → /welcome

import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';

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
  if (role === 'gym_owner') {
    return <Redirect href="/(gym-owner)/dashboard" />;
  }

  // Default to user app
  return <Redirect href="/(user)" />;
}
