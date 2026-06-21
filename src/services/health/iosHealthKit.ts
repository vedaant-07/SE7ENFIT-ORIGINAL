// iOS HealthKit Service - SE7EN FIT
// HealthKit is Apple's health data platform.
// Requires: native build, HealthKit capability in Xcode, and Info.plist permissions.

import { Platform } from 'react-native';
import type { HealthSyncStatus, HealthDataPoint, HealthDataType, HealthPermissions } from './healthTypes';

// NOTE: This is a placeholder structure. To actually use HealthKit:
// 1. Install react-native-health or expo-health-kit: npm install react-native-health
// 2. Run npx expo prebuild to generate native ios folder
// 3. Add HealthKit capability in Xcode
// 4. Add NSHealthShareUsageDescription and NSHealthUpdateUsageDescription to Info.plist
// 5. Request permissions and use the SDK

export async function isHealthKitAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  // TODO: After native setup, use react-native-health to check:
  // import AppleHealthKit from 'react-native-health';
  // return new Promise((resolve) => {
  //   AppleHealthKit.isAvailable((err, available) => {
  //     resolve(available === true);
  //   });
  // });

  // Placeholder: not available until native setup
  return false;
}

export const healthKitService = {
  isAvailable: async (): Promise<boolean> => {
    return isHealthKitAvailable();
  },

  requestPermissions: async (_permissions: HealthPermissions): Promise<boolean> => {
    // TODO: Implement after native setup
    // import AppleHealthKit from 'react-native-health';
    // const options = {
    //   permissions: {
    //     read: ['Steps', 'DistanceWalkingRunning', 'ActiveEnergyBurned', ...],
    //     write: ['Workout', ...],
    //   },
    // };
    // AppleHealthKit.init(options, (err) => { ... });
    console.warn('HealthKit: requestPermissions called but native module not configured.');
    return false;
  },

  hasPermissions: async (): Promise<boolean> => {
    // TODO: Implement after native setup
    console.warn('HealthKit: hasPermissions called but native module not configured.');
    return false;
  },

  readData: async (_type: HealthDataType, _startDate: Date, _endDate: Date): Promise<HealthDataPoint[]> => {
    // TODO: Implement after native setup
    // import AppleHealthKit from 'react-native-health';
    // AppleHealthKit.getStepCount({ startDate, endDate }, (err, results) => { ... });
    console.warn('HealthKit: readData called but native module not configured.');
    return [];
  },

  writeData: async (_data: HealthDataPoint): Promise<boolean> => {
    // TODO: Implement after native setup
    console.warn('HealthKit: writeData called but native module not configured.');
    return false;
  },
};

export function getHealthKitMessage(): string {
  return 'HealthKit requires a native iOS build. Run `npx expo prebuild` then open the project in Xcode to enable HealthKit capability.';
}
