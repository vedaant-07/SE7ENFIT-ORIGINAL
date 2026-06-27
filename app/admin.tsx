import { useEffect } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const ADMIN_DASHBOARD_URL = process.env.EXPO_PUBLIC_ADMIN_DASHBOARD_URL;

function openAdminDashboard() {
  if (!ADMIN_DASHBOARD_URL) return;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.assign(ADMIN_DASHBOARD_URL);
    return;
  }

  Linking.openURL(ADMIN_DASHBOARD_URL).catch(() => undefined);
}

export default function AdminDashboardRoute() {
  useEffect(() => {
    openAdminDashboard();
  }, []);

  const configured = Boolean(ADMIN_DASHBOARD_URL);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>SE7EN FIT ADMIN</Text>
        <Text style={styles.title}>Admin dashboard</Text>
        <Text style={styles.description}>
          {configured
            ? 'Opening the super admin dashboard connected to your app and website.'
            : 'Admin dashboard URL is not configured yet. Add EXPO_PUBLIC_ADMIN_DASHBOARD_URL to your website environment variables.'}
        </Text>

        {configured ? (
          <Pressable style={styles.button} onPress={openAdminDashboard}>
            <Text style={styles.buttonText}>Open dashboard</Text>
          </Pressable>
        ) : (
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>EXPO_PUBLIC_ADMIN_DASHBOARD_URL=https://your-admin-domain.com/admin</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(32, 197, 93, 0.25)',
    backgroundColor: '#101010',
    padding: 28,
  },
  eyebrow: {
    color: '#20c55d',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 12,
  },
  description: {
    color: '#a3a3a3',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#20c55d',
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#031006',
    fontSize: 15,
    fontWeight: '800',
  },
  codeBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#050505',
    padding: 14,
  },
  codeText: {
    color: '#f5f5f5',
    fontSize: 13,
    lineHeight: 20,
  },
});
