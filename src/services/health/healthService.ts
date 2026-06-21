// Health Service - SE7EN FIT
// Cross-platform health data service.
// iOS: HealthKit (requires native prebuild)
// Android: Health Connect (requires Health Connect app installed)

import { Platform } from 'react-native';
import type { HealthSyncStatus, HealthDataPoint, HealthDataType, HealthPermissions } from './healthTypes';

// Platform-specific implementations
let healthModule: {
  isAvailable: () => Promise<boolean>;
  requestPermissions: (permissions: HealthPermissions) => Promise<boolean>;
  hasPermissions: () => Promise<boolean>;
  readData: (type: HealthDataType, startDate: Date, endDate: Date) => Promise<HealthDataPoint[]>;
  writeData: (data: HealthDataPoint) => Promise<boolean>;
} | null = null;

// Lazy load platform-specific module
async function getHealthModule() {
  if (healthModule) return healthModule;

  if (Platform.OS === 'ios') {
    // HealthKit requires native prebuild
    // TODO: Install expo-health-kit or react-native-health and configure
    // Currently returns placeholder
    healthModule = {
      isAvailable: async () => false, // Will be true after native setup
      requestPermissions: async () => false,
      hasPermissions: async () => false,
      readData: async () => [],
      writeData: async () => false,
    };
  } else if (Platform.OS === 'android') {
    // Health Connect requires native prebuild
    // TODO: Install react-native-health-connect and configure
    // Currently returns placeholder
    healthModule = {
      isAvailable: async () => false, // Will be true after native setup
      requestPermissions: async () => false,
      hasPermissions: async () => false,
      readData: async () => [],
      writeData: async () => false,
    };
  } else {
    // Web - no health data
    healthModule = {
      isAvailable: async () => false,
      requestPermissions: async () => false,
      hasPermissions: async () => false,
      readData: async () => [],
      writeData: async () => false,
    };
  }

  return healthModule;
}

export async function isHealthAvailable(): Promise<boolean> {
  const module = await getHealthModule();
  return module.isAvailable();
}

export async function getHealthSyncStatus(): Promise<HealthSyncStatus> {
  const available = await isHealthAvailable();
  const platform = Platform.OS as 'ios' | 'android' | 'web';

  if (!available) {
    return {
      available: false,
      platform,
      authorizedTypes: [],
      message: platform === 'ios'
        ? 'HealthKit requires a native build. Run `npx expo prebuild` then `npx expo run:ios`.'
        : platform === 'android'
          ? 'Health Connect is not available on this device. Install Health Connect app from Play Store and ensure native build is used.'
          : 'Health data is not available on web.',
    };
  }

  const hasPerms = await (await getHealthModule()).hasPermissions();

  return {
    available: true,
    platform,
    authorizedTypes: hasPerms ? ['steps', 'calories', 'distance', 'heart_rate', 'sleep', 'weight', 'water'] : [],
  };
}

export async function requestHealthPermissions(
  permissions: HealthPermissions = {
    read: ['steps', 'calories', 'distance', 'heart_rate', 'sleep', 'weight', 'water'],
    write: ['workout', 'calories', 'water'],
  }
): Promise<boolean> {
  const module = await getHealthModule();
  const available = await module.isAvailable();

  if (!available) {
    console.warn('Health data not available. Native setup required.');
    return false;
  }

  return module.requestPermissions(permissions);
}

export async function readHealthData(
  type: HealthDataType,
  startDate: Date,
  endDate: Date = new Date()
): Promise<HealthDataPoint[]> {
  const module = await getHealthModule();
  const available = await module.isAvailable();

  if (!available) {
    console.warn('Health data not available. Cannot read.');
    return [];
  }

  return module.readData(type, startDate, endDate);
}

export async function writeHealthData(data: HealthDataPoint): Promise<boolean> {
  const module = await getHealthModule();
  const available = await module.isAvailable();

  if (!available) {
    console.warn('Health data not available. Cannot write.');
    return false;
  }

  return module.writeData(data);
}
