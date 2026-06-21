// Progress API - SE7EN FIT
// User progress tracking and fitness scores.

import { api } from './client';

export type ProgressSummary = {
  current_weight?: number;
  starting_weight?: number;
  weight_goal?: number;
  workouts_completed: number;
  total_calories_burned: number;
  streak_days: number;
  longest_streak: number;
  fitness_score: number;
  progress_percentage: number;
  weekly_stats: WeeklyStats[];
};

export type WeeklyStats = {
  week_start: string;
  workouts: number;
  calories_burned: number;
  weight?: number;
};

export type FitnessScore = {
  score: number;
  max_score: number;
  components: {
    strength: number;
    cardio: number;
    consistency: number;
    nutrition: number;
  };
};

export async function getProgressSummary(): Promise<ProgressSummary> {
  // TODO: Confirm exact backend endpoint
  return api.get<ProgressSummary>('/progress/summary');
}

export async function getFitnessScore(): Promise<FitnessScore> {
  return api.get<FitnessScore>('/progress/fitness-score');
}
