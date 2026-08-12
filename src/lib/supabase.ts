import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig, UserAuth } from '../types';

const LOCAL_STORAGE_SUPABASE_KEY = 'inflow_supabase_config';
const LOCAL_STORAGE_USER_KEY = 'inflow_user_session';

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_SUPABASE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to read Supabase config from storage:', e);
  }

  // Fallback to VITE env vars or configured project default
  const metaEnv = (import.meta as any).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL || 'https://fbvtaewofuihlhyyjhzn.supabase.co';
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidnRhZXdvZnVpaGxoeXlqaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MTI1NDMsImV4cCI6MjEwMTk4ODU0M30.6wzjOlF9ghJ7AhgiXIeZnWbrtG-k9YmFSlEBLr4TAr0';

  return {
    url: envUrl,
    anonKey: envKey,
    isConnected: Boolean(envUrl && envKey),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): SupabaseConfig {
  const config: SupabaseConfig = {
    url: url.trim(),
    anonKey: anonKey.trim(),
    isConnected: Boolean(url.trim() && anonKey.trim()),
  };
  try {
    localStorage.setItem(LOCAL_STORAGE_SUPABASE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Supabase config:', e);
  }
  return config;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

// User Auth Persistence Helpers
export function getStoredUserSession(): UserAuth {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load user session:', e);
  }

  // Default Guest user for private local-first mode
  return {
    id: 'guest-local-user',
    email: 'private.user@inflow.local',
    fullName: 'Private Local User',
    isGuest: true,
    authProvider: 'local',
  };
}

export function saveUserSession(user: UserAuth): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user session:', e);
  }
}

export function clearUserSession(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  } catch (e) {
    console.error('Failed to clear user session:', e);
  }
}
