// Gym owner services — members, attendance, leads, earnings, announcements,
// equipment, owner-side challenges & rewards, reviews, referrals, profile.
//
// All routes are convention-based placeholders against your Render backend.
// Update paths here when you confirm the real ones — no other file changes.

import { api } from './apiClient';

// ---------- Gym owner profile ----------

export type GymOwner = {
  id: string;
  user_id: string;
  owner_name: string;
  email: string;
  mobile?: string;
  gym_name: string;
  gym_address?: string;
  gym_city?: string;
  referral_code?: string;
  onboarding_complete: boolean;
  logo_url?: string;
  cover_url?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export const gymOwnerService = {
  getMine: () => api.get<GymOwner>('/gym-owners/me'),
  upsert: (data: Partial<GymOwner>) => api.put<GymOwner>('/gym-owners/me', data),
  completeOnboarding: (data: Partial<GymOwner>) =>
    api.post<GymOwner>('/gym-owners/onboarding', data),
};

// ---------- Members ----------

export type GymMember = {
  id: string;
  gym_owner_id: string;
  user_id?: string;
  name: string;
  email?: string;
  mobile?: string;
  plan?: string;
  join_date?: string;
  membership_end?: string;
  status: 'active' | 'expired' | 'frozen';
  avatar_url?: string;
  [key: string]: unknown;
};

export const memberService = {
  list: (query?: { status?: string }) => api.get<GymMember[]>('/gym-owner/members', query),
  get: (id: string) => api.get<GymMember>(`/gym-owner/members/${id}`),
  create: (member: Partial<GymMember>) => api.post<GymMember>('/gym-owner/members', member),
  update: (id: string, patch: Partial<GymMember>) =>
    api.put<GymMember>(`/gym-owner/members/${id}`, patch),
  remove: (id: string) => api.del<{ ok: true }>(`/gym-owner/members/${id}`),
};

// ---------- Attendance ----------

export type AttendanceRecord = {
  id: string;
  gym_owner_id: string;
  member_id: string;
  member_name?: string;
  check_in_at: string;
  check_out_at?: string;
  [key: string]: unknown;
};

export const attendanceService = {
  list: (params?: { date?: string; from?: string; to?: string }) =>
    api.get<AttendanceRecord[]>('/gym-owner/attendance', params),
  checkIn: (memberId: string) =>
    api.post<AttendanceRecord>('/gym-owner/attendance/check-in', { member_id: memberId }),
  checkOut: (memberId: string) =>
    api.post<AttendanceRecord>('/gym-owner/attendance/check-out', { member_id: memberId }),
};

// ---------- Leads ----------

export type Lead = {
  id: string;
  gym_owner_id: string;
  name: string;
  email?: string;
  mobile?: string;
  source?: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  notes?: string;
  created_at?: string;
  [key: string]: unknown;
};

export const leadService = {
  list: (query?: { status?: string }) => api.get<Lead[]>('/gym-owner/leads', query),
  create: (lead: Partial<Lead>) => api.post<Lead>('/gym-owner/leads', lead),
  update: (id: string, patch: Partial<Lead>) => api.put<Lead>(`/gym-owner/leads/${id}`, patch),
  remove: (id: string) => api.del<{ ok: true }>(`/gym-owner/leads/${id}`),
};

// ---------- Earnings ----------

export type EarningSummary = {
  total_revenue: number;
  this_month: number;
  pending: number;
  recent: EarningTransaction[];
};

export type EarningTransaction = {
  id: string;
  member_name?: string;
  amount: number;
  type: string;
  date: string;
  status: string;
};

export const earningsService = {
  summary: () => api.get<EarningSummary>('/gym-owner/earnings/summary'),
  list: (params?: { from?: string; to?: string }) =>
    api.get<EarningTransaction[]>('/gym-owner/earnings', params),
};

// ---------- Announcements ----------

export type Announcement = {
  id: string;
  gym_owner_id: string;
  title: string;
  body?: string;
  pinned?: boolean;
  created_at?: string;
  [key: string]: unknown;
};

export const announcementService = {
  list: () => api.get<Announcement[]>('/gym-owner/announcements'),
  create: (data: Partial<Announcement>) =>
    api.post<Announcement>('/gym-owner/announcements', data),
  remove: (id: string) => api.del<{ ok: true }>(`/gym-owner/announcements/${id}`),
};

// ---------- Equipment ----------

export type Equipment = {
  id: string;
  gym_owner_id: string;
  name: string;
  category?: string;
  quantity: number;
  condition?: 'new' | 'good' | 'needs_repair';
  notes?: string;
  [key: string]: unknown;
};

export const equipmentService = {
  list: () => api.get<Equipment[]>('/gym-owner/equipment'),
  create: (data: Partial<Equipment>) => api.post<Equipment>('/gym-owner/equipment', data),
  update: (id: string, patch: Partial<Equipment>) =>
    api.put<Equipment>(`/gym-owner/equipment/${id}`, patch),
  remove: (id: string) => api.del<{ ok: true }>(`/gym-owner/equipment/${id}`),
};

// ---------- Owner challenges & rewards ----------

export type OwnerChallenge = {
  id: string;
  gym_owner_id: string;
  title: string;
  description?: string;
  reward?: string;
  start_date?: string;
  end_date?: string;
  participants?: number;
  [key: string]: unknown;
};

export type OwnerReward = {
  id: string;
  gym_owner_id: string;
  title: string;
  description?: string;
  points_cost: number;
  claimed_count?: number;
  [key: string]: unknown;
};

export const ownerChallengeService = {
  list: () => api.get<OwnerChallenge[]>('/gym-owner/challenges'),
  create: (data: Partial<OwnerChallenge>) =>
    api.post<OwnerChallenge>('/gym-owner/challenges', data),
  remove: (id: string) => api.del<{ ok: true }>(`/gym-owner/challenges/${id}`),
};

export const ownerRewardService = {
  list: () => api.get<OwnerReward[]>('/gym-owner/rewards'),
  create: (data: Partial<OwnerReward>) => api.post<OwnerReward>('/gym-owner/rewards', data),
  remove: (id: string) => api.del<{ ok: true }>(`/gym-owner/rewards/${id}`),
};

// ---------- Reviews ----------

export type Review = {
  id: string;
  gym_owner_id: string;
  member_name?: string;
  rating: number;
  comment?: string;
  created_at?: string;
  [key: string]: unknown;
};

export const reviewService = {
  list: () => api.get<Review[]>('/gym-owner/reviews'),
  reply: (id: string, reply: string) =>
    api.post<{ ok: true }>(`/gym-owner/reviews/${id}/reply`, { reply }),
};

// ---------- Referrals ----------

export type Referral = {
  id: string;
  gym_owner_id: string;
  referral_code: string;
  referred_name?: string;
  referred_email?: string;
  status: 'pending' | 'converted';
  reward_given?: boolean;
  created_at?: string;
  [key: string]: unknown;
};

export const referralService = {
  list: () => api.get<Referral[]>('/gym-owner/referrals'),
  generateCode: () => api.post<{ code: string }>('/gym-owner/referrals/generate', {}),
};

// ---------- Gym profile (public-ish) ----------

export const gymProfileService = {
  get: () => api.get<GymOwner>('/gym-owners/me'),
  update: (data: Partial<GymOwner>) => api.put<GymOwner>('/gym-owners/me', data),
};
