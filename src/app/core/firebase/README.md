# Firebase Setup (Production-Oriented)

This project uses modular AngularFire providers and a centralized Firebase config.

## Structure

- `firebase-env.model.ts` - typed Firebase environment contract.
- `firebase.providers.ts` - app-wide provider wiring (Auth, Firestore, Functions, Storage, optional Analytics).
- `tokens/firebase-config.token.ts` - injection token for config access.
- `services/firebase-health.service.ts` - startup diagnostics helper for placeholder keys.

## Environment Keys

Fill values in:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

Important blocks:

- `firebase` - official Firebase Web SDK options.
- `firebaseFeatureFlags` - enable/disable analytics/app-check/emulators by environment.
- `firebaseEmulators` - local emulator ports.
- `firebaseAppCheck` - reCAPTCHA Enterprise site key (when app check is enabled).

## Emulator Strategy

Set:

- `firebaseFeatureFlags.useEmulators = true`

Then start local emulators with your preferred command (`firebase emulators:start` via CLI).

## Recommended Next Steps

1. Add Firebase project IDs/domains for dev and prod.
2. Add Firestore and Storage security rules.
3. Add App Check once domain and key are available.
4. Integrate centralized Firebase error reporting in `GlobalErrorHandler`.
