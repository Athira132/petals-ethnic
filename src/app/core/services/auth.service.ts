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
    const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      console.error('Supabase signInWithPassword error:', error);
      throw error;
    }

    if (data.user) {
      this.currentUserSubject.next(data.user);
      // Asynchronously fetch profile without delaying immediate authentication response
      this.loadUserProfile(data.user.id).catch(err => console.warn('Background profile load note:', err));
    }
    return data;
  }

  async register(name: string, email: string, password: string, phone: string = '') {
    const { data, error } = await this.supabaseService.supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          phone: phone.trim()
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      // Asynchronously create profile record without delaying registration completion
      this.supabaseService.supabase.from('profiles').insert([{
        id: data.user.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: 'customer',
        created_at: new Date().toISOString()
      }]).then(() => {}, (err: any) => console.warn('Profile creation note during registration:', err));
    }

    return data;
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
