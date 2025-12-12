'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Lock, Unlock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
}

interface ReleaseSettings {
  isLocked: boolean;
  executorContactId: string | null;
  releaseActivated: boolean;
}

export default function ReleaseSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [settings, setSettings] = useState<ReleaseSettings>({
    isLocked: false,
    executorContactId: null,
    releaseActivated: false,
  });
  const [unlockCode, setUnlockCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, contactsRes] = await Promise.all([
        fetch('/api/user/release-settings'),
        fetch('/api/user/trusted-contacts'),
      ]);

      if (!settingsRes.ok || !contactsRes.ok) {
        if (settingsRes.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load data');
      }

      const settingsData = await settingsRes.json();
      const contactsData = await contactsRes.json();

      setSettings(settingsData.releaseSettings || { isLocked: false, executorContactId: null, releaseActivated: false });
      setTrustedContacts(contactsData.trustedContacts || []);
    } catch (error) {
      setError('Failed to load release settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLockPlan = async () => {
    if (!settings.executorContactId) {
      setError('Please select an executor contact');
      return;
    }

    if (!unlockCode || unlockCode.length < 6) {
      setError('Please enter a 6-digit unlock code');
      return;
    }

    if (unlockCode !== confirmCode) {
      setError('Unlock codes do not match');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/user/release-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isLocked: true,
          executorContactId: settings.executorContactId,
          unlockCode,
        }),
      });

      if (!response.ok) throw new Error('Failed to lock plan');

      setSuccess(true);
      await loadData();
    } catch (error) {
      setError('Failed to lock plan');
    } finally {
      setSaving(false);
    }
  };

  const handleUnlock = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/user/release-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isLocked: false,
          executorContactId: settings.executorContactId,
        }),
      });

      if (!response.ok) throw new Error('Failed to unlock plan');

      setSuccess(true);
      await loadData();
    } catch (error) {
      setError('Failed to unlock plan');
    } finally {
      setSaving(false);
    }
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link href="/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 touch-target">
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">Access Rules</h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Configure how and when your information is shared
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 flex items-start space-x-2 text-sm sm:text-base">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="flex-1 min-w-0 break-words">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-[#EBD9B5] text-[#2C2A29] px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            Settings updated successfully
          </div>
        )}

        {trustedContacts.length === 0 && (
          <div className="bg-[#EBD9B5] px-4 py-3 rounded-lg mb-6">
            You need to add at least one trusted contact before locking your plan.{' '}
            <Link href="/dashboard/trusted-contacts" className="underline font-medium">
              Add contacts now
            </Link>
          </div>
        )}

        {/* Current Status */}
        <div className="bg-[#FCFAF7] rounded-lg p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
          <div className="flex items-start space-x-3 sm:space-x-4">
            {settings.isLocked ? (
              <>
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-[#A5B99A] flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-medium text-[#2C2A29]">Plan is Locked</h2>
                  <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                    Your information is secured and ready for release when needed
                  </p>
                </div>
              </>
            ) : (
              <>
                <Unlock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-medium text-[#2C2A29]">Plan is Unlocked</h2>
                  <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                    Complete your information and lock your plan when ready
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {!settings.isLocked ? (
          <>
            {/* Executor Contact Selection */}
            <div className="bg-[#FCFAF7] rounded-lg p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-medium text-[#2C2A29] mb-3 sm:mb-4">
                Select Executor Contact
              </h2>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-3 sm:mb-4">
                Choose the person who will be authorized to request release of your information
              </p>
              <select
                value={settings.executorContactId || ''}
                onChange={(e) => setSettings({ ...settings, executorContactId: e.target.value })}
                className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target cursor-pointer"
              >
                <option value="">Select a contact</option>
                {trustedContacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name} ({contact.relationship})
                  </option>
                ))}
              </select>
            </div>

            {/* Unlock Code Setup */}
            <div className="bg-[#FCFAF7] rounded-lg p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-medium text-[#2C2A29] mb-3 sm:mb-4">
                Create Unlock Code
              </h2>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-3 sm:mb-4">
                Create a 6-digit alphanumeric code that your executor will use to release your information.
                <strong className="block mt-2">Important:</strong> You must securely share this code offline with your executor contact.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="unlockCode" className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Unlock Code *
                  </label>
                  <input
                    type="text"
                    id="unlockCode"
                    value={unlockCode}
                    onChange={(e) => setUnlockCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="ABC123"
                    className="w-full px-4 py-3 text-base sm:text-lg bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent font-mono touch-target"
                  />
                </div>
                <div>
                  <label htmlFor="confirmCode" className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Confirm Unlock Code *
                  </label>
                  <input
                    type="text"
                    id="confirmCode"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="ABC123"
                    className="w-full px-4 py-3 text-base sm:text-lg bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent font-mono touch-target"
                  />
                </div>
              </div>
            </div>

            {/* Lock Button */}
            <div className="bg-[#FCFAF7] rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A] flex-shrink-0 mt-0.5 sm:mt-1" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-medium text-[#2C2A29] mb-2">
                    Ready to Lock Your Plan?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-4">
                    Once locked, your information will be secured until your executor confirms your passing
                    and provides the unlock code. You can unlock at any time to make updates.
                  </p>
                  <button
                    onClick={handleLockPlan}
                    disabled={saving || !settings.executorContactId || trustedContacts.length === 0}
                    className="w-full sm:w-auto px-6 py-3 min-h-[48px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 touch-target"
                  >
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{saving ? 'Locking...' : 'Securely Lock My Plan'}</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Locked State */}
            <div className="bg-[#FCFAF7] rounded-lg p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-medium text-[#2C2A29] mb-3 sm:mb-4">
                Plan Details
              </h2>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-[#2C2A29] opacity-70">Status:</span>
                  <span className="text-xs sm:text-sm text-[#2C2A29] font-medium">Locked & Secured</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-[#2C2A29] opacity-70">Executor Contact:</span>
                  <span className="text-xs sm:text-sm text-[#2C2A29] font-medium break-words text-right sm:text-left">
                    {trustedContacts.find(c => c.id === settings.executorContactId)?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-2 gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-[#2C2A29] opacity-70">Release Activated:</span>
                  <span className="text-xs sm:text-sm text-[#2C2A29] font-medium">
                    {settings.releaseActivated ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Unlock Option */}
            <div className="bg-[#FCFAF7] rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <Unlock className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8] flex-shrink-0 mt-0.5 sm:mt-1" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-medium text-[#2C2A29] mb-2">
                    Need to Make Changes?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-4">
                    You can temporarily unlock your plan to update your information. Remember to lock it again when finished.
                  </p>
                  <button
                    onClick={handleUnlock}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-3 min-h-[48px] text-base bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 touch-target"
                  >
                    <Unlock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{saving ? 'Unlocking...' : 'Unlock Plan for Editing'}</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
