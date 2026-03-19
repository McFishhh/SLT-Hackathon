# BigCommunity

BigCommunity is a TypeScript Expo + React Native starter for a community announcements platform. It is structured as a clean framework you can build on for mobile and web, with shared app state, typed models, and Firebase-ready service boundaries.

## Stack

- Expo
- React Native
- Expo Router
- TypeScript
- Firebase

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Start the app:

```bash
npx expo start
```

4. Open the web version with `w`, or run on iOS/Android from the Expo CLI.

## Project Structure

```text
app/                      Expo Router pages
src/components/           Shared UI building blocks
src/constants/            Theme tokens and reusable constants
src/context/              Global app state and provider
src/data/                 Mock seed data for local development
src/lib/                  Firebase initialization
src/services/             Firebase-facing service layer
src/types/                Shared TypeScript models
```

## Architecture Notes

- `AppProvider` stores the active user, announcements, selected announcement, and loading state.
- Services are split from UI so Firebase integration can evolve without forcing component rewrites.
- Shared interfaces in `src/types` keep data passing between pages explicit and readable.
- The app currently uses mock data for announcements while leaving clear hooks for Firestore/Auth.

## Next Steps

- Add Firebase credentials to `.env`
- Web analytics can be initialized through `getFirebaseAnalytics()` from `src/lib/firebase.ts`
- Replace the mock auth and announcement service methods with live Firebase calls
- Add admin announcement creation and edit flows
- Add role-based access if different community members need different permissions

## Firestore Rules

Use the starter rules in `firestore.rules` so signed-in users can create and read their own profile documents:

```text
firebase console -> Firestore Database -> Rules
```

Paste the contents of `firestore.rules` there and publish them before testing registration/login.
