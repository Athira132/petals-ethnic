import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo-circle-wrapper">
            <img src="https://i.ibb.co/KjcmQcmy/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg" alt="Petals Ethnic Logo" class="auth-logo" />
          </div>
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Log in to your Petals Ethnic account to manage orders, catalog, and profile.</p>
        </div>

        <div *ngIf="errorMessage" class="auth-alert error">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="email" 
              name="email" 
              placeholder="you@example.com" 
              class="form-control"
            />
          </div>

          <div class="form-group">
            <div class="label-flex">
              <label class="form-label" for="password">Password</label>
              <a routerLink="/forgot-password" class="forgot-link">Forgot Password?</a>
            </div>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="password" 
              name="password" 
              placeholder="••••••••" 
              class="form-control"
            />
          </div>

          <button type="submit" [disabled]="isLoading" class="btn-primary auth-submit-btn">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register" [queryParams]="{redirect: redirectUrl}">Create One Here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      padding: 60px 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      background-color: var(--color-bg-alt);
    }
    .auth-card {
      background: #FFFFFF;
      width: 100%;
      max-width: 440px;
      padding: 40px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-light);
      box-shadow: var(--shadow-md);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .logo-circle-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      overflow: hidden;
      margin: 0 auto 16px auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .auth-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .auth-title {
      font-size: 28px;
      margin-bottom: 8px;
    }
    .auth-subtitle {
      font-size: 13px;
      color: var(--color-muted);
    }
    .auth-alert {
      padding: 12px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      margin-bottom: 20px;
    }
    .auth-alert.error {
      background-color: #FFEBEE;
      color: #C62828;
      border: 1px solid #FFCDD2;
    }
    .label-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .forgot-link {
      font-size: 12px;
      color: var(--color-pink-dark);
      font-weight: 500;
    }
    .auth-submit-btn {
      width: 100%;
      padding: 14px;
      margin-top: 10px;
    }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: var(--color-muted);
    }
    .auth-footer a {
      color: #C05676;
      font-weight: 600;
    }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  redirectUrl = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.redirectUrl = this.route.snapshot.queryParams['redirect'] || '';
  }

  async onSubmit() {
    this.errorMessage = '';

    if (!this.email || !this.email.trim()) {
      this.errorMessage = 'Please enter your email.';
      return;
    }

    if (!this.password || !this.password.trim()) {
      this.errorMessage = 'Please enter your password.';
      return;
    }

    this.isLoading = true;

    try {
      const res = await this.authService.login(this.email.trim(), this.password);
      
      if (!res?.user) {
        this.errorMessage = 'Incorrect email or password.';
        return;
      }

      // Determine admin status and navigate immediately without artificial delays or setTimeout
      const email = (res.user.email || '').toLowerCase();
      const isAdmin = email === 'petalsethnic@gmail.com' || email === 'dhanyaadwork@gmail.com' || this.authService.isAdmin;

      this.router.navigateByUrl(this.redirectUrl || (isAdmin ? '/admin' : '/account'));

    } catch (err: any) {
      // Map all authentication failure responses directly to user-facing error
      this.errorMessage = 'Incorrect email or password.';
    } finally {
      this.isLoading = false;
    }
  }
}
