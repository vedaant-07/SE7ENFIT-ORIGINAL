# SE7EN FIT Render Backend Deployment

Use this folder as the Render Web Service root.

## Render settings

- Repository: the repo that contains this `server` folder
- Branch: `main` or your backend branch
- Root Directory: `server`
- Build Command: `npm install && npx prisma db push`
- Start Command: `npm start`

## Required environment variables

```text
DATABASE_URL=your TiDB/MySQL connection string
JWT_SECRET=long random secret
GOOGLE_WEB_CLIENT_ID=your web client id
GOOGLE_ANDROID_CLIENT_ID=your android client id
```

## Important routes now supported

```text
GET  /
GET  /health
POST /api/auth/register
POST /api/auth/login
POST /api/auth/owner-login
POST /api/auth/google
GET  /api/auth/me
POST /api/auth/logout
POST /api/health/sync
GET  /api/health/today
GET  /api/health/history
POST /api/tracking/workout/start
PATCH /api/tracking/workout/session/:id
POST /api/tracking/workout/session/:id/set
POST /api/tracking/workout/end
GET  /api/tracking/workout/history
POST /api/notifications/register-device
POST /api/notifications/unregister-device
```

## After deploy tests

```cmd
curl -i https://se7en-fit.onrender.com/health
curl -i -X POST https://se7en-fit.onrender.com/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"testuser101@gmail.com\",\"password\":\"Test@12345\",\"role\":\"user\"}"
curl -i -X POST https://se7en-fit.onrender.com/api/auth/google -H "Content-Type: application/json" -d "{\"idToken\":\"test\",\"role\":\"user\"}"
```

For the Google test, a clean JSON error `Invalid Google token` means the route exists.
