# SE7EN FIT Mobile App

India's #1 AI Fitness App - A production-track native mobile application for fitness tracking, nutrition management, and gym management.

## Project Overview

SE7EN FIT is a comprehensive fitness platform with two mobile apps:

1. **User App** - For fitness enthusiasts to track workouts, nutrition, progress, and participate in challenges
2. **Gym Owner App** - For gym owners to manage members, attendance, leads, earnings, and gym profile

**Note:** Admin functionality is handled via a separate web application, not included in this mobile app.

## Architecture

```
Mobile App (Expo React Native)
        │
        ▼
   services/          ← Active API layer
   - apiClient.ts     → HTTP client with auth
   - authService.ts  → Auth endpoints
   - userServices.ts → User endpoints
   - gymOwnerServices.ts
   - advertisementService.ts
        │
        ▼
   Backend API: https://se7en-fit.onrender.com
   Database: TiDB/MySQL
```

**No Supabase. No Base44. No WebView.**

## Quick Start

```bash
# Install dependencies
npm install

# Type checking
npm run typecheck

# Start development server
npm run dev
```

## Native Build Steps

This project is Expo managed and ready for native builds:

```bash
# Generate native Android/iOS projects
npx expo prebuild

# Run on Android (requires Android Studio/emulator)
npx expo run:android

# Run on iOS (requires Xcode, macOS only)
npx expo run:ios

# Build preview APK for Android
eas build -p android --profile preview

# Build production AAB for Play Store
eas build -p android --profile production

# Build for iOS App Store
eas build -p ios --profile production
```

## Tech Stack

