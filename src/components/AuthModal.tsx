import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UserAuth } from '../types';
import {
  getSupabaseClient,
  saveUserSession,
} from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAuth;
  setUser: (u: UserAuth) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  setUser,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const client = getSupabaseClient();

    try {
      if (client) {
        if (mode === 'signup') {
          const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
            },
          });

          if (error) throw error;

          if (data.user) {
            // Upsert into Supabase public.profiles table so record appears in Supabase Table Editor
            try {
              await client.from('profiles').upsert({
                id: data.user.id,
                email: data.user.email || email,
                full_name: fullName || 'User',
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' });
            } catch (pErr) {
              console.warn('Profiles table sync notice:', pErr);
            }

            const newUser: UserAuth = {
              id: data.user.id,
              email: data.user.email || email,
              fullName: fullName || 'User',
              isGuest: false,
              authProvider: 'supabase',
            };
            saveUserSession(newUser);
            setUser(newUser);
            setMessage({
              type: 'success',
              text: 'Account created successfully! Session activated.',
            });
            setTimeout(() => onClose(), 1000);
          }
        } else {
          const { data, error } = await client.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            // Upsert into Supabase public.profiles table
            try {
              await client.from('profiles').upsert({
                id: data.user.id,
                email: data.user.email || email,
                full_name: data.user.user_metadata?.full_name || fullName || 'User',
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' });
            } catch (pErr) {
              console.warn('Profiles table sync notice:', pErr);
            }

            const newUser: UserAuth = {
              id: data.user.id,
              email: data.user.email || email,
              fullName: data.user.user_metadata?.full_name || fullName || 'User',
              isGuest: false,
              authProvider: 'supabase',
            };
            saveUserSession(newUser);
            setUser(newUser);
            setMessage({
              type: 'success',
              text: 'Signed in successfully!',
            });
            setTimeout(() => onClose(), 1000);
          }
        }
      } else {
        // Fallback session creation when Supabase client is operating locally
        const newUser: UserAuth = {
          id: `user-${Date.now()}`,
          email,
          fullName: mode === 'signup' ? fullName || 'User' : fullName || email.split('@')[0],
          isGuest: false,
          authProvider: 'local',
        };
        saveUserSession(newUser);
        setUser(newUser);
        setMessage({
          type: 'success',
          text: mode === 'signup' ? 'Account created successfully!' : 'Signed in successfully!',
        });
        setTimeout(() => onClose(), 800);
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Authentication failed. Please check credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden">
        {/* Sleek Header */}
        <div className="p-6 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
            <User className="w-5 h-5" />
          </div>

          <h3 className="text-xl font-bold tracking-tight">
            {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </h3>
          <p className="text-xs text-neutral-300 mt-1">
            {mode === 'signin'
              ? 'Sign in to access your expenses, return deadlines, and warranty ledger.'
              : 'Join Inflow to track purchases, return windows, and warranty coverage.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setMode('signin');
                setMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Feedback Message */}
          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2.5 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Mode Switch Helper */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setMessage(null);
              }}
              className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
            >
              {mode === 'signin'
                ? "Don't have an account? Sign up now"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
