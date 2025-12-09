'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function ExecutorInviteAcceptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link');
      return;
    }

    // Check if this is a callback from Google OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      // This is a callback from Google, wait for session to be established
      setTimeout(() => {
        handleAcceptInvitation();
      }, 1000);
    } else {
      // Check if already logged in
      handleAcceptInvitation();
    }
  }, [token]);

  const handleAcceptInvitation = async () => {
    try {
      // First, check if user needs to login with Google
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!session) {
        // Check if we have a code from OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          // Exchange code for session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw new Error('Failed to complete Google login');
          }
          
          // Retry after session is established
          setTimeout(() => handleAcceptInvitation(), 500);
          return;
        }

        // Redirect to Google login with callback to accept invitation
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/executor/invite/accept?token=${token}`,
          },
        });

        if (error) {
          throw new Error(error.message);
        }
        return;
      }

      // User is logged in, accept the invitation
      const response = await fetch('/api/executor/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, googleId: session.user.id, email: session.user.email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to accept invitation');
      }

      setStatus('success');
      setMessage('Invitation accepted successfully! Redirecting...');
      
      setTimeout(() => {
        router.push('/executor/accounts');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to accept invitation');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#FCFAF7] rounded-lg shadow-sm p-8 border border-gray-200 text-center">
          {status === 'loading' && (
            <>
              <Loader className="w-16 h-16 text-[#A5B99A] mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-semibold text-[#2C2A29] mb-2">
                Processing Invitation
              </h1>
              <p className="text-sm text-[#2C2A29] opacity-70">
                Please wait...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-[#2C2A29] mb-2">
                Invitation Accepted
              </h1>
              <p className="text-sm text-[#2C2A29] opacity-70">
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-[#2C2A29] mb-2">
                Error
              </h1>
              <p className="text-sm text-red-600 mb-4">
                {message}
              </p>
              <button
                onClick={() => router.push('/executor/login')}
                className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

