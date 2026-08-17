import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <img src="https://i.ibb.co/d4SMQvxj/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg" alt="Logo" class="auth-logo" />
          <h1 class="auth-title">Update Password</h1>
          <p class="auth-subtitle">Enter your new password to update your Petals Ethnic account.</p>
        </div>

        <div *ngIf="successMessage" class="auth-alert success">
          ✅ {{ successMessage }}
        </div>

        <div *ngIf="errorMessage" class="auth-alert error">
          ⚠️ {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!successMessage">
          <div class="form-group">
            <label class="form-label" for="password">New Password</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="newPassword" 
              name="password" 
              required 
              placeholder="At least 6 characters" 
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="confirmPassword">Confirm New Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              [(ngModel)]="confirmPassword" 
              name="confirmPassword" 
              required 
              placeholder="Confirm new password" 
              class="form-control"
            />
          </div>

          <button type="submit" [disabled]="isLoading" class="btn-primary auth-submit-btn">
            {{ isLoading ? 'Updating...' : 'Update Password' }}
          </button>
        </form>

        <div class="auth-footer" *ngIf="successMessage">
          <a routerLink="/login" class="btn-primary">Proceed to Sign In →</a>
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
    .auth-logo {
      height: 48px;
      margin-bottom: 12px;
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
    }
  `]
})
export class ResetPasswordComponent {
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please complete both password fields.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.updatePassword(this.newPassword);
      this.successMessage = 'Your password has been successfully updated!';
    } catch (err: any) {
      console.error('Reset password error:', err);
      this.errorMessage = err.message || 'Error updating password. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
