import { InjectionToken } from '@angular/core';
import { FirebaseEnvironmentConfig } from '../firebase-env.model';

export const FIREBASE_CONFIG = new InjectionToken<FirebaseEnvironmentConfig>(
  'FIREBASE_CONFIG'
);
