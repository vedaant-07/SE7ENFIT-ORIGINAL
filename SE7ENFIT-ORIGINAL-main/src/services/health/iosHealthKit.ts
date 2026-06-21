// iOS HealthKit Service - SE7EN FIT
// Real native bridge wrapper for react-native-health.
// Works in a prebuilt/native iOS app with HealthKit capability enabled.
// In Expo Go or if the native package is absent, it returns a safe unavailable state.

import { Platform } from 'react-native';
import type { HealthDataPoint, HealthDataType, HealthPermissions } from './healthTypes';

type AppleHealthKitModule = any;

async function loadAppleHealthKit(): Promise<AppleHealthKitModule | null> {
  if (Platform.OS !== 'ios') return null;
  try {
    const mod = await import('react-native-health');
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

function healthKitPermission(AppleHealthKit: AppleHealthKitModule, type: HealthDataType): string | undefined {
  const P = AppleHealthKit?.Constants?.Permissions ?? {};
  const map: Partial<Record<HealthDataType, string>> = {
    steps: P.Steps,
    calories: P.ActiveEnergyBurned,
    active_energy: P.ActiveEnergyBurned,
    distance: P.DistanceWalkingRunning,
    heart_rate: P.HeartRate,
    sleep: P.SleepAnalysis,
    weight: P.Weight,
    height: P.Height,
    water: P.Water,
    workout: P.Workout,
  };
  return map[type];
}

function callbackPromise<T>(fn: (cb: (err: unknown, result: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export async function isHealthKitAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  const AppleHealthKit = await loadAppleHealthKit();
  if (!AppleHealthKit?.isAvailable) return false;

  try {
    return await callbackPromise<boolean>((cb) => AppleHealthKit.isAvailable(cb));
  } catch {
    return false;
  }
}

export const healthKitService = {
  isAvailable: isHealthKitAvailable,

  requestPermissions: async (permissions: HealthPermissions): Promise<boolean> => {
    const AppleHealthKit = await loadAppleHealthKit();
    if (!AppleHealthKit) return false;

    try {
      const read = permissions.read.map((type) => healthKitPermission(AppleHealthKit, type)).filter(Boolean);
      const write = permissions.write.map((type) => healthKitPermission(AppleHealthKit, type)).filter(Boolean);
      await callbackPromise<void>((cb) => AppleHealthKit.initHealthKit({ permissions: { read, write } }, cb));
      return true;
    } catch {
      return false;
    }
  },

  hasPermissions: async (): Promise<boolean> => {
    return isHealthKitAvailable();
  },

  readData: async (type: HealthDataType, startDate: Date, endDate: Date): Promise<HealthDataPoint[]> => {
    const AppleHealthKit = await loadAppleHealthKit();
    if (!AppleHealthKit) return [];

    const options = { startDate: startDate.toISOString(), endDate: endDate.toISOString() };

    try {
      if (type === 'steps') {
        const result = await callbackPromise<any>((cb) => AppleHealthKit.getStepCount(options, cb));
        return [{ type, value: Number(result?.value ?? 0), unit: 'count', date: endDate.toISOString(), source: 'healthkit', metadata: result }];
      }
      if (type === 'calories' || type === 'active_energy') {
        const result = await callbackPromise<any>((cb) => AppleHealthKit.getActiveEnergyBurned(options, cb));
        return [{ type, value: Number(result?.value ?? 0), unit: 'kcal', date: endDate.toISOString(), source: 'healthkit', metadata: result }];
      }
      if (type === 'distance') {
        const result = await callbackPromise<any>((cb) => AppleHealthKit.getDistanceWalkingRunning(options, cb));
        return [{ type, value: Number(result?.value ?? 0), unit: 'm', date: endDate.toISOString(), source: 'healthkit', metadata: result }];
      }
      if (type === 'heart_rate') {
        const samples = await callbackPromise<any[]>((cb) => AppleHealthKit.getHeartRateSamples(options, cb));
        return (samples ?? []).map((sample) => ({ type, value: Number(sample.value ?? 0), unit: 'bpm', date: sample.startDate ?? sample.endDate ?? endDate.toISOString(), source: 'healthkit', metadata: sample }));
      }
      if (type === 'sleep') {
        const samples = await callbackPromise<any[]>((cb) => AppleHealthKit.getSleepSamples(options, cb));
        return (samples ?? []).map((sample) => {
          const start = new Date(sample.startDate).getTime();
          const end = new Date(sample.endDate).getTime();
          return { type, value: Math.max(0, Math.round((end - start) / 60000)), unit: 'min', date: sample.startDate, source: 'healthkit', metadata: sample };
        });
      }
      if (type === 'weight') {
        const result = await callbackPromise<any>((cb) => AppleHealthKit.getLatestWeight({}, cb));
        return [{ type, value: Number(result?.value ?? 0), unit: 'kg', date: result?.startDate ?? endDate.toISOString(), source: 'healthkit', metadata: result }];
      }
      if (type === 'height') {
        const result = await callbackPromise<any>((cb) => AppleHealthKit.getLatestHeight({}, cb));
        return [{ type, value: Number(result?.value ?? 0), unit: 'cm', date: result?.startDate ?? endDate.toISOString(), source: 'healthkit', metadata: result }];
      }
      if (type === 'water') {
        const samples = await callbackPromise<any[]>((cb) => AppleHealthKit.getWater(options, cb));
        return (samples ?? []).map((sample) => ({ type, value: Number(sample.value ?? 0), unit: 'L', date: sample.startDate ?? endDate.toISOString(), source: 'healthkit', metadata: sample }));
      }
      return [];
    } catch {
      return [];
    }
  },

  writeData: async (data: HealthDataPoint): Promise<boolean> => {
    const AppleHealthKit = await loadAppleHealthKit();
    if (!AppleHealthKit) return false;

    try {
      const date = data.date;
      if ((data.type === 'calories' || data.type === 'active_energy') && AppleHealthKit.saveActiveEnergyBurned) {
        await callbackPromise<void>((cb) => AppleHealthKit.saveActiveEnergyBurned({ value: data.value, startDate: date, endDate: date }, cb));
        return true;
      }
      if (data.type === 'weight' && AppleHealthKit.saveWeight) {
        await callbackPromise<void>((cb) => AppleHealthKit.saveWeight({ value: data.value, startDate: date }, cb));
        return true;
      }
      if (data.type === 'water' && AppleHealthKit.saveWater) {
        await callbackPromise<void>((cb) => AppleHealthKit.saveWater({ value: data.value, startDate: date, endDate: date }, cb));
        return true;
      }
      if (data.type === 'workout' && AppleHealthKit.saveWorkout) {
        await callbackPromise<void>((cb) => AppleHealthKit.saveWorkout({ type: 'TraditionalStrengthTraining', startDate: date, endDate: new Date(new Date(date).getTime() + data.value * 60000).toISOString(), calories: data.metadata?.calories ?? 0 }, cb));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};

export function getHealthKitMessage(): string {
  return 'HealthKit requires a native iOS build with react-native-health installed and HealthKit entitlement enabled. It does not work inside Expo Go.';
}
