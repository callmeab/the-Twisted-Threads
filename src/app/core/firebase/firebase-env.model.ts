import { FirebaseOptions } from 'firebase/app';

export interface FirebaseFeatureFlags {
  analytics: boolean;
  appCheck: boolean;
  useEmulators: boolean;
}

export interface FirebaseEmulatorOptions {
  auth: number;
  firestore: number;
  functions: number;
  storage: number;
}

export interface FirebaseAppCheckOptions {
  siteKey: string;
  debugToken?: string;
}

export interface FirebaseEnvironmentConfig {
  production: boolean;
  firebase: FirebaseOptions;
  firebaseFeatureFlags: FirebaseFeatureFlags;
  firebaseEmulators: FirebaseEmulatorOptions;
  firebaseAppCheck: FirebaseAppCheckOptions;
}
