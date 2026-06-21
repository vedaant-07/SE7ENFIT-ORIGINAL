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
| `/(user)` | Home dashboard |
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
| `/(gym-owner)/announcements` | Announce to members |
| `/(gym-owner)/equipment` | Equipment inventory |
| `/(gym-owner)/owner-challenges` | Create gym challenges |
| `/(gym-owner)/owner-rewards` | Member rewards |
| `/(gym-owner)/reviews` | Member reviews |
| `/(gym-owner)/referrals` | Referral program |
| `/(gym-owner)/gym-profile` | Public gym profile |

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
- [x] Gym Owner app screens (12)
- [x] No admin screens in mobile app
- [x] API layer documented

### Pending
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
│   ├── (gym-owner)/       # Gym owner screens
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
│   └── gymOwnerServices.ts
├── src/
│   ├── api/               # Future API layer (not used yet)
│   └── services/health/   # Health service placeholders
├── app.json               # Expo config
├── eas.json               # EAS build config
└── package.json
```

## License

Proprietary - SE7EN FIT
