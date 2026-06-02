import { FirebaseEnvironmentConfig } from '../app/core/firebase/firebase-env.model';

export const environment: FirebaseEnvironmentConfig = {
  production: false,
  firebase: {
    projectId: 'your-firebase-project-id-dev',
    appId: 'your-firebase-app-id-dev',
    storageBucket: 'your-firebase-project-id-dev.firebasestorage.app',
    apiKey: 'your-firebase-api-key-dev',
    authDomain: 'your-firebase-project-id-dev.firebaseapp.com',
    messagingSenderId: 'your-messaging-sender-id-dev',
    measurementId: 'your-firebase-measurement-id-dev',
  },
  firebaseFeatureFlags: {
    analytics: false,
    appCheck: false,
    useEmulators: true,
  },
  firebaseEmulators: {
    auth: 9099,
    firestore: 8080,
    functions: 5001,
    storage: 9199,
  },
  firebaseAppCheck: {
    siteKey: 'your-firebase-app-check-site-key-dev',
    debugToken: 'your-firebase-app-check-debug-token',
  },
};
