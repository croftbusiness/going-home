'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';

function ExecutorAccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountUserId = searchParams.get('account');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    if (!accountUserId) {
      router.push('/executor/accounts');
      return;
    }
    // Load account name
    loadAccountInfo();
  }, [accountUserId]);

  const loadAccountInfo = async () => {
    try {
      const response = await fetch(`/api/executor/account-info?userId=${accountUserId}`);
      if (response.ok) {
        const data = await response.json();
        setAccountName(data.accountOwnerName || 'this account');
      }
    } catch (err) {
      // Ignore errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/executor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode, accountUserId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid access code');
      }

      const data = await response.json();
      // Store executor session token
      localStorage.setItem('executor_token', data.token);
      localStorage.setItem('executor_user_id', data.userId);
      
      // Redirect to executor dashboard
      router.push('/executor/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to verify access code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#FCFAF7] rounded-lg shadow-sm p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#A5B99A] rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-[#2C2A29] mb-2">
              Executor Access
            </h1>
            <p className="text-sm text-[#2C2A29] opacity-70">
              {accountName ? `Enter the access code to view ${accountName}'s information` : 'Enter the access code provided to you to view the account information'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-[#2C2A29] mb-2">
                Access Code
              </label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter 6-digit access code"
                required
                maxLength={6}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-center text-2xl tracking-widest"
                autoFocus
              />
              <p className="text-xs text-[#2C2A29] opacity-60 mt-2 text-center">
                Enter the 6-digit code you received
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || accessCode.length !== 6}
              className="w-full px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Verifying...' : 'Access Account'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-[#2C2A29] opacity-60 text-center">
              This access is granted by the account holder. You will only see information you have permission to view.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExecutorAccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-[#2C2A29]">Loading...</div>
      </div>
    }>
      <ExecutorAccessContent />
    </Suspense>
  );
}