- **Frontend**: Expo React Native with Expo Router
- **Navigation**: File-based routing with role-based access
- **Backend API**: Render (https://se7en-fit.onrender.com)
- **Database**: TiDB/MySQL
- **Auth**: JWT tokens stored in SecureStore
- **No Supabase**: This app uses a custom Render backend
- **No WebView**: 100% native UI components

## Auth Flow

### Public Routes
- `/welcome` - Choose account type
- `/(auth)/user-login` - User login
- `/(auth)/user-signup` - User registration
- `/(auth)/gym-owner-login` - Gym owner login
- `/(auth)/gym-owner-signup` - Gym owner registration

### Protected Routes (Role-Based)
- **User role**: `/(user)/*` only
- **Gym Owner role**: `/(gym-owner)/*` only
- Wrong role → Redirected to correct dashboard
- No token → Redirected to `/welcome`

## User App Screens

| Route | Description |
|-------|-------------|
| `/(user)` | Home dashboard with advertisement carousel |
| `/(user)/ai-trainer` | AI-powered workout recommendations |
| `/(user)/workout` | Current workout session |
| `/(user)/workout-guide` | Exercise instructions |
| `/(user)/workout-log` | Workout history |
| `/(user)/exercise-library` | Browse exercises |
| `/(user)/nutrition` | Nutrition tracking |
| `/(user)/nutrition-log` | Food diary |
| `/(user)/food-scan` | AI food recognition |
| `/(user)/tracking` | Health metrics tracking |
| `/(user)/progress` | Progress analytics |
| `/(user)/challenges` | Active challenges |
| `/(user)/rewards` | Reward points & redemption |
| `/(user)/my-gym` | Linked gym info |
| `/(user)/subscription` | Subscription management |
| `/(user)/notifications` | Notifications |
| `/(user)/community` | Community feed |
| `/(user)/profile` | User profile |
| `/(user)/support` | Help & support |

## Gym Owner App Screens

| Route | Description |
|-------|-------------|
| `/(gym-owner)/dashboard` | Owner dashboard |
| `/(gym-owner)/members` | Member management |
| `/(gym-owner)/attendance` | Check-in/out tracking |
| `/(gym-owner)/leads` | Sales leads |
| `/(gym-owner)/earnings` | Revenue analytics |
| `/(gym-owner)/advertisements` | Promotions & offers management |
| `/(gym-owner)/announcements` | Announce to members |
| `/(gym-owner)/equipment` | Equipment inventory |
| `/(gym-owner)/owner-challenges` | Create gym challenges |
| `/(gym-owner)/owner-rewards` | Member rewards |
| `/(gym-owner)/reviews` | Member reviews |
| `/(gym-owner)/referrals` | Referral program |
| `/(gym-owner)/gym-profile` | Public gym profile |

## Advertisement / Promotion System

The app includes a comprehensive advertisement and promotion banner system.

### User Dashboard Carousel

- Swipeable banner carousel on the user home screen
- Auto-slides every 4 seconds, supports manual swipe
- Shows pagination dots
- Displays: AD, OFFER, PROMO, ANNOUNCEMENT badges
- Supports CTA buttons (internal routes or external URLs)
- Tracks impressions and clicks (once per session per ad)
- Hides completely if no ads available

### Audience Targeting

Admin advertisements can target:
- All users
- Premium users only
- Free users only
- Users in a specific city
- Users linked to a specific gym
- Users with no gym linked
- Users by subscription plan

Gym Owner advertisements:
- Can ONLY target their own linked gym members
- Cannot target users outside their gym
- Cannot access other gym owners' members

### Gym Owner Management

Gym owners can create:
- **Announcements** - General updates to members
- **Promotions** - Marketing campaigns
- **Offers** - Special deals and discounts

Features:
- Set title, description, and CTA
- Choose start/end dates
- Pause/activate promotions
- View impressions and clicks

### Backend Database Tables Required

```sql
-- Main advertisements table
CREATE TABLE advertisements (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('advertisement', 'promotion', 'offer', 'announcement') NOT NULL,
  source ENUM('admin', 'gym_owner') NOT NULL,
  status ENUM('draft', 'scheduled', 'active', 'paused', 'expired') DEFAULT 'active',
  image_url VARCHAR(500),
  badge_text VARCHAR(50),
  cta_text VARCHAR(100),
  cta_target_type ENUM('none', 'internal_route', 'external_url') DEFAULT 'none',
  cta_target VARCHAR(500),
  priority INT DEFAULT 0,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  created_by_admin_id VARCHAR(36),
  created_by_gym_owner_id VARCHAR(36),
  target_audience_type ENUM('all_users', 'free_users', 'premium_users', 'city_users', 'gym_members', 'subscription_plan', 'custom'),
  target_city VARCHAR(100),
  target_gym_id VARCHAR(36),
  target_subscription_plan VARCHAR(50),
  impressions_count INT DEFAULT 0,
  clicks_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Track ad impressions
CREATE TABLE advertisement_impressions (
  id VARCHAR(36) PRIMARY KEY,
  advertisement_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  device_id VARCHAR(100),
  INDEX idx_ad_impressions_ad_id (advertisement_id),
  INDEX idx_ad_impressions_user_id (user_id)
);

-- Track ad clicks
CREATE TABLE advertisement_clicks (
  id VARCHAR(36) PRIMARY KEY,
  advertisement_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  device_id VARCHAR(100),
  INDEX idx_ad_clicks_ad_id (advertisement_id),
  INDEX idx_ad_clicks_user_id (user_id)
);
```

### Backend API Endpoints Required

**User-facing:**
- `GET /advertisements/user-dashboard` - Get ads for logged-in user (filtered by audience)
- `POST /advertisements/{id}/impression` - Track impression
- `POST /advertisements/{id}/click` - Track click

**Gym Owner:**
- `GET /gym-owner/advertisements` - List gym owner's ads
- `POST /gym-owner/advertisements` - Create ad (auto-targets own gym)
- `PATCH /gym-owner/advertisements/{id}` - Update ad
- `DELETE /gym-owner/advertisements/{id}` - Delete ad

**Admin (separate website):**
- `GET /admin/advertisements`
- `POST /admin/advertisements`
- `PATCH /admin/advertisements/{id}`
- `DELETE /admin/advertisements/{id}`
- `POST /admin/advertisements/{id}/publish`
- `POST /admin/advertisements/{id}/pause`

### Backend Filtering Logic

`GET /advertisements/user-dashboard` must return only:
- `status = 'active'`
- Current time between `start_at` and `end_at`
- Audience matches the logged-in user:
  - `target_audience_type = 'all_users'` → show to everyone
  - `target_audience_type = 'premium_users'` → only premium subscribers
  - `target_audience_type = 'free_users'` → only free users
  - `target_audience_type = 'city_users'` → users in target_city
  - `target_audience_type = 'gym_members'` → users linked to target_gym_id
  - `source = 'gym_owner'` → only show to users linked to that gym owner's gym
- Sorted by `priority DESC`, `created_at DESC`

## Subscription Plans

| Plan | Price (INR) | Duration | Features |
|------|-------------|----------|----------|
| Free Trial | ₹0 | 7 days | Limited access |
| Basic Monthly | ₹299 | Monthly | Limited access |
| Premium Monthly | ₹499 | Monthly | All features |
| Quarterly | ₹2,999 | 3 months | All features |
| Annual | ₹5,999 | 12 months | All features |

## Health Data Integration

Health services are prepared for native module integration. Currently shows "native setup pending" status.

- **iOS**: HealthKit (requires `npx expo prebuild` + react-native-health)
- **Android**: Health Connect (requires Health Connect app + react-native-health-connect)

Health data will NOT work until native modules are installed and configured.

## Production Checklist

### Completed
- [x] App identity: SE7EN FIT
- [x] No Supabase dependencies
- [x] No WebView dependencies
- [x] API: https://se7en-fit.onrender.com only
- [x] Token in SecureStore
- [x] Role-based navigation guards
- [x] User app screens (19)
- [x] Gym Owner app screens (13)
- [x] No admin screens in mobile app
- [x] API layer documented
- [x] Advertisement carousel component
- [x] Gym owner promotions management

### Pending
- [ ] Backend advertisement endpoints
- [ ] Backend endpoint confirmation
- [ ] Payment gateway integration
- [ ] In-app purchases (RevenueCat)
- [ ] HealthKit native module
- [ ] Health Connect native module
- [ ] Push notifications
- [ ] App Store assets
- [ ] Play Store assets

## File Structure

```
├── app/                    # Expo Router routes
│   ├── (auth)/            # Auth screens
│   ├── (user)/            # User app screens
│   │   └── index.tsx      # Dashboard with ad carousel
│   ├── (gym-owner)/       # Gym owner screens
│   │   ├── advertisements.tsx  # Promotions management
│   │   └── ...
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Entry point
│   └── welcome.tsx        # Welcome screen
├── components/se7enfit/    # Shared components
├── constants/theme.ts      # Brand colors
├── contexts/AuthContext.tsx
├── hooks/
├── services/               # Active API layer
│   ├── apiClient.ts       # HTTP client
│   ├── authService.ts     # Auth
│   ├── userServices.ts    # User endpoints
│   ├── gymOwnerServices.ts
│   └── advertisementService.ts
├── src/
│   ├── api/               # Future API layer
│   ├── components/user/   # User components
│   │   └── AdvertisementCarousel.tsx
│   ├── services/health/   # Health service placeholders
│   └── types/
│       └── advertisement.ts
├── app.json               # Expo config
├── eas.json               # EAS build config
└── package.json
```

## License

Proprietary - SE7EN FIT
