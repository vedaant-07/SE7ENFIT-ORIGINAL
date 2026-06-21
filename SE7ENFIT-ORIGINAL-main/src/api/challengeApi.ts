// Challenge API - SE7EN FIT
// User challenges and competitions.

import { api } from './client';

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

export async function getChallenges(): Promise<Challenge[]> {
  return api.get<Challenge[]>('/challenges');
}

export async function joinChallenge(id: string): Promise<{ ok: true }> {
  return api.post<{ ok: true }>(`/challenges/${id}/join`, {});
}

export async function leaveChallenge(id: string): Promise<{ ok: true }> {
  return api.post<{ ok: true }>(`/challenges/${id}/leave`, {});
}
