// Health API - SE7EN FIT
// Health data sync status and management.
// Actual health data reading happens in native modules (HealthKit/Health Connect).

import { api } from './client';

export type HealthSyncStatus = {
  last_sync?: string;
  connected: boolean;
  platform: 'ios' | 'android' | 'web';
  data_types_enabled: string[];
};

export async function getHealthSyncStatus(): Promise<HealthSyncStatus> {
  // TODO: Backend integration for sync metadata
  return api.get<HealthSyncStatus>('/health/sync-status');
}

export async function syncHealthData(): Promise<{ synced: boolean; timestamp: string }> {
  // TODO: Trigger sync with backend
  return api.post<{ synced: boolean; timestamp: string }>('/health/sync', {});
}
