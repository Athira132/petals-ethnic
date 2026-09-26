import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { UserProfile } from '../models/user.model';
import { User, Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(true);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.initAuth();
  }

  private async initAuth(): Promise<void> {
    try {
      const { data: { session } } = await this.supabaseService.supabase.auth.getSession();
      if (session?.user) {
        this.currentUserSubject.next(session.user);
        await this.loadUserProfile(session.user.id);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      this.isLoadingSubject.next(false);
    }

    this.supabaseService.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        this.currentUserSubject.next(session.user);
        await this.loadUserProfile(session.user.id);
      } else {
        this.currentUserSubject.next(null);
        this.userProfileSubject.next(null);
      }
      this.isLoadingSubject.next(false);
    });
  }

  public async loadUserProfile(userId: string): Promise<UserProfile | null> {
    const user = this.currentUserSubject.value;

    try {
      const { data, error } = await this.supabaseService.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        this.userProfileSubject.next(data as UserProfile);
        return data as UserProfile;
      }

      if (error) {
        console.warn('Direct profile query notice:', error.message);
      }
    } catch (err) {
      console.warn('Error fetching profile directly:', err);
    }

    // Resilient fallback for admin and registered users if RLS policy limits direct SELECT
    if (user) {
      const email = (user.email || '').toLowerCase();
      const isAdminEmail = email === 'petalsethnic@gmail.com' || email === 'dhanyaadwork@gmail.com';
      const roleFromMeta = user.user_metadata?.['role'] || (isAdminEmail ? 'admin' : 'customer');

      const fallbackProfile: UserProfile = {
        id: userId,
        name: user.user_metadata?.['name'] || (isAdminEmail ? 'Petals Ethnic Admin' : email.split('@')[0]),
        email: user.email || '',
        phone: user.user_metadata?.['phone'] || '',
        role: roleFromMeta as any,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.userProfileSubject.next(fallbackProfile);
      return fallbackProfile;
    }

    return null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get userProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  get isAdmin(): boolean {
    const role = this.userProfileSubject.value?.role;
    if (role === 'admin' || role === 'superadmin') return true;

    const email = (this.currentUserSubject.value?.email || '').toLowerCase();
    return email === 'petalsethnic@gmail.com' || email === 'dhanyaadwork@gmail.com';
  }

  async login(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    let { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword
    });

    // If login failed because an existing user was created previously without email confirmation,
    // auto-confirm and retry signInWithPassword
    if (error && (error.message.includes('Email not confirmed') || error.message.includes('Invalid login credentials'))) {
      try {
        const confirmRes = await fetch('/api/auth-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'confirm_email', email: cleanEmail })
        });
        if (confirmRes.ok) {
          const retryResult = await this.supabaseService.supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword
          });
          if (!retryResult.error && retryResult.data?.user) {
            data = retryResult.data;
            error = null;
          }
        }
      } catch (confirmErr) {
        console.warn('Auto-confirmation attempt notice:', confirmErr);
      }
    }

    if (error) {
      console.error('Supabase signInWithPassword error:', error);
      throw error;
    }

    if (data?.user) {
      this.currentUserSubject.next(data.user);
      // Asynchronously fetch profile without delaying immediate authentication response
      this.loadUserProfile(data.user.id).catch(err => console.warn('Background profile load note:', err));
    }
    return data;
  }

  async register(name: string, email: string, password: string, phone: string = '') {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    // 1. Register and auto-confirm via serverless API
    try {
      const res = await fetch('/api/auth-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          phone: cleanPhone
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Registration failed.');
      }
    } catch (apiErr: any) {
      console.warn('API registration notice, attempting direct fallback:', apiErr?.message);
      const { data, error } = await this.supabaseService.supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            name: cleanName,
            phone: cleanPhone
          }
        }
      });
      if (error) throw error;
    }

    // 2. Immediately authenticate and return session
    return await this.login(cleanEmail, cleanPassword);
  }

  async logout() {
    try {
      await this.supabaseService.supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    this.currentUserSubject.next(null);
    this.userProfileSubject.next(null);
  }

  async resetPassword(email: string) {
    const { data, error } = await this.supabaseService.supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
    return data;
  }

  async updatePassword(newPassword: string) {
    const { data, error } = await this.supabaseService.supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  }

  async updateProfile(name: string, phone: string) {
    const user = this.currentUser;
    if (!user) throw new Error('User not logged in');

    const { data, error } = await this.supabaseService.supabase
      .from('profiles')
      .update({ name: name.trim(), phone: phone.trim(), updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    this.userProfileSubject.next(data as UserProfile);
    return data;
  }
}
