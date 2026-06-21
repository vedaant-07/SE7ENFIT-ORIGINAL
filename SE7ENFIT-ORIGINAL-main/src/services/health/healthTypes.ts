// Health Types - SE7EN FIT
// Shared types for HealthKit (iOS) and Health Connect (Android).

export type HealthDataType =
  | 'steps'
  | 'calories'
  | 'distance'
  | 'heart_rate'
  | 'sleep'
  | 'weight'
  | 'height'
  | 'water'
  | 'workout'
  | 'active_energy';

export type HealthDataPoint = {
  type: HealthDataType;
  value: number;
  unit: string;
  date: string;
  source?: string;
  metadata?: Record<string, unknown>;
};

export type HealthSyncStatus = {
  available: boolean;
  platform: 'ios' | 'android' | 'web';
  lastSync?: string;
  authorizedTypes: HealthDataType[];
  message?: string;
};

export type HealthPermissions = {
  read: HealthDataType[];
  write: HealthDataType[];
};

export const HEALTH_UNITS: Record<HealthDataType, string> = {
  steps: 'count',
  calories: 'kcal',
  distance: 'm',
  heart_rate: 'bpm',
  sleep: 'h',
  weight: 'kg',
  height: 'cm',
  water: 'L',
  workout: 'min',
  active_energy: 'kcal',
};
