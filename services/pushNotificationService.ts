// Push Notification Service - SE7EN FIT
// Uses Expo Notifications when available in a native/dev-client build.
// Safe no-op fallback keeps Expo Go/web from crashing when native module is absent.

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './apiClient';

type PushRegistration = {
  expoPushToken: string;
  platform: string;
  projectId?: string;
  device?: Record<string, unknown>;
};

async function loadNotifications() {
  try { return await import('expo-notifications'); } catch { return null; }
}

async function loadDevice() {
  try { return await import('expo-device'); } catch { return null; }
}

export async function configurePushNotificationHandler(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (!Notifications) return false;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'SE7EN FIT',
      importance: Notifications.AndroidImportance?.MAX ?? 5,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4FF00',
    }).catch(() => undefined);
  }

  return true;
}

export async function registerForPushNotifications(): Promise<PushRegistration | null> {
  const Notifications = await loadNotifications();
  const Device = await loadDevice();
  if (!Notifications || !Device || Platform.OS === 'web') return null;
  if (!Device.isDevice) return null;

  await configurePushNotificationHandler();

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') return null;

  const projectId =
    (Constants.expoConfig?.extra as any)?.eas?.projectId ??
    (Constants.easConfig as any)?.projectId;

  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  const registration: PushRegistration = {
    expoPushToken: token.data,
    platform: Platform.OS,
    projectId,
    device: {
      osName: Device.osName,
      osVersion: Device.osVersion,
      deviceName: Device.deviceName,
      modelName: Device.modelName,
    },
  };

  await api.post('/notifications/register-device', registration).catch(() => undefined);
  return registration;
}

export async function unregisterPushNotifications(expoPushToken?: string): Promise<void> {
  await api.post('/notifications/unregister-device', { expoPushToken, platform: Platform.OS }).catch(() => undefined);
}

export async function addNotificationListeners(handlers: {
  onReceive?: (notification: unknown) => void;
  onResponse?: (response: unknown) => void;
}): Promise<() => void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return () => undefined;

  const receiveSub = handlers.onReceive
    ? Notifications.addNotificationReceivedListener(handlers.onReceive)
    : null;
  const responseSub = handlers.onResponse
    ? Notifications.addNotificationResponseReceivedListener(handlers.onResponse)
    : null;

  return () => {
    receiveSub?.remove();
    responseSub?.remove();
  };
}
