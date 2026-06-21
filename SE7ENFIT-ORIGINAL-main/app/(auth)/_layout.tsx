import { Stack } from 'expo-router';

// Auth flow stack — welcome/login/signup screens. No bottom nav.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
      <Stack.Screen name="user-login" />
      <Stack.Screen name="user-signup" />
      <Stack.Screen name="gym-owner-login" />
      <Stack.Screen name="gym-owner-signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="policy" />
    </Stack>
  );
}
