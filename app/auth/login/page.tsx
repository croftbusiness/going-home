'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Check onboarding status before redirecting
      try {
        const onboardingRes = await fetch('/api/user/onboarding/complete');
        if (onboardingRes.ok) {
          const onboardingData = await onboardingRes.json();
          if (!onboardingData.onboardingComplete) {
            router.push('/onboarding');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Continue to dashboard if check fails
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] px-4">
      <div className="max-w-md w-full space-y-8 bg-[#FCFAF7] p-8 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold text-[#2C2A29] text-center">
            Welcome Back
          </h1>
          <p className="mt-2 text-center text-[#2C2A29] opacity-70">
            Sign in to access your Going Home account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2C2A29] mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2C2A29] mb-2">
                Password *
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#A5B99A] hover:bg-[#95A98A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A5B99A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#FCFAF7] text-[#2C2A29] opacity-70">Or continue with</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-semibold text-[#2C2A29] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A5B99A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {googleLoading ? (
                  'Connecting...'
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-[#2C2A29] opacity-70">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-[#93B0C8] hover:text-[#83A0B8] font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-[#2C2A29] opacity-70 mb-3">
              Are you an executor?
            </p>
            <Link
              href="/executor/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-[#A5B99A] rounded-md text-sm font-medium text-[#A5B99A] hover:bg-[#A5B99A] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A5B99A] transition-colors"
            >
              <Lock className="w-4 h-4" />
              Executor Login
            </Link>
            <p className="text-xs text-[#2C2A29] opacity-60 mt-2">
              Use the access code provided to you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
