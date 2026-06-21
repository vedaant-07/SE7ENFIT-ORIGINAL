// Advertisement Types - SE7EN FIT
// Types for the Advertisement/Promotion/Offer/Announcement system.

export type AdvertisementType =
  | 'advertisement'
  | 'promotion'
  | 'offer'
  | 'announcement';

export type AdvertisementSource =
  | 'admin'
  | 'gym_owner';

export type AdvertisementStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'expired';

export type AdvertisementTargetType =
  | 'none'
  | 'internal_route'
  | 'external_url';

export type AdvertisementAudienceType =
  | 'all_users'
  | 'free_users'
  | 'premium_users'
  | 'city_users'
  | 'gym_members'
  | 'subscription_plan'
  | 'custom';

export type AdvertisementBadgeVariant =
  | 'AD'
  | 'OFFER'
  | 'PROMO'
  | 'ANNOUNCEMENT';

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  type: AdvertisementType;
  source: AdvertisementSource;
  status: AdvertisementStatus;
  imageUrl?: string;
  badgeText?: string;
  ctaText?: string;
  ctaTargetType: AdvertisementTargetType;
  ctaTarget?: string;
  priority: number;
  startAt: string;
  endAt: string;
  createdByAdminId?: string;
  createdByGymOwnerId?: string;
  targetAudienceType: AdvertisementAudienceType;
  targetCity?: string;
  targetGymId?: string;
  targetSubscriptionPlan?: string;
  impressionsCount?: number;
  clicksCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdvertisementImpression {
  id: string;
  advertisementId: string;
  userId: string;
  viewedAt: string;
  deviceId?: string;
}

export interface AdvertisementClick {
  id: string;
  advertisementId: string;
  userId: string;
  clickedAt: string;
  deviceId?: string;
}

export interface CreateGymOwnerAdvertisementPayload {
  title: string;
  description: string;
  type: AdvertisementType;
  imageUrl?: string;
  badgeText?: string;
  ctaText?: string;
  ctaTargetType: AdvertisementTargetType;
  ctaTarget?: string;
  priority?: number;
  startAt: string;
  endAt: string;
}

export interface UpdateGymOwnerAdvertisementPayload extends Partial<CreateGymOwnerAdvertisementPayload> {
  status?: AdvertisementStatus;
}

// Helper to get badge variant from type
export function getBadgeFromType(type: AdvertisementType): AdvertisementBadgeVariant {
  switch (type) {
    case 'advertisement':
      return 'AD';
    case 'promotion':
      return 'PROMO';
    case 'offer':
      return 'OFFER';
    case 'announcement':
      return 'ANNOUNCEMENT';
    default:
      return 'AD';
  }
}

// Helper to check if ad is currently active
export function isAdActive(ad: Advertisement): boolean {
  if (ad.status !== 'active') return false;
  const now = new Date();
  const start = new Date(ad.startAt);
  const end = new Date(ad.endAt);
  return now >= start && now <= end;
}
