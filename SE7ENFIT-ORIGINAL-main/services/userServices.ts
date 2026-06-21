// User-facing services — user profile, onboarding, workouts, nutrition,
// tracking, challenges, rewards, notifications, support.
//
// Every function maps to one route on your Render backend. Wherever the
// exact endpoint shape is unknown, a reasonable REST convention is used.
// Update the paths here when you confirm the real routes — nothing else
// in the app needs to change.

import { api } from './apiClient';

// ---------- User profile / onboarding ----------

export type UserProfile = {
  id: string;
  user_id: string;
  name?: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  goal?: string;
  activity_level?: string;
  dietary_preference?: string;
  gym_owner_id?: string | null;
  onboarding_complete?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export const userService = {
  getProfile: () => api.get<UserProfile>('/users/me/profile'),
  upsertProfile: (profile: Partial<UserProfile>) => api.put<UserProfile>('/users/me/profile', profile),
  completeOnboarding: (data: Partial<UserProfile>) =>
    api.post<UserProfile>('/users/me/onboarding', data),

  // Gym referral code validation (used at signup time).
  validateGymCode: (code: string) =>
    api.get<{ valid: boolean; gym?: unknown }>('/gym-owners/validate-code', { code }),
};

// ---------- Subscription ----------

export type Subscription = {
  id: string;
  user_id: string;
  plan: string;
  status: 'active' | 'expired' | 'cancelled' | 'trialing';
  started_at?: string;
  expires_at?: string;
  [key: string]: unknown;
};

export const subscriptionService = {
  getByUser: () => api.get<Subscription[]>('/subscriptions', { status: 'active' }),
  create: (plan: string) => api.post<Subscription>('/subscriptions', { plan }),
  cancel: () => api.post<Subscription>('/subscriptions/cancel', {}),
};

// ---------- Workouts ----------

export type WorkoutPlan = {
  id: string;
  user_id?: string;
  title: string;
  type?: string;
  duration_min?: number;
  difficulty?: string;
  exercises?: WorkoutExercise[];
  created_at?: string;
  [key: string]: unknown;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  duration_sec?: number;
  rest_sec?: number;
  notes?: string;
};

export type WorkoutLog = {
  id: string;
  user_id: string;
  workout_id?: string;
  date: string;
  exercises?: unknown[];
  duration_min?: number;
  calories_burned?: number;
  completed: boolean;
  [key: string]: unknown;
};

export const workoutService = {
  listLogs: () => api.get<WorkoutLog[]>('/workouts/logs'),
  logWorkout: (log: Partial<WorkoutLog>) => api.post<WorkoutLog>('/workouts/logs', log),
  // AI-generated plan
  generate: (params: Record<string, unknown>) =>
    api.post<WorkoutPlan>('/workouts/generate', params),
};

// ---------- Exercise library ----------

export type Exercise = {
  id: string;
  name: string;
  muscle_group?: string;
  equipment?: string;
  difficulty?: string;
  instructions?: string;
  image_url?: string;
};

export const exerciseService = {
  list: (query?: { muscle_group?: string; equipment?: string }) =>
    api.get<Exercise[]>('/exercises', query),
  get: (id: string) => api.get<Exercise>(`/exercises/${id}`),
};

// ---------- Nutrition ----------

export type NutritionLog = {
  id: string;
  user_id: string;
  date: string;
  meal: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g?: number;
  fat_g?: number;
  [key: string]: unknown;
};

export const nutritionService = {
  listLogs: (date?: string) => api.get<NutritionLog[]>('/nutrition/logs', { date }),
  addLog: (log: Partial<NutritionLog>) => api.post<NutritionLog>('/nutrition/logs', log),
  deleteLog: (id: string) => api.del<{ ok: true }>(`/nutrition/logs/${id}`),
  // AI meal plan
  generateMealPlan: (params: Record<string, unknown>) =>
    api.post<unknown>('/nutrition/generate', params),
  // Food scan via image
  scanFood: (imageBase64: string) =>
    api.post<unknown>('/nutrition/scan', { image: imageBase64 }),
};

// ---------- Tracking ----------

export type TrackingEntry = {
  id: string;
  user_id: string;
  date: string;
  // One of: water, steps, sleep, weight, measurements, cardio, habits, mood, gym_attendance
  type: string;
  value: number | string;
  unit?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export const trackingService = {
  list: (params?: { type?: string; date?: string; from?: string; to?: string }) =>
    api.get<TrackingEntry[]>('/tracking', params),
  add: (entry: Partial<TrackingEntry>) => api.post<TrackingEntry>('/tracking', entry),
  bulkAdd: (entries: Partial<TrackingEntry>[]) =>
    api.post<TrackingEntry[]>('/tracking/bulk', { entries }),
};

// ---------- Progress ----------

export const progressService = {
  getSummary: () => api.get<unknown>('/progress/summary'),
  getFitnessScore: () => api.get<{ score: number }>('/progress/fitness-score'),
};

// ---------- Challenges ----------

export type Challenge = {
  id: string;
  title: string;
  description?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  reward?: string;
  participants?: number;
  joined?: boolean;
  progress?: number;
  [key: string]: unknown;
};

export const challengeService = {
  list: () => api.get<Challenge[]>('/challenges'),
  join: (id: string) => api.post<{ ok: true }>(`/challenges/${id}/join`, {}),
  leave: (id: string) => api.post<{ ok: true }>(`/challenges/${id}/leave`, {}),
};

// ---------- Rewards ----------

export type Reward = {
  id: string;
  title: string;
  description?: string;
  points_cost: number;
  redeemed?: boolean;
  [key: string]: unknown;
};

export const rewardService = {
  list: () => api.get<Reward[]>('/rewards'),
  redeem: (id: string) => api.post<{ ok: true; points_remaining?: number }>(`/rewards/${id}/redeem`, {}),
};

// ---------- Notifications ----------

export type AppNotification = {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  created_at: string;
  [key: string]: unknown;
};

export const notificationService = {
  list: () => api.get<AppNotification[]>('/notifications'),
  markRead: (id: string) => api.post<{ ok: true }>(`/notifications/${id}/read`, {}),
  markAllRead: () => api.post<{ ok: true }>('/notifications/read-all', {}),
};

// ---------- Community / support ----------

export const communityService = {
  list: () => api.get<unknown[]>('/community/posts'),
  create: (content: string, imageBase64?: string) =>
    api.post<unknown>('/community/posts', { content, image: imageBase64 }),
};

export const supportService = {
  create: (subject: string, message: string) =>
    api.post<{ ok: true }>('/support/tickets', { subject, message }),
};
