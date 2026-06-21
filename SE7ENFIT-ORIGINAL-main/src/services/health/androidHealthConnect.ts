// Android Health Connect Service - SE7EN FIT
// Real native bridge wrapper for react-native-health-connect.
// Works in a prebuilt/native app when the optional native package is installed.
// In Expo Go or if the native package is absent, it returns a safe unavailable state.

import { Platform } from 'react-native';
import type { HealthDataPoint, HealthDataType, HealthPermissions } from './healthTypes';

type HealthConnectAvailability = 'installed' | 'notInstalled' | 'notSupported';
type HealthConnectModule = typeof import('react-native-health-connect');

const RECORD_TYPES: Partial<Record<HealthDataType, string>> = {
  steps: 'Steps',
  calories: 'ActiveCaloriesBurned',
  active_energy: 'ActiveCaloriesBurned',
  distance: 'Distance',
  heart_rate: 'HeartRate',
  sleep: 'SleepSession',
  weight: 'Weight',
  height: 'Height',
  water: 'Hydration',
  workout: 'ExerciseSession',
};

const toISO = (date: Date) => date.toISOString();

async function loadHealthConnect(): Promise<HealthConnectModule | null> {
  if (Platform.OS !== 'android') return null;
  try {
    return await import('react-native-health-connect');
  } catch {
    return null;
  }
}

function getNumericValue(record: any, type: HealthDataType): number {
  if (!record) return 0;
  if (type === 'steps') return Number(record.count ?? record.value ?? 0);
  if (type === 'calories' || type === 'active_energy') {
    return Number(record.energy?.inKilocalories ?? record.energy?.kilocalories ?? record.value ?? 0);
  }
  if (type === 'distance') return Number(record.distance?.inMeters ?? record.distance?.meters ?? record.value ?? 0);
  if (type === 'heart_rate') {
    const samples = Array.isArray(record.samples) ? record.samples : [];
    if (!samples.length) return Number(record.beatsPerMinute ?? record.value ?? 0);
    const total = samples.reduce((sum: number, s: any) => sum + Number(s.beatsPerMinute ?? 0), 0);
    return Math.round(total / samples.length);
  }
  if (type === 'sleep' || type === 'workout') {
    const start = new Date(record.startTime ?? record.startDate ?? Date.now()).getTime();
    const end = new Date(record.endTime ?? record.endDate ?? Date.now()).getTime();
    return Math.max(0, Math.round((end - start) / 60000));
  }
  if (type === 'weight') return Number(record.weight?.inKilograms ?? record.weight?.kilograms ?? record.value ?? 0);
  if (type === 'height') return Number(record.height?.inMeters ? record.height.inMeters * 100 : record.height?.centimeters ?? record.value ?? 0);
  if (type === 'water') return Number(record.volume?.inLiters ?? record.volume?.liters ?? record.value ?? 0);
  return Number(record.value ?? 0);
}

function toPoint(record: any, type: HealthDataType): HealthDataPoint {
  return {
    type,
    value: getNumericValue(record, type),
    unit: type === 'steps' ? 'count' : type === 'heart_rate' ? 'bpm' : type === 'weight' ? 'kg' : type === 'height' ? 'cm' : type === 'water' ? 'L' : type === 'distance' ? 'm' : type === 'sleep' || type === 'workout' ? 'min' : 'kcal',
    date: record.startTime ?? record.time ?? record.startDate ?? new Date().toISOString(),
    source: 'health_connect',
    metadata: record,
  };
}

function permissionEntries(permissions: HealthPermissions) {
  const entries: Array<{ accessType: 'read' | 'write'; recordType: string }> = [];
  permissions.read.forEach((type) => {
    const recordType = RECORD_TYPES[type];
    if (recordType) entries.push({ accessType: 'read', recordType });
  });
  permissions.write.forEach((type) => {
    const recordType = RECORD_TYPES[type];
    if (recordType) entries.push({ accessType: 'write', recordType });
  });
  return entries;
}

export async function checkHealthConnectAvailability(): Promise<HealthConnectAvailability> {
  if (Platform.OS !== 'android') return 'notSupported';
  const HealthConnect = await loadHealthConnect();
  if (!HealthConnect) return 'notInstalled';

  try {
    await HealthConnect.initialize();
    const status = await HealthConnect.getSdkStatus().catch(() => null);
    const unavailable = (HealthConnect.SdkAvailabilityStatus as any)?.SDK_UNAVAILABLE;
    return status === unavailable ? 'notInstalled' : 'installed';
  } catch {
    return 'notInstalled';
  }
}

export async function isHealthConnectAvailable(): Promise<boolean> {
  return (await checkHealthConnectAvailability()) === 'installed';
}

export const healthConnectService = {
  isAvailable: isHealthConnectAvailable,

  requestPermissions: async (permissions: HealthPermissions): Promise<boolean> => {
    const HealthConnect = await loadHealthConnect();
    if (!HealthConnect) return false;

    try {
      await HealthConnect.initialize();
      const granted = await HealthConnect.requestPermission(permissionEntries(permissions));
      return Array.isArray(granted) && granted.length > 0;
    } catch {
      return false;
    }
  },

  hasPermissions: async (): Promise<boolean> => {
    const HealthConnect = await loadHealthConnect();
    if (!HealthConnect) return false;

    try {
      await HealthConnect.initialize();
      const granted = await HealthConnect.getGrantedPermissions();
      return Array.isArray(granted) && granted.length > 0;
    } catch {
      return false;
    }
  },

  readData: async (type: HealthDataType, startDate: Date, endDate: Date): Promise<HealthDataPoint[]> => {
    const HealthConnect = await loadHealthConnect();
    const recordType = RECORD_TYPES[type];
    if (!HealthConnect || !recordType) return [];

    try {
      await HealthConnect.initialize();
      const result = await HealthConnect.readRecords(recordType, {
        timeRangeFilter: {
          operator: 'between',
          startTime: toISO(startDate),
          endTime: toISO(endDate),
        },
      });
      const records = Array.isArray(result) ? result : (result as any)?.records ?? [];
      return records.map((record: unknown) => toPoint(record, type));
    } catch {
      return [];
    }
  },

  writeData: async (data: HealthDataPoint): Promise<boolean> => {
    const HealthConnect = await loadHealthConnect();
    const recordType = RECORD_TYPES[data.type];
    if (!HealthConnect || !recordType) return false;

    try {
      await HealthConnect.initialize();
      const startTime = data.date;
      const endTime = new Date(new Date(data.date).getTime() + 60_000).toISOString();
      const record: Record<string, unknown> = { recordType, startTime, endTime, metadata: data.metadata ?? {} };

      if (data.type === 'steps') record.count = Math.round(data.value);
      else if (data.type === 'distance') record.distance = { meters: data.value };
      else if (data.type === 'calories' || data.type === 'active_energy') record.energy = { kilocalories: data.value };
      else if (data.type === 'weight') record.weight = { kilograms: data.value };
      else if (data.type === 'height') record.height = { meters: data.value / 100 };
      else if (data.type === 'water') record.volume = { liters: data.value };
      else if (data.type === 'heart_rate') record.samples = [{ time: data.date, beatsPerMinute: Math.round(data.value) }];
      else if (data.type === 'workout') record.exerciseType = 'EXERCISE_TYPE_STRENGTH_TRAINING';

      await HealthConnect.insertRecords([record]);
      return true;
    } catch {
      return false;
    }
  },
};

export function getHealthConnectMessage(): string {
  return 'Health Connect requires a native Android build with react-native-health-connect installed. It does not work inside Expo Go.';
}
