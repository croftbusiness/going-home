'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

function ViewerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      handleLogin(tokenParam);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async (tokenValue?: string) => {
    const tokenToUse = tokenValue || token;
    if (!tokenToUse) {
      setError('Please enter a token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/viewer/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToUse }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid token');
      }

      // Store viewer session in localStorage (MVP approach)
      // In production, use secure httpOnly cookies
      localStorage.setItem('viewer_session', JSON.stringify({
        contact: data.contact,
        permissions: data.permissions,
        tokenId: data.tokenId,
      }));

      setSuccess(true);
      
      // Redirect to viewer dashboard
      setTimeout(() => {
        router.push('/viewer/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to verify token');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] px-4">
      <div className="max-w-md w-full space-y-8 bg-[#FCFAF7] p-8 rounded-lg shadow-sm">
        <div className="flex flex-col items-center">
          <Link href="/" className="mb-6">
            <div className="relative h-12 w-auto">
              <Image
                src="/logo.svg"
                alt="StillReady Logo"
                width={200}
                height={50}
                className="object-contain h-12 w-auto"
                priority
              />
            </div>
          </Link>
          <h1 className="text-3xl font-semibold text-[#2C2A29] text-center">
            Trusted Viewer Login
          </h1>
          <p className="mt-2 text-center text-[#2C2A29] opacity-70">
            Enter your invitation token to access shared information
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Token verified! Redirecting to dashboard...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="token" className="block text-sm font-medium text-[#2C2A29] mb-2">
                Invitation Token *
              </label>
              <input
                id="token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                placeholder="Enter your invitation token"
                disabled={loading}
              />
              <p className="mt-2 text-xs text-[#2C2A29] opacity-60">
                Check your email for the invitation link, or enter the token from the URL
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !token.trim()}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#A5B99A] hover:bg-[#95A98A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A5B99A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Access Information</span>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-[#2C2A29] opacity-70">
            Need help? Contact the person who invited you.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ViewerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#A5B99A]" />
      </div>
    }>
      <ViewerLoginContent />
    </Suspense>
  );
}

