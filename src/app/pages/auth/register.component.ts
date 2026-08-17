import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <img src="https://i.ibb.co/d4SMQvxj/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg" alt="Logo" class="auth-logo" />
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Join Petals Ethnic to enjoy fast checkouts, track orders, and receive exclusive offers.</p>
        </div>

        <div *ngIf="errorMessage" class="auth-alert error">
          ⚠️ {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              [(ngModel)]="name" 
              name="name" 
              required 
              placeholder="Priya Sharma" 
              class="form-control"
            />
          </div>

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

          <div class="form-group">
            <label class="form-label" for="phone">Mobile Number</label>
            <input 
              type="tel" 
              id="phone" 
              [(ngModel)]="phone" 
              name="phone" 
              placeholder="+91 98765 43210" 
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="password" 
              name="password" 
              required 
              placeholder="At least 6 characters" 
              class="form-control"
            />
          </div>

          <button type="submit" [disabled]="isLoading" class="btn-primary auth-submit-btn">
            {{ isLoading ? 'Creating Account...' : 'Register Account' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login" [queryParams]="{redirect: redirectUrl}">Sign In</a></p>
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
      max-width: 460px;
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
export class RegisterComponent implements OnInit {
  name = '';
  email = '';
  phone = '';
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
    this.redirectUrl = this.route.snapshot.queryParams['redirect'] || '/account';
  }

  async onSubmit() {
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.register(this.name, this.email, this.password, this.phone);
      this.router.navigateByUrl(this.redirectUrl);
    } catch (err: any) {
      console.error('Registration error:', err);
      this.errorMessage = err.message || 'Could not complete registration. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
