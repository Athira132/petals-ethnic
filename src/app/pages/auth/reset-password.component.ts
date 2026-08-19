import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo-circle-wrapper">
            <img src="https://i.ibb.co/KjcmQcmy/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg" alt="Petals Ethnic Logo" class="auth-logo" />
          </div>
          <h1 class="auth-title">Update Password</h1>
          <p class="auth-subtitle">Enter your new password to update your Petals Ethnic account.</p>
        </div>

        <div *ngIf="successMessage" class="auth-alert success">
          ✅ {{ successMessage }}
        </div>

        <div *ngIf="errorMessage" class="auth-alert error">
          ⚠️ {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!successMessage && !isLinkExpired">
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
            {{ isLoading ? 'Updating Password...' : 'Update Password' }}
          </button>
        </form>

        <div class="auth-footer" *ngIf="successMessage">
          <a routerLink="/login" class="btn-primary">Proceed to Sign In →</a>
        </div>

        <div class="auth-footer" *ngIf="isLinkExpired">
          <a routerLink="/forgot-password" class="btn-primary">Request New Reset Link →</a>
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
    }
  `]
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  isLinkExpired = false;
  successMessage = '';
  errorMessage = '';
  private authSubscription: any;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Check current auth session
    const { data: { session } } = await this.supabaseService.supabase.auth.getSession();

    const { data: listener } = this.supabaseService.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        this.isLinkExpired = false;
        this.errorMessage = '';
      }
    });
    this.authSubscription = listener.subscription;

    if (!session && !window.location.hash.includes('access_token') && !window.location.href.includes('type=recovery')) {
      this.isLinkExpired = true;
      this.errorMessage = 'This password reset link is invalid or has expired. Please request a new link.';
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

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
      this.successMessage = 'Your password has been successfully updated! You can now log in with your new password.';
    } catch (err: any) {
      console.error('Reset password error:', err);
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('jwt expired') || msg.includes('token expired') || msg.includes('session expired') || msg.includes('auth event')) {
        this.isLinkExpired = true;
        this.errorMessage = 'Your password reset link has expired. Please request a new link.';
      } else {
        this.errorMessage = err.message || 'Error updating password. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}

