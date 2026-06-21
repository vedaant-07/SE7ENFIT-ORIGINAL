// Gym Owner API - SE7EN FIT
// Dashboard, members, attendance, leads, earnings, etc.

import { api } from './client';

// Types
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

export type AttendanceRecord = {
  id: string;
  gym_owner_id: string;
  member_id: string;
  member_name?: string;
  check_in_at: string;
  check_out_at?: string;
  [key: string]: unknown;
};

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

export type Announcement = {
  id: string;
  gym_owner_id: string;
  title: string;
  body?: string;
  pinned?: boolean;
  created_at?: string;
  [key: string]: unknown;
};

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

export type Review = {
  id: string;
  gym_owner_id: string;
  member_name?: string;
  rating: number;
  comment?: string;
  created_at?: string;
  [key: string]: unknown;
};

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

// Gym Owner Dashboard
export async function getOwnerDashboard(): Promise<{
  gym: GymOwner;
  stats: {
    total_members: number;
    active_members: number;
    new_leads: number;
    revenue_today: number;
    revenue_this_month: number;
    pending_payments: number;
  };
  recent_members?: GymMember[];
  recent_attendance?: AttendanceRecord[];
}> {
  // TODO: Confirm exact backend endpoint
  return api.get('/gym-owner/dashboard');
}

// Members
export async function getMembers(query?: { status?: string }): Promise<GymMember[]> {
  return api.get<GymMember[]>('/gym-owner/members', query);
}

// Attendance
export async function getAttendance(params?: { date?: string; from?: string; to?: string }): Promise<AttendanceRecord[]> {
  return api.get<AttendanceRecord[]>('/gym-owner/attendance', params);
}

// Leads
export async function getLeads(query?: { status?: string }): Promise<Lead[]> {
  return api.get<Lead[]>('/gym-owner/leads', query);
}

// Earnings
export async function getEarnings(): Promise<EarningSummary> {
  return api.get<EarningSummary>('/gym-owner/earnings/summary');
}

// Announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  return api.get<Announcement[]>('/gym-owner/announcements');
}

// Equipment
export async function getEquipment(): Promise<Equipment[]> {
  return api.get<Equipment[]>('/gym-owner/equipment');
}

// Reviews
export async function getReviews(): Promise<Review[]> {
  return api.get<Review[]>('/gym-owner/reviews');
}

// Referrals
export async function getReferrals(): Promise<Referral[]> {
  return api.get<Referral[]>('/gym-owner/referrals');
}

// Gym Profile
export async function getGymProfile(): Promise<GymOwner> {
  return api.get<GymOwner>('/gym-owners/me');
}

export async function updateGymProfile(payload: Partial<GymOwner>): Promise<GymOwner> {
  return api.put<GymOwner>('/gym-owners/me', payload);
}
