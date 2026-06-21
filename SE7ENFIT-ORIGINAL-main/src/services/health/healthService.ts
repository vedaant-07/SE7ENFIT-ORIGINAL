// Health Service - SE7EN FIT
// Cross-platform health data service.
// iOS: HealthKit via react-native-health in native builds.
// Android: Health Connect via react-native-health-connect in native builds.

import { Platform } from 'react-native';
import { trackingService } from '@/services/userServices';
import { healthConnectService } from './androidHealthConnect';
import { healthKitService } from './iosHealthKit';
import type { HealthDataPoint, HealthDataType, HealthPermissions, HealthSyncStatus } from './healthTypes';

const DEFAULT_PERMISSIONS: HealthPermissions = {
  read: ['steps', 'calories', 'active_energy', 'distance', 'heart_rate', 'sleep', 'weight', 'height', 'water'],
  write: ['workout', 'calories', 'active_energy', 'water', 'weight'],
};

function getHealthModule() {
  if (Platform.OS === 'ios') return healthKitService;
  if (Platform.OS === 'android') return healthConnectService;
  return null;
}

export async function isHealthAvailable(): Promise<boolean> {
  const module = getHealthModule();
  return module ? module.isAvailable() : false;
}

export async function getHealthSyncStatus(): Promise<HealthSyncStatus> {
  const platform = Platform.OS as 'ios' | 'android' | 'web';
  const module = getHealthModule();
  if (!module) {
    return { available: false, platform, authorizedTypes: [], message: 'Health data is not available on web.' };
  }

  const available = await module.isAvailable();
  if (!available) {
    return {
      available: false,
      platform,
      authorizedTypes: [],
      message: platform === 'ios'
        ? 'HealthKit is available only in a native iOS build with HealthKit entitlement enabled.'
        : 'Health Connect is available only in a native Android build with the Health Connect provider installed.',
    };
  }

  const hasPerms = await module.hasPermissions();
  return {
    available: true,
    platform,
    authorizedTypes: hasPerms ? DEFAULT_PERMISSIONS.read : [],
    message: hasPerms ? undefined : 'Health permission is not granted yet.',
  };
}

export async function requestHealthPermissions(permissions: HealthPermissions = DEFAULT_PERMISSIONS): Promise<boolean> {
  const module = getHealthModule();
  if (!module || !(await module.isAvailable())) return false;
  return module.requestPermissions(permissions);
}

export async function readHealthData(type: HealthDataType, startDate: Date, endDate: Date = new Date()): Promise<HealthDataPoint[]> {
  const module = getHealthModule();
  if (!module || !(await module.isAvailable())) return [];
  return module.readData(type, startDate, endDate);
}

export async function writeHealthData(data: HealthDataPoint): Promise<boolean> {
  const module = getHealthModule();
  if (!module || !(await module.isAvailable())) return false;
  return module.writeData(data);
}

export async function syncTodayHealthToBackend(types: HealthDataType[] = ['steps', 'calories', 'active_energy', 'distance', 'weight', 'water']): Promise<{ synced: number; failed: number }> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  const entries: Array<{ type: string; value: number; unit?: string; date: string; metadata?: Record<string, unknown> }> = [];

  for (const type of types) {
    const points = await readHealthData(type, start, end);
    for (const point of points) {
      if (!Number.isFinite(point.value) || point.value <= 0) continue;
      entries.push({
        type: point.type,
        value: point.value,
        unit: point.unit,
        date: point.date.slice(0, 10),
        metadata: { source: point.source, raw: point.metadata },
      });
    }
  }

  if (!entries.length) return { synced: 0, failed: 0 };
  try {
    await trackingService.bulkAdd(entries);
    return { synced: entries.length, failed: 0 };
  } catch {
    return { synced: 0, failed: entries.length };
  }
}
