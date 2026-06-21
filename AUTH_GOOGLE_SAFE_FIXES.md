# SE7EN FIT Auth + Google Safe Fixes

Applied safe mobile-side fixes only. UI layout was preserved.

## Fixed

- App now prefers `/api/auth/login` and falls back to `/auth/login`.
- Raw HTML backend errors like `Cannot POST /auth/login` are converted to clean app messages.
- User login sends `role: user`.
- Gym owner login sends `role: gym_owner`.
- Google sign-in is wired to the provided OAuth client IDs.
- Google sign-in sends Google token to `/api/auth/google` with role and fallback to `/auth/google`.
- Big green background circle overlays removed from welcome/auth screens.
- Codemagic config includes Google client ID variables and no `instance_type`.

## Provided Client IDs

Android client ID: `106664084110iaj88pvijfgcl4it0cff6dm62326h1d.apps.googleusercontent.com`

Web client ID: `10666408411-4t6tm45luqqa1q8la40f8q44r5js1rik.apps.googleusercontent.com`

## Still required on Render backend

The backend must implement:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/google`

Google endpoint should verify the Google ID token server-side and return SE7EN FIT JWT/session.
