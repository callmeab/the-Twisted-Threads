import { FirebaseEnvironmentConfig } from '../app/core/firebase/firebase-env.model';

export const environment: FirebaseEnvironmentConfig = {
  production: true,
  firebase: {
    projectId: 'your-firebase-project-id',
    appId: 'your-firebase-app-id',
    storageBucket: 'your-firebase-project-id.firebasestorage.app',
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-firebase-project-id.firebaseapp.com',
    messagingSenderId: 'your-messaging-sender-id',
    measurementId: 'your-firebase-measurement-id',
  },
  firebaseFeatureFlags: {
    analytics: true,
    appCheck: false,
    useEmulators: false,
  },
  firebaseEmulators: {
    auth: 9099,
    firestore: 8080,
    functions: 5001,
    storage: 9199,
  },
  firebaseAppCheck: {
    siteKey: 'your-firebase-app-check-site-key',
  },
};
