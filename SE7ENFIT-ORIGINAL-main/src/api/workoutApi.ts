// Workout API - SE7EN FIT
// Workout plans, logs, and AI trainer endpoints.

import { api } from './client';

export type WorkoutPlan = {
  id: string;
  user_id?: string;
  title: string;
  type?: string;
  duration_min?: number;
  difficulty?: string;
  exercises: WorkoutExercise[];
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
  image_url?: string;
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

export type Exercise = {
  id: string;
  name: string;
  muscle_group?: string;
  equipment?: string;
  difficulty?: string;
  instructions?: string;
  image_url?: string;
  video_url?: string;
};

export async function getWorkoutLogs(): Promise<WorkoutLog[]> {
  return api.get<WorkoutLog[]>('/workouts/logs');
}

export async function logWorkout(log: Partial<WorkoutLog>): Promise<WorkoutLog> {
  return api.post<WorkoutLog>('/workouts/logs', log);
}

export async function generateWorkoutPlan(params: {
  goal?: string;
  duration_min?: number;
  difficulty?: string;
  equipment?: string[];
}): Promise<WorkoutPlan> {
  // TODO: AI integration - confirm backend endpoint
  return api.post<WorkoutPlan>('/workouts/generate', params);
}

export async function getExerciseLibrary(query?: {
  muscle_group?: string;
  equipment?: string;
}): Promise<Exercise[]> {
  return api.get<Exercise[]>('/exercises', query);
}

export async function getExercise(id: string): Promise<Exercise> {
  return api.get<Exercise>(`/exercises/${id}`);
}
