import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ImageIcon, LogOut, MessageSquare, Settings, User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Screen from '@/components/se7enfit/Screen';
import Card from '@/components/se7enfit/Card';
import TopBar from '@/components/se7enfit/TopBar';
import Button from '@/components/se7enfit/Button';
import Input from '@/components/se7enfit/Input';
import ErrorBanner from '@/components/se7enfit/ErrorBanner';
import LoadingScreen from '@/components/se7enfit/LoadingScreen';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userServices';
import { ApiError } from '@/services/apiClient';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useState(() => {
    (async () => {
      try {
        const p = await userService.getProfile();
        setProfile(p);
        setName(p.name || '');
      } finally {
        setLoading(false);
      }
    })();
  });

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await userService.upsertProfile({ name });
      setProfile(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled && result.assets?.[0]) {
      // Upload hook goes here — POST to your backend's avatar endpoint.
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <TopBar title="Profile" showLogo right={
        <Button label="Logout" variant="ghost" size="sm" fullWidth={false} onPress={async () => { await logout(); router.replace('/welcome'); }} style={{ paddingHorizontal: 10, height: 34 }} />
      } />

      {/* Avatar + name */}
      <Card style={{ alignItems: 'center', marginBottom: spacing.lg }}>
        <Text>Avatar placeholder</Text>
        <Text style={{ fontFamily: typography.headingBold, fontSize: 18, color: colors.foreground, marginTop: spacing.sm }}>
          {profile?.name || 'Athlete'}
        </Text>
        <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.mutedForeground }}>{profile?.email || user?.email}</Text>
        <Button label="Edit Avatar" variant="outline" size="sm" fullWidth={false} onPress={pickAvatar} style={{ marginTop: spacing.sm, paddingHorizontal: 14, height: 36 }} />
      </Card>

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
        <Input label="Name" leftIcon={<User size={16} color={colors.mutedForeground} />} value={name} onChangeText={setName} />
        <Input label="Email" leftIcon={<User size={16} color={colors.mutedForeground} />} value={profile?.email || user?.email || ''} editable={false} />
        <Button label={saving ? 'Saving…' : 'Save'} onPress={save} loading={saving} />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Button label="My Gym" variant="ghost" onPress={() => router.push('/(user)/my-gym')} />
        <Button label="Subscription" variant="ghost" onPress={() => router.push('/(user)/subscription')} />
        <Button label="Support" variant="ghost" onPress={() => router.push('/(user)/support')} />
        <Button label="Terms & Privacy" variant="ghost" onPress={() => router.push('/(auth)/policy')} />
      </View>
    </Screen>
  );
}
