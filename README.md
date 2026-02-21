# TrainHeroic MVP Firebase Setup

This repository contains starter Firebase configuration, local emulator instructions, and a seed script for bootstrapping MVP data.

## 1) Create a Firebase project

1. Create a new project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password at minimum).
3. Create a **Cloud Firestore** database in production mode.
4. Enable **Cloud Functions** (2nd gen is recommended).
5. (Optional but recommended) Enable **App Check** once clients are wired.
6. Install CLI tools:

   ```bash
   npm install -g firebase-tools
   ```

7. Authenticate and select project:

   ```bash
   firebase login
   firebase use --add
   ```

8. Deploy rules/indexes when ready:

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

---

## 2) Emulator setup and run

### Prerequisites

- Node.js 18+
- Java runtime (required by Firestore emulator)

### First-time setup

```bash
firebase init emulators
```

Select at least:
- Authentication Emulator
- Firestore Emulator
- Functions Emulator (if testing callable/trigger logic)

### Start emulators

```bash
firebase emulators:start
```

or import/export local state:

```bash
firebase emulators:start --import=.firebase/emulator-data --export-on-exit
```

### Useful local targets

- Emulator UI: `http://127.0.0.1:4000`
- Firestore: `127.0.0.1:8080`
- Auth: `127.0.0.1:9099`
- Functions: `127.0.0.1:5001`

---

## 3) Required environment variables

Copy each `.env.example` to `.env.local`/`.env` depending on platform conventions.

### Mobile (`apps/mobile/.env.example`)

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_USE_EMULATORS`
- `EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST`
- `EXPO_PUBLIC_AUTH_EMULATOR_URL`
- `EXPO_PUBLIC_FUNCTIONS_EMULATOR_HOST`

### Web (`apps/web/.env.example`)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_USE_EMULATORS`
- `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST`
- `NEXT_PUBLIC_AUTH_EMULATOR_URL`
- `NEXT_PUBLIC_FUNCTIONS_EMULATOR_HOST`

### Functions (`functions/.env.example`)

- `FIREBASE_PROJECT_ID`
- `TZ`
- `SEED_COACH_EMAIL`
- `SEED_ATHLETE_EMAIL`

---

## 4) Date/timezone assumptions

- **Canonical storage**: all persisted timestamps should be UTC (`Timestamp`/ISO UTC).
- **Schedule generation**: generated workout dates should be computed against a single source timezone (default `America/New_York`, overridable via `TZ`).
- **Client rendering**: clients convert UTC timestamps into the user’s locale at display time.
- **Day-boundary logic**: if business logic depends on “training day,” compute in coach/program timezone first, then store normalized UTC moments.

---

## 5) PR-rule behavior for Firestore security changes

When changing `firestore.rules` or access-sensitive schema:

1. Include a short threat-model note in the PR body.
2. Describe each collection and allowed actor (coach/athlete/system).
3. Add/update emulator tests for affected rule paths before merge.
4. Never merge broad wildcard reads/writes (`allow read, write: if true`).
5. If emergency relaxations are needed, add TODO + expiry owner in PR and create follow-up ticket.

---

## 6) Seed/admin script

A starter script is included at `functions/scripts/seed-admin.mjs`.

It creates:
- sample coach user profile
- sample athlete user profile linked by `coachId`
- sample exercises
- sample program and `program_workouts`
- sample assignment (`program_assignments`) so downstream scheduled workout generation can react

### Run

1. Set Application Default Credentials or `GOOGLE_APPLICATION_CREDENTIALS`.
2. Optionally export env values from `functions/.env.example`.
3. Execute:

```bash
node functions/scripts/seed-admin.mjs
```

If using emulators, set `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` before running.
