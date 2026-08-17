import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // If not found yet, maybe the trigger is running. Let's retry once.
        setTimeout(async () => {
          const { data: retryData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          if (retryData) setProfile(retryData);
        }, 1500);
        throw error;
      }
      setProfile(data);
    } catch (err) {
      console.warn('Profile fetch warning (new profiles may lag behind auth):', err.message);
    }
  };

  useEffect(() => {
    // Fetch active session on mount
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error checking initial session:', err.message);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen to changes in auth state (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, name, phone) => {
    // Send standard signup credentials + metadata mapping to profiles
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone
        }
      }
    });
    
    if (error) {
      // If error is DB trigger related ("Database error finding user" / missing public.profiles table),
      // format a clean readable error or suggestion
      if (error.message && error.message.toLowerCase().includes('database error')) {
        throw new Error('Database schema initialization required. Please run the migration script in Supabase SQL Editor.');
      }
      throw error;
    }

    // Safely attempt to create profile manually in case trigger is disabled or missing
    if (data?.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email,
          full_name: name || 'Valued Customer',
          name: name || 'Valued Customer',
          phone: phone || '',
          role: 'customer',
          updated_at: new Date()
        }, { onConflict: 'id' });
      } catch (profileErr) {
        console.warn('Manual profile upsert notice:', profileErr.message);
      }
    }

    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('Unauthorized profile modification request.');
    
    // RLS policy permits updates to their own record
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    setProfile(data);
    return data;
  };

  const sendPasswordResetEmail = async (email) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    console.log('[DEBUG AuthContext] current window.location.origin:', window.location.origin);
    console.log('[DEBUG AuthContext] reset redirect URL:', redirectUrl);

    const res = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl
    });

    console.log('[DEBUG AuthContext] resetPasswordForEmail result:', res);

    if (res.error) {
      console.error('[DEBUG AuthContext] error.message:', res.error.message);
      console.error('[DEBUG AuthContext] error.code:', res.error.code);
      console.error('[DEBUG AuthContext] error.status:', res.error.status);
      throw res.error;
    }
    return res.data;
  };

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin' || profile?.role === 'superadmin',
    isSuperAdmin: profile?.role === 'superadmin',
    signUp,
    signIn,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    updatePassword,
    refreshProfile: () => user && fetchProfile(user.id)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
