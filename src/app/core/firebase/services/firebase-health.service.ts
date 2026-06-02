import { Injectable, inject } from '@angular/core';
import { FIREBASE_CONFIG } from '../tokens/firebase-config.token';

@Injectable({
  providedIn: 'root',
})
export class FirebaseHealthService {
  private readonly config = inject(FIREBASE_CONFIG);

  public hasPlaceholderConfig(): boolean {
    const options = this.config.firebase;
    const values = [
      options.projectId ?? '',
      options.appId ?? '',
      options.apiKey ?? '',
      options.authDomain ?? '',
    ];
    return values.some((value) => value.includes('your-firebase-'));
  }

  public logBootDiagnostics(): void {
    if (!this.hasPlaceholderConfig()) {
      return;
    }

    console.warn(
      '[Firebase] Placeholder config detected. Replace environment firebase values before release.'
    );
  }
}
