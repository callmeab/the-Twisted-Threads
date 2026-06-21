import { FirebaseEnvironmentConfig } from '../app/core/firebase/firebase-env.model';

export const environment: FirebaseEnvironmentConfig = {
  production: true,
  firebase: {
    apiKey: 'AIzaSyB5Z20SkHNKMjs0cQlx-zAR2sr3DSaEJFE',
    authDomain: 'the-twisted-thread.firebaseapp.com',
    projectId: 'the-twisted-thread',
    storageBucket: 'the-twisted-thread.firebasestorage.app',
    messagingSenderId: '355932310857',
    appId: '1:355932310857:web:3345295f0e9c90b0735e98',
    measurementId: 'G-1RXKSMFBYC',
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
    siteKey: '',
  },
};
