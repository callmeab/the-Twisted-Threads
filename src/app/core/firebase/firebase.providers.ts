import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import {
  provideFirestore,
  getFirestore,
  connectFirestoreEmulator,
} from '@angular/fire/firestore';
import {
  provideFunctions,
  getFunctions,
  connectFunctionsEmulator,
} from '@angular/fire/functions';
import {
  provideStorage,
  getStorage,
  connectStorageEmulator,
} from '@angular/fire/storage';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';
import { FIREBASE_CONFIG } from './tokens/firebase-config.token';
import { FirebaseEnvironmentConfig } from './firebase-env.model';

let emulatorsConnected = false;

export function provideFirebase(config: FirebaseEnvironmentConfig): EnvironmentProviders {
  const providers = [
    { provide: FIREBASE_CONFIG, useValue: config },
    provideFirebaseApp(() => initializeApp(config.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      if (config.firebaseFeatureFlags.useEmulators && !emulatorsConnected) {
        connectAuthEmulator(auth, `http://127.0.0.1:${config.firebaseEmulators.auth}`, {
          disableWarnings: true,
        });
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (config.firebaseFeatureFlags.useEmulators && !emulatorsConnected) {
        connectFirestoreEmulator(firestore, '127.0.0.1', config.firebaseEmulators.firestore);
      }
      return firestore;
    }),
    provideFunctions(() => {
      const functions = getFunctions();
      if (config.firebaseFeatureFlags.useEmulators && !emulatorsConnected) {
        connectFunctionsEmulator(functions, '127.0.0.1', config.firebaseEmulators.functions);
      }
      return functions;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (config.firebaseFeatureFlags.useEmulators && !emulatorsConnected) {
        connectStorageEmulator(storage, '127.0.0.1', config.firebaseEmulators.storage);
      }
      return storage;
    }),
  ];

  if (config.firebaseFeatureFlags.useEmulators) {
    emulatorsConnected = true;
  }

  if (config.firebaseFeatureFlags.analytics) {
    providers.push(provideAnalytics(() => getAnalytics()));
  }

  return makeEnvironmentProviders(providers);
}
