# SE7EN FIT Mobile Production Readiness Audit

This file documents the non-UI production checks applied to this ZIP. No screens, styling, or user interface flows were redesigned.

## Safe fixes applied

1. Fixed Expo Router typed-route TypeScript errors in dashboard quick links and bottom navigation by typing route values as `Href`.
2. Hardened auth boot: if `/auth/me` returns `401` or `403`, the cached token and cached user are cleared so stale sessions cannot bypass role guards.
3. Expanded `.gitignore` for production hygiene: `node_modules`, `.expo`, `.bolt`, environment files, and build outputs. Existing UI files were not removed.

## Current production blockers

1. Native Health Connect/HealthKit wrappers are now implemented, but final device testing requires installing the native packages and building with a native dev/release build. These features cannot work inside Expo Go.
2. Fake EAS project ID placeholder was removed from `app.json`. Run `eas init` in your own Expo account so EAS writes the real project ID.
3. Backend endpoint contract is now centralized in `services/backendReadinessService.ts`; the Render backend must expose those endpoints for full production behavior.
4. Payment gateway flow is intentionally not complete because Razorpay demo/payment work is planned later. Do not ship paid plans until order creation and verification are implemented against the backend.
5. Push notifications and background sync wrappers are now wired safely, but final push/background behavior requires native packages, physical-device testing, and backend device-token endpoints.
6. `.bolt` and `.expo` folders existed in the uploaded ZIP. They are now ignored for future commits, but they were not deleted in this ZIP because the instruction was not to delete without permission.

## Live tracking modules status

### User live tracking
- Active workout/activity session service added in `services/liveTrackingService.ts`.
- Supports start, pause, resume, set logging, end, queued retry sync, and HealthKit/Health Connect workout write attempts.
- UI screens were not changed yet. Existing workout UI can connect to this service in the next UI-safe pass.

### Native health sync
- Android Health Connect wrapper added for steps, distance, active calories, heart rate, sleep, weight, height, hydration, and exercise sessions.
- iOS HealthKit wrapper added for steps, distance, active energy, heart rate, sleep, weight, height, hydration, and workouts.
- `syncTodayHealthToBackend` can push readings to `/tracking/bulk`.

### Gym live tracking
- Backend contract now includes attendance and tracking endpoints. QR/secure attendance UI was not changed in this pass.

### Gym owner live tracking
- Backend contract now covers attendance, advertisements, and member endpoints. Dashboard UI was not changed in this pass.

## Recommended next code step

Install native packages, run `eas init`, prebuild, and test on Android/iOS devices. After that, connect existing workout/tracking screens to `liveTrackingService` without redesigning UI.

## Production Safe Fix Batch 2

Changed without touching UI layout/screens:

- Replaced Health Connect placeholder with a native wrapper for `react-native-health-connect`.
- Replaced HealthKit placeholder with a native wrapper for `react-native-health`.
- Added cross-platform health sync service that can push native health readings to `/tracking/bulk`.
- Added live workout/activity tracking service with persisted active session, pause/resume/end, set logging, HealthKit/Health Connect write support, and retry queue.
- Added Expo push notification registration service with backend device registration.
- Added background sync service for queued live tracking sessions and native health sync.
- Added backend endpoint contract/readiness service.
- Removed fake EAS project ID placeholder from `app.json` so `eas init` can write the real project ID.
- Added Android Health Connect, activity, and notification permissions in `app.json`.
- Added iOS HealthKit, motion, notification, and background mode configuration in `app.json`.
- Added native tracking setup guide: `PRODUCTION_NATIVE_TRACKING_SETUP.md`.

Payment gateway production integration intentionally remains pending as requested.

Note: Native Health Connect/HealthKit and push/background services require installing native packages and running a native build. They cannot work inside Expo Go.
