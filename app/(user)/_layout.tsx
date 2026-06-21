import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import BottomNav from '@/components/se7enfit/BottomNav';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';

// User app — stack layout with persistent bottom navigation.
// Role guard: only accessible by users with role === 'user'.
export default function UserLayout() {
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
    if (role === 'gym_owner') {
      router.replace('/(gym-owner)/dashboard');
    }
    // role === 'user' -> stay here
  }, [isLoadingAuth, token, user, router]);

  // Show loading while checking auth
  if (isLoadingAuth || (!isLoadingAuth && token && !user)) {
    return <LoadingScreen />;
  }

  // Don't render if not authenticated or wrong role
  if (!token || !user || user.role !== 'user') {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="workout" />
        <Stack.Screen name="workout-guide" />
        <Stack.Screen name="workout-log" />
        <Stack.Screen name="ai-trainer" />
        <Stack.Screen name="exercise-library" />
        <Stack.Screen name="nutrition" />
        <Stack.Screen name="nutrition-log" />
        <Stack.Screen name="food-scan" />
        <Stack.Screen name="tracking" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="challenges" />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="my-gym" />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="community" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="support" />
      </Stack>
      <BottomNav />
    </>
  );
}
