// Live Tracking Service - SE7EN FIT
// Production-safe session tracking for workouts, gym activity, and health sync.
// This service intentionally does not change UI. Screens can opt in later.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './apiClient';
import { trackingService } from './userServices';
import { writeHealthData } from '@/src/services/health/healthService';

export type LiveTrackingType = 'workout' | 'cardio' | 'gym_attendance' | 'diet' | 'custom';
export type LiveTrackingStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export type LiveTrackingSet = {
  exerciseId?: string;
  exerciseName: string;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  durationSec?: number;
  restSec?: number;
  completedAt: string;
};

export type LiveTrackingSession = {
  id: string;
  serverId?: string;
  type: LiveTrackingType;
  status: LiveTrackingStatus;
  title: string;
  startedAt: string;
  pausedAt?: string;
  endedAt?: string;
  elapsedMs: number;
  caloriesEstimate?: number;
  distanceMeters?: number;
  steps?: number;
  sets: LiveTrackingSet[];
  metadata?: Record<string, unknown>;
  lastSyncedAt?: string;
};

const ACTIVE_SESSION_KEY = 'se7enfit_live_tracking_active_session';
const QUEUE_KEY = 'se7enfit_live_tracking_sync_queue';

const now = () => new Date().toISOString();
const makeLocalId = () => `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const value = await AsyncStorage.getItem(key);
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

function currentElapsed(session: LiveTrackingSession): number {
  if (session.status !== 'active') return session.elapsedMs;
  return session.elapsedMs + (Date.now() - new Date(session.startedAt).getTime());
}

async function queueSession(session: LiveTrackingSession) {
  const queue = await readJson<LiveTrackingSession[]>(QUEUE_KEY, []);
  await writeJson(QUEUE_KEY, [...queue.filter((s) => s.id !== session.id), session]);
}

async function syncSession(session: LiveTrackingSession): Promise<LiveTrackingSession> {
  if (session.serverId) {
    const updated = await api.patch<LiveTrackingSession>(`/tracking/live-sessions/${session.serverId}`, session);
    return { ...session, ...updated, lastSyncedAt: now() };
  }
  const created = await api.post<LiveTrackingSession>('/tracking/live-sessions', session);
  return { ...session, ...created, serverId: created.serverId ?? created.id, lastSyncedAt: now() };
}

export const liveTrackingService = {
  async getActiveSession(): Promise<LiveTrackingSession | null> {
    return readJson<LiveTrackingSession | null>(ACTIVE_SESSION_KEY, null);
  },

  async startSession(input: { type: LiveTrackingType; title: string; metadata?: Record<string, unknown> }): Promise<LiveTrackingSession> {
    const session: LiveTrackingSession = {
      id: makeLocalId(),
      type: input.type,
      status: 'active',
      title: input.title,
      startedAt: now(),
      elapsedMs: 0,
      sets: [],
      metadata: input.metadata,
    };
    await writeJson(ACTIVE_SESSION_KEY, session);
    try {
      const synced = await syncSession(session);
      await writeJson(ACTIVE_SESSION_KEY, synced);
      return synced;
    } catch {
      await queueSession(session);
      return session;
    }
  },

  async pauseSession(): Promise<LiveTrackingSession | null> {
    const session = await liveTrackingService.getActiveSession();
    if (!session || session.status !== 'active') return session;
    const paused: LiveTrackingSession = {
      ...session,
      status: 'paused',
      pausedAt: now(),
      elapsedMs: currentElapsed(session),
    };
    await writeJson(ACTIVE_SESSION_KEY, paused);
    await queueSession(paused);
    return paused;
  },

  async resumeSession(): Promise<LiveTrackingSession | null> {
    const session = await liveTrackingService.getActiveSession();
    if (!session || session.status !== 'paused') return session;
    const resumed: LiveTrackingSession = {
      ...session,
      status: 'active',
      startedAt: now(),
      pausedAt: undefined,
    };
    await writeJson(ACTIVE_SESSION_KEY, resumed);
    await queueSession(resumed);
    return resumed;
  },

  async addSet(set: Omit<LiveTrackingSet, 'setNumber' | 'completedAt'> & { setNumber?: number }): Promise<LiveTrackingSession | null> {
    const session = await liveTrackingService.getActiveSession();
    if (!session) return null;
    const nextSet: LiveTrackingSet = {
      ...set,
      setNumber: set.setNumber ?? session.sets.length + 1,
      completedAt: now(),
    };
    const updated = { ...session, sets: [...session.sets, nextSet], elapsedMs: currentElapsed(session) };
    await writeJson(ACTIVE_SESSION_KEY, updated);
    await queueSession(updated);
    return updated;
  },

  async endSession(summary?: Partial<Pick<LiveTrackingSession, 'caloriesEstimate' | 'distanceMeters' | 'steps' | 'metadata'>>): Promise<LiveTrackingSession | null> {
    const session = await liveTrackingService.getActiveSession();
    if (!session) return null;

    const ended: LiveTrackingSession = {
      ...session,
      ...summary,
      status: 'completed',
      endedAt: now(),
      elapsedMs: currentElapsed(session),
      metadata: { ...(session.metadata ?? {}), ...(summary?.metadata ?? {}) },
    };

    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    await queueSession(ended);

    await trackingService.add({
      type: ended.type === 'workout' ? 'workout' : ended.type,
      value: Math.round(ended.elapsedMs / 60000),
      unit: 'min',
      date: ended.endedAt?.slice(0, 10) ?? now().slice(0, 10),
      metadata: ended,
    }).catch(() => undefined);

    if (ended.type === 'workout') {
      await writeHealthData({
        type: 'workout',
        value: Math.round(ended.elapsedMs / 60000),
        unit: 'min',
        date: ended.startedAt,
        source: 'se7enfit',
        metadata: { calories: ended.caloriesEstimate ?? 0, sessionId: ended.id },
      }).catch(() => false);
    }

    await liveTrackingService.flushSyncQueue();
    return ended;
  },

  async cancelSession(): Promise<void> {
    const session = await liveTrackingService.getActiveSession();
    if (session) await queueSession({ ...session, status: 'cancelled', endedAt: now(), elapsedMs: currentElapsed(session) });
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
  },

  async flushSyncQueue(): Promise<{ synced: number; failed: number }> {
    const queue = await readJson<LiveTrackingSession[]>(QUEUE_KEY, []);
    if (!queue.length) return { synced: 0, failed: 0 };
    const failed: LiveTrackingSession[] = [];
    let synced = 0;

    for (const session of queue) {
      try {
        await syncSession(session);
        synced += 1;
      } catch {
        failed.push(session);
      }
    }

    await writeJson(QUEUE_KEY, failed);
    return { synced, failed: failed.length };
  },
};
