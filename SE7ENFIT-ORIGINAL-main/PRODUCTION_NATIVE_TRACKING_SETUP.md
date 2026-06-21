# SE7EN FIT Production Native Tracking Setup

This project now includes production-safe service wrappers for:

- Android Health Connect
- iOS HealthKit
- live workout/activity session tracking
- push notification device registration
- background sync for queued tracking data
- backend endpoint contract checks

The UI was not redesigned or removed.

## Required native packages before final store builds

Native packages have been added to `package.json`. Refresh dependencies locally before running builds:

```bash
npm install
# Optional, to let Expo align exact Expo SDK package versions:
npx expo install expo-notifications expo-device expo-task-manager expo-background-fetch
```

Then generate native projects:

```bash
npx expo prebuild --clean
```

## Android Health Connect

The service wrapper is in:

```text
src/services/health/androidHealthConnect.ts
```

It uses `react-native-health-connect` dynamically. The app.json already includes Health Connect permissions for steps, distance, calories, heart rate, sleep, weight, height, hydration, exercise, and active calories.

Health Connect will not work inside Expo Go. Use a development build, preview APK, or production build.

## iOS HealthKit

The service wrapper is in:

```text
src/services/health/iosHealthKit.ts
```

It uses `react-native-health` dynamically. app.json already includes HealthKit usage descriptions and entitlement.

After prebuild, confirm HealthKit capability is enabled in Xcode before App Store release.

## Live tracking

Core live session tracking service:

```text
services/liveTrackingService.ts
```

It supports:

- start session
- pause session
- resume session
- log exercise sets
- end session
- write workout summary to HealthKit / Health Connect where available
- queue failed syncs in AsyncStorage
- flush sync queue to backend

Expected backend endpoints:

```text
POST  /tracking/live-sessions
PATCH /tracking/live-sessions/:id
POST  /tracking
POST  /tracking/bulk
```

## Push notifications

Service:

```text
services/pushNotificationService.ts
```

Expected backend endpoints:

```text
POST /notifications/register-device
POST /notifications/unregister-device
```

The app registers push tokens after login when Expo Notifications is available.

## Background sync

Service:

```text
services/backgroundSyncService.ts
```

It syncs queued live tracking sessions and health data when native background fetch is available.

## EAS project ID

The fake placeholder project ID was removed from `app.json`. Run:

```bash
eas init
```

EAS will write the real project ID into app config.

Do not manually add a fake project ID.

## Payment gateway

Payment production integration is intentionally not implemented now, as requested. Razorpay demo can be added later without touching these tracking services.

## Package lock note

Because native packages were added to `package.json`, run `npm install` once to refresh `package-lock.json` before pushing to CI/EAS. Do not run `npm ci` until the lockfile is refreshed.
