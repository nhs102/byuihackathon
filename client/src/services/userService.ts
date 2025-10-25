import { supabase } from './supabaseClient';

export interface User {
  id: string;
  email: string;
  name: string;
}

export async function loginUser(email: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Invalid email' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, user: data };
  } catch (error) {
    return { success: false, error: 'An error occurred during login' };
  }
}

export async function registerUser(email: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, name }])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data };
  } catch (error) {
    return { success: false, error: 'An error occurred during registration' };
  }
}

