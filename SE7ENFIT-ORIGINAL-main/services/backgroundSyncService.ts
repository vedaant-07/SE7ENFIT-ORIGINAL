// Background Sync Service - SE7EN FIT
// Registers lightweight background sync for queued live sessions and health data.
// Native modules are optional; if unavailable, functions return safe false/no-op.

import { liveTrackingService } from './liveTrackingService';
import { syncTodayHealthToBackend } from '@/src/services/health/healthService';

export const SE7ENFIT_BACKGROUND_SYNC_TASK = 'SE7ENFIT_BACKGROUND_SYNC_TASK';

async function loadTaskManager() {
  try { return await import('expo-task-manager'); } catch { return null; }
}

async function loadBackgroundFetch() {
  try { return await import('expo-background-fetch'); } catch { return null; }
}

export async function runBackgroundSyncOnce(): Promise<{ liveSynced: number; healthSynced: number; failed: number }> {
  const live = await liveTrackingService.flushSyncQueue();
  const health = await syncTodayHealthToBackend().catch(() => ({ synced: 0, failed: 1 }));
  return { liveSynced: live.synced, healthSynced: health.synced, failed: live.failed + health.failed };
}

export async function defineBackgroundSyncTask(): Promise<boolean> {
  const TaskManager = await loadTaskManager();
  const BackgroundFetch = await loadBackgroundFetch();
  if (!TaskManager || !BackgroundFetch) return false;
  if (TaskManager.isTaskDefined(SE7ENFIT_BACKGROUND_SYNC_TASK)) return true;

  TaskManager.defineTask(SE7ENFIT_BACKGROUND_SYNC_TASK, async () => {
    try {
      const result = await runBackgroundSyncOnce();
      return result.failed > 0
        ? BackgroundFetch.BackgroundFetchResult?.Failed
        : result.liveSynced || result.healthSynced
          ? BackgroundFetch.BackgroundFetchResult?.NewData
          : BackgroundFetch.BackgroundFetchResult?.NoData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult?.Failed;
    }
  });
  return true;
}

export async function registerBackgroundSync(): Promise<boolean> {
  const TaskManager = await loadTaskManager();
  const BackgroundFetch = await loadBackgroundFetch();
  if (!TaskManager || !BackgroundFetch) return false;

  await defineBackgroundSyncTask();

  const status = await BackgroundFetch.getStatusAsync().catch(() => null);
  const denied = BackgroundFetch.BackgroundFetchStatus?.Denied;
  if (status === denied) return false;

  const alreadyRegistered = await TaskManager.isTaskRegisteredAsync(SE7ENFIT_BACKGROUND_SYNC_TASK).catch(() => false);
  if (!alreadyRegistered) {
    await BackgroundFetch.registerTaskAsync(SE7ENFIT_BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
  return true;
}

export async function unregisterBackgroundSync(): Promise<void> {
  const TaskManager = await loadTaskManager();
  const BackgroundFetch = await loadBackgroundFetch();
  if (!TaskManager || !BackgroundFetch) return;
  const registered = await TaskManager.isTaskRegisteredAsync(SE7ENFIT_BACKGROUND_SYNC_TASK).catch(() => false);
  if (registered) await BackgroundFetch.unregisterTaskAsync(SE7ENFIT_BACKGROUND_SYNC_TASK).catch(() => undefined);
}
