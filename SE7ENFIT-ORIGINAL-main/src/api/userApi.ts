// User API - SE7EN FIT
// User profile, dashboard, and settings endpoints.

import { api } from './client';

export type UserProfile = {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  mobile?: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  goal?: string;
  activity_level?: string;
  dietary_preference?: string;
  gym_owner_id?: string | null;
  onboarding_complete?: boolean;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type UserDashboard = {
  user: UserProfile;
  stats: {
    workouts_completed: number;
    calories_burned: number;
    streak_days: number;
    points: number;
  };
  upcoming_workout?: unknown;
  recent_activity?: unknown[];
  [key: string]: unknown;
};

export async function getUserDashboard(): Promise<UserDashboard> {
  // TODO: Confirm exact backend endpoint
  return api.get<UserDashboard>('/users/me/dashboard');
}

export async function getUserProfile(): Promise<UserProfile> {
  return api.get<UserProfile>('/users/me/profile');
}

export async function updateUserProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
  return api.put<UserProfile>('/users/me/profile', payload);
}
