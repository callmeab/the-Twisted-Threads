import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="admin-login-page container-premium">
    <h1>Admin Login</h1>
    <form #f="ngForm" (ngSubmit)="onSubmit(f)">
      <div class="form-field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" ngModel required minlength="6" />
      </div>
      <div class="form-actions">
        <button type="submit" [disabled]="f.invalid">Sign in</button>
      </div>
    </form>
  </div>
  `,
  styles: [
    `.admin-login-page{max-width:420px;margin:4rem auto;padding:2rem;background:var(--color-pearl);border-radius:8px}`,
    `.form-field{margin-bottom:1rem}`,
    `label{display:block;margin-bottom:.25rem}`,
    `input{width:100%;padding:.5rem;border:1px solid #ddd;border-radius:4px}`
  ]
})
export class AdminLoginComponent {
  private auth: AdminAuthService;

  constructor(private router: Router, private route: ActivatedRoute, private toastr: ToastrService, adminAuth: AdminAuthService) {
    this.auth = adminAuth;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) return;
    const password = (form.value.password || '').toString();
    const ok = this.auth.login(password);
    if (ok) {
      this.toastr.success('Welcome back.', 'Admin');
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
      this.router.navigateByUrl(returnUrl);
    } else {
      this.toastr.error('Invalid password', 'Access Denied');
    }
  }
}
