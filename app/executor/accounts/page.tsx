'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Lock, ArrowRight } from 'lucide-react';

interface ExecutorAccount {
  id: string;
  accountUserId: string;
  executorContactId: string;
  accountOwnerName: string;
  status: string;
}

export default function ExecutorAccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<ExecutorAccount[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/executor/accounts');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/executor/login');
          return;
        }
        throw new Error('Failed to load accounts');
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (accountUserId: string) => {
    router.push(`/executor/access?account=${accountUserId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-[#2C2A29]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <header className="bg-[#FCFAF7] border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#A5B99A] rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#2C2A29]">Your Executor Accounts</h1>
              <p className="text-sm text-[#2C2A29] opacity-70">Select an account to access</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {accounts.length === 0 ? (
          <div className="bg-[#FCFAF7] rounded-lg p-12 text-center">
            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Executor Accounts</h3>
            <p className="text-[#2C2A29] opacity-70 mb-4">
              You don't have access to any accounts yet.
            </p>
            <p className="text-sm text-[#2C2A29] opacity-60">
              You need to receive an invitation email and accept it to become an executor for an account.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                onClick={() => handleSelectAccount(account.accountUserId)}
                className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm border border-gray-200 hover:border-[#A5B99A] cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-lg">
                      <Users className="w-6 h-6 text-[#A5B99A]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-[#2C2A29]">
                        {account.accountOwnerName}
                      </h3>
                      <p className="text-sm text-[#2C2A29] opacity-70">
                        {account.status === 'pending' ? 'Invitation pending acceptance' : 'Click to access with code'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#2C2A29] opacity-50" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

