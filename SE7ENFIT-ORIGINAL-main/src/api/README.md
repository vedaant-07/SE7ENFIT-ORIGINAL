# src/api — Future API Layer

This directory contains a structured API layer for future refactoring.

**Current Active API Layer:** `services/`

The screens currently import from `services/`:
- `services/apiClient.ts` - HTTP client
- `services/authService.ts` - Authentication
- `services/userServices.ts` - User endpoints
- `services/gymOwnerServices.ts` - Gym owner endpoints

## Migration Plan (Future)

1. Gradually migrate screen imports from `services/` to `src/api/`
2. Once all screens migrated, remove `services/`
3. Keep single source of truth for API calls

## Current Status

- `services/` = Active, used by screens
- `src/api/` = Ready for migration, not used yet

Do not delete `src/api/` — it's prepared for future consolidation.
