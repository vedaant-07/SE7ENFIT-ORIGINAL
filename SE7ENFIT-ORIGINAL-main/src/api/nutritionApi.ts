// Nutrition API - SE7EN FIT
// Nutrition logs, meal plans, and food scanning.

import { api } from './client';

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
  image_url?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type DailyNutritionSummary = {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  goal_calories?: number;
  goal_protein?: number;
  logs: NutritionLog[];
};

export async function getNutritionLogs(date?: string): Promise<NutritionLog[]> {
  return api.get<NutritionLog[]>('/nutrition/logs', { date });
}

export async function getDailyNutrition(date: string): Promise<DailyNutritionSummary> {
  return api.get<DailyNutritionSummary>('/nutrition/daily', { date });
}

export async function addNutritionLog(log: Partial<NutritionLog>): Promise<NutritionLog> {
  return api.post<NutritionLog>('/nutrition/logs', log);
}

export async function deleteNutritionLog(id: string): Promise<void> {
  return api.delete(`/nutrition/logs/${id}`);
}

export async function generateMealPlan(params: {
  calories?: number;
  meals_per_day?: number;
  dietary_preference?: string;
}): Promise<unknown> {
  // TODO: AI integration - confirm backend endpoint
  return api.post('/nutrition/generate', params);
}

export async function scanFood(imageBase64: string): Promise<{
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_size?: string;
}> {
  // TODO: AI food recognition - confirm backend endpoint
  return api.post('/nutrition/scan', { image: imageBase64 });
}
