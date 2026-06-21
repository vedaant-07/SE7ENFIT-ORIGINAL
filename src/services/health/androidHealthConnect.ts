// Android Health Connect Service - SE7EN FIT
// Health Connect is Google's health data platform for Android.
// Requires: native build, Health Connect app installed, and proper permissions.

import { Platform } from 'react-native';
import type { HealthSyncStatus, HealthDataPoint, HealthDataType, HealthPermissions } from './healthTypes';

// Health Connect availability states
type HealthConnectAvailability = 'installed' | 'notInstalled' | 'notSupported';

// NOTE: This is a placeholder structure. To actually use Health Connect:
// 1. Install react-native-health-connect: npm install react-native-health-connect
// 2. Run npx expo prebuild to generate native android folder
// 3. Configure AndroidManifest.xml with Health Connect permissions
// 4. Request permissions and use the SDK

export async function checkHealthConnectAvailability(): Promise<HealthConnectAvailability> {
  if (Platform.OS !== 'android') {
    return 'notSupported';
  }

  // TODO: After native setup, use react-native-health-connect to check:
  // import { HealthConnect } from 'react-native-health-connect';
  // const availability = await HealthConnect.isAvailable();
  // return availability ? 'installed' : 'notInstalled';

  // Placeholder: assumes not installed until native setup
  return 'notInstalled';
}

export async function isHealthConnectAvailable(): Promise<boolean> {
  const availability = await checkHealthConnectAvailability();
  return availability === 'installed';
}

export const healthConnectService = {
  isAvailable: async (): Promise<boolean> => {
    return isHealthConnectAvailable();
  },

  requestPermissions: async (_permissions: HealthPermissions): Promise<boolean> => {
    // TODO: Implement after native setup
    // import { HealthConnect } from 'react-native-health-connect';
    // await HealthConnect.requestPermissions([
    //   { accessType: 'read', dataType: 'Steps' },
    //   { accessType: 'read', dataType: 'ActiveCaloriesBurned' },
    // ]);
    console.warn('Health Connect: requestPermissions called but native module not configured.');
    return false;
  },

  hasPermissions: async (): Promise<boolean> => {
    // TODO: Implement after native setup
    console.warn('Health Connect: hasPermissions called but native module not configured.');
    return false;
  },

  readData: async (_type: HealthDataType, _startDate: Date, _endDate: Date): Promise<HealthDataPoint[]> => {
    // TODO: Implement after native setup
    console.warn('Health Connect: readData called but native module not configured.');
    return [];
  },

  writeData: async (_data: HealthDataPoint): Promise<boolean> => {
    // TODO: Implement after native setup
    console.warn('Health Connect: writeData called but native module not configured.');
    return false;
  },
};

export function getHealthConnectMessage(): string {
  return 'Health Connect is not available on this device. Install the Health Connect app from Play Store and ensure you are using a native build (not Expo Go).';
}
