# SE7EN FIT Codemagic Android Build

This project is an Expo Router / React Native app. The repository does not keep generated `android/` and `ios/` folders, so Codemagic must run Expo prebuild before Gradle.

## Recommended workflows

### 1. `android-arm64-apk-preview`
Use this for small APK testing/demo builds.

Output:
`android/app/build/outputs/apk/release/*.apk`

This workflow patches the generated Android project to build only:

```text
arm64-v8a
```

That reduces APK size, but the APK will not install on old 32-bit-only Android devices.

### 2. `android-playstore-aab-production`
Use this for Google Play upload.

Output:
`android/app/build/outputs/bundle/release/*.aab`

For Play Store, AAB is preferred because Google Play can deliver optimized split APKs per device.

## Important production notes

Before using production releases:

1. Set real app signing in Codemagic.
2. Set `EXPO_PUBLIC_API_BASE_URL=https://se7en-fit.onrender.com` in Codemagic environment variables.
3. Test release build on real Android devices.
4. Verify all backend endpoints in `services/backendReadinessService.ts`.
5. Health Connect requires a real native build; it will not work in Expo Go.
6. Push notifications require native build + real push token registration endpoint.
7. Payments are intentionally not production-ready yet; Razorpay/demo payment will be added later.

## Do not commit generated folders unless needed

The workflow generates `android/` during CI. Keeping it generated in Codemagic avoids accidental UI changes and keeps the repo smaller.
