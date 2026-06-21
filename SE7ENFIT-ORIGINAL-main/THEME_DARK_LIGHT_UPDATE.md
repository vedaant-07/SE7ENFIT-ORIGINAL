# SE7EN FIT Dark/Light Theme Update

Safe UI-preserving changes added:

- Persisted dark/light theme with `@react-native-async-storage/async-storage`.
- Theme state is global through `ThemeProvider`.
- Added reusable `components/se7enfit/ThemeModeSelector.tsx`.
- User can change theme from `User > Profile > Appearance`.
- Gym owner can change theme from `Gym Owner > Gym Profile > Theme`.
- Converted app screens/components from static theme constants to `useTheme()` so both user and gym-owner areas react to theme changes.
- Updated user and gym-owner route layouts to use theme background instead of hardcoded black.
- Preserved existing UI structure, routes, screens, business logic, and visual hierarchy.

No UI screen was deleted. No app flow was redesigned.

Run after extracting:

```bash
npm install
npm run typecheck
npx expo start
```

For Codemagic Android ARM64 build, continue using the existing workflow:

```text
android-arm64-apk-preview
```
