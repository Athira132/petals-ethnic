import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo-circle-wrapper">
            <img src="https://i.ibb.co/KjcmQcmy/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg" alt="Petals Ethnic Logo" class="auth-logo" />
          </div>
          <h1 class="auth-title">Reset Password</h1>
          <p class="auth-subtitle">Enter your registered email address to receive password reset instructions.</p>
        </div>

        <div *ngIf="successMessage" class="auth-alert success">
          ✅ {{ successMessage }}
        </div>

        <div *ngIf="errorMessage" class="auth-alert error">
          ⚠️ {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!successMessage">
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="email" 
              name="email" 
              required 
              placeholder="you@example.com" 
              class="form-control"
            />
          </div>

          <button type="submit" [disabled]="isLoading" class="btn-primary auth-submit-btn">
            {{ isLoading ? 'Sending Email...' : 'Send Reset Link' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Remembered your password? <a routerLink="/login">Back to Sign In</a></p>
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
    .auth-alert.success {
      background-color: #E8F5E9;
      color: #2E7D32;
      border: 1px solid #C8E6C9;
    }
    .auth-alert.error {
      background-color: #FFEBEE;
      color: #C62828;
      border: 1px solid #FFCDD2;
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
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  async onSubmit() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.resetPassword(this.email);
    } catch (err: any) {
      console.error('Forgot password request log:', err);
    } finally {
      // Safe generic message without account enumeration risk
      this.successMessage = 'If an account exists for this email, a password reset link has been sent. Please check your email.';
      this.isLoading = false;
    }
  }
}
