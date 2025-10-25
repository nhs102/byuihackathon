import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';
import { post } from './apiService';

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Custom authentication types
export interface CustomUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  data?: CustomUser;
  message?: string;
  error?: string;
}

/**
 * Sign up a new user with email and password
 */
export const signUp = async (data: SignUpData) => {
  const { email, password, fullName } = data;

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return authData;
};

/**
 * Sign in with email and password
 */
export const signIn = async (data: SignInData) => {
  const { email, password } = data;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return authData;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get the current user session
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

/**
 * Reset password for email
 */
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
};

// ===== Custom Authentication Functions =====

/**
 * Sign up a new user with email and name
 */
export const customSignUp = async (email: string, name: string): Promise<CustomUser> => {
  try {
    const response = await post<AuthResponse>('/taein/signup', { email, name });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Sign up failed');
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Sign up failed');
  }
};

/**
 * Sign in a user with email
 */
export const customSignIn = async (email: string): Promise<CustomUser> => {
  try {
    const response = await post<AuthResponse>('/taein/signin', { email });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Sign in failed');
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Sign in failed');
  }
};

