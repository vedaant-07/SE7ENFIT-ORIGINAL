import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';

// Gym owner app — stack layout, no bottom nav.
// Role guard: only accessible by users with role === 'gym_owner'.
export default function GymOwnerLayout() {
  const { user, token, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoadingAuth) return;

    // No token -> redirect to welcome
    if (!token) {
      router.replace('/welcome');
      return;
    }

    // Has token but no user info -> wait for user load
    if (!user) return;

    const role = user.role;

    // Wrong role -> redirect to correct dashboard
    if (role === 'user') {
      router.replace('/(user)');
    }
    // role === 'gym_owner' -> stay here
  }, [isLoadingAuth, token, user, router]);

  // Show loading while checking auth
  if (isLoadingAuth || (!isLoadingAuth && token && !user)) {
    return <LoadingScreen />;
  }

  // Don't render if not authenticated or wrong role
  if (!token || !user || user.role !== 'gym_owner') {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="members" />
      <Stack.Screen name="attendance" />
      <Stack.Screen name="leads" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="announcements" />
      <Stack.Screen name="advertisements" />
      <Stack.Screen name="equipment" />
      <Stack.Screen name="owner-challenges" />
      <Stack.Screen name="owner-rewards" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="referrals" />
      <Stack.Screen name="gym-profile" />
    </Stack>
  );
}
