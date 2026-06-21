// Advertisement Service - SE7EN FIT
// API functions for the Advertisement/Promotion/Offer/Announcement system.
// Uses the existing Render backend: https://se7en-fit.onrender.com

import { api } from './apiClient';
import type {
  Advertisement,
  CreateGymOwnerAdvertisementPayload,
  UpdateGymOwnerAdvertisementPayload,
} from '@/src/types/advertisement';

// ---------- User-facing endpoints ----------

/**
 * Get advertisements for the user dashboard.
 * Backend filters by:
 * - status = active
 * - current time between start_at and end_at
 * - audience matches the logged-in user
 * - gym_owner source ads match only user's linked gym
 * - sorted by priority DESC, created_at DESC
 */
export async function getUserDashboardAdvertisements(): Promise<Advertisement[]> {
  // TODO: Confirm backend endpoint exists.
  // Expected: GET /advertisements/user-dashboard
  // Returns: Array of Advertisement filtered by user context
  return api.get<Advertisement[]>('/advertisements/user-dashboard');
}

/**
 * Track when an advertisement becomes visible to the user.
 * Call once per ad per session to avoid spam.
 */
export async function trackAdvertisementImpression(adId: string): Promise<void> {
  // TODO: Confirm backend endpoint exists.
  // Expected: POST /advertisements/{adId}/impression
  try {
    await api.post(`/advertisements/${adId}/impression`, {});
  } catch {
    // Silently fail - don't break UX for tracking issues
  }
}

/**
 * Track when a user clicks/taps an advertisement CTA.
 */
export async function trackAdvertisementClick(adId: string): Promise<void> {
  // TODO: Confirm backend endpoint exists.
  // Expected: POST /advertisements/{adId}/click
  try {
    await api.post(`/advertisements/${adId}/click`, {});
  } catch {
    // Silently fail - don't break UX for tracking issues
  }
}

// ---------- Gym Owner endpoints ----------

/**
 * Get all advertisements created by the authenticated gym owner.
 * Security: Backend must ensure only the gym owner's own ads are returned.
 */
export async function getGymOwnerAdvertisements(): Promise<Advertisement[]> {
  // TODO: Confirm backend endpoint exists.
  // Expected: GET /gym-owner/advertisements
  return api.get<Advertisement[]>('/gym-owner/advertisements');
}

/**
 * Create a new advertisement as a gym owner.
 *
 * IMPORTANT SECURITY NOTE:
 * Frontend must never allow gym owner to choose another gym's users.
 * The payload must NOT contain arbitrary targetGymId.
 * Backend must enforce that created_by_gym_owner_id comes from authenticated session,
 * and target_audience_type for gym_members must only target the gym owner's own gym.
 */
export async function createGymOwnerAdvertisement(
  payload: CreateGymOwnerAdvertisementPayload
): Promise<Advertisement> {
  // TODO: Confirm backend endpoint exists.
  // Expected: POST /gym-owner/advertisements
  // Security: Backend must:
  // 1. Extract gym_owner_id from auth token
  // 2. Automatically set target_gym_id to the gym owner's gym
  // 3. Reject any payload that tries to target a different gym
  return api.post<Advertisement>('/gym-owner/advertisements', payload);
}

/**
 * Update an existing gym owner advertisement.
 * Security: Backend must verify ownership before allowing update.
 */
export async function updateGymOwnerAdvertisement(
  id: string,
  payload: UpdateGymOwnerAdvertisementPayload
): Promise<Advertisement> {
  // TODO: Confirm backend endpoint exists.
  // Expected: PATCH /gym-owner/advertisements/{id}
  return api.patch<Advertisement>(`/gym-owner/advertisements/${id}`, payload);
}

/**
 * Delete a gym owner advertisement.
 * Security: Backend must verify ownership before allowing delete.
 */
export async function deleteGymOwnerAdvertisement(id: string): Promise<void> {
  // TODO: Confirm backend endpoint exists.
  // Expected: DELETE /gym-owner/advertisements/{id}
  return api.del(`/gym-owner/advertisements/${id}`);
}

/**
 * Pause an active advertisement.
 */
export async function pauseGymOwnerAdvertisement(id: string): Promise<Advertisement> {
  return api.patch<Advertisement>(`/gym-owner/advertisements/${id}`, { status: 'paused' });
}

/**
 * Activate a paused advertisement.
 */
export async function activateGymOwnerAdvertisement(id: string): Promise<Advertisement> {
  return api.patch<Advertisement>(`/gym-owner/advertisements/${id}`, { status: 'active' });
}

// ---------- Admin endpoints (contract documentation) ----------
// NOTE: Admin functionality is on a separate website, NOT in mobile app.
// These endpoints are documented here for backend contract reference only.

/**
 * Admin: Create advertisement
 * Endpoint: POST /admin/advertisements
 * Payload: Full advertisement data with admin-controlled targeting
 *
 * Admin: List all advertisements
 * Endpoint: GET /admin/advertisements
 *
 * Admin: Update advertisement
 * Endpoint: PATCH /admin/advertisements/{id}
 *
 * Admin: Delete advertisement
 * Endpoint: DELETE /admin/advertisements/{id}
 *
 * Admin: Publish a draft/scheduled ad
 * Endpoint: POST /admin/advertisements/{id}/publish
 *
 * Admin: Pause an active ad
 * Endpoint: POST /admin/advertisements/{id}/pause
 */
