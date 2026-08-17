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
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Could not fetch user profile:', error.message);
        return null;
      }

      this.userProfileSubject.next(data as UserProfile);
      return data as UserProfile;
    } catch (err) {
      console.error('Error loading profile:', err);
      return null;
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get userProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  get isAdmin(): boolean {
    const role = this.userProfileSubject.value?.role;
    return role === 'admin' || role === 'superadmin';
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (data.user) {
      await this.loadUserProfile(data.user.id);
    }
    return data;
  }

  async register(name: string, email: string, password: string, phone: string = '') {
    const { data, error } = await this.supabaseService.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone
        }
      }
    });
    if (error) throw error;
    return data;
  }

  async logout() {
    const { error } = await this.supabaseService.supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
    this.currentUserSubject.next(null);
    this.userProfileSubject.next(null);
  }

  async resetPassword(email: string) {
    const { data, error } = await this.supabaseService.supabase.auth.resetPasswordForEmail(email, {
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
      .update({ name, phone, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    this.userProfileSubject.next(data as UserProfile);
    return data;
  }
}
