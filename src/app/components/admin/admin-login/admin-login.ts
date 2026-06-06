import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminAuthService } from '../../../services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './admin-login.html',

  styleUrl: './admin-login.css',
})
export class AdminLogin {
  private fb = inject(FormBuilder);
  private authService = inject(AdminAuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  async onSubmit() {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const { email, password } = this.form.value;
      await this.authService.login(email!, password!);
      // Navigation successful, no need to reset isLoading here
      // as the component will be destroyed.
      this.router.navigate(['/admin/dashboard']);
    } catch (err: any) {
      this.errorMessage.set(this.getFriendlyError(err.code));
      this.isLoading.set(false);
    }
  }

  private getFriendlyError(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}
