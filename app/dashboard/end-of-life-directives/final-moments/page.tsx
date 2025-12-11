'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface FinalMomentsData {
  whatLovedOnesShouldKnow: string;
  lastRightsRitualsTraditions: string;
  touchHoldingHandsPreference: string;
  whatToSayReadAloud: string;
  finalMessageForFamily: string;
}

export default function FinalMomentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FinalMomentsData>({
    whatLovedOnesShouldKnow: '',
    lastRightsRitualsTraditions: '',
    touchHoldingHandsPreference: '',
    whatToSayReadAloud: '',
    finalMessageForFamily: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/user/end-of-life-directives');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load data');
      }

      const data = await response.json();
      if (data.directives) {
        setFormData({
          whatLovedOnesShouldKnow: data.directives.whatLovedOnesShouldKnow || '',
          lastRightsRitualsTraditions: data.directives.lastRightsRitualsTraditions || '',
          touchHoldingHandsPreference: data.directives.touchHoldingHandsPreference || '',
          whatToSayReadAloud: data.directives.whatToSayReadAloud || '',
          finalMessageForFamily: data.directives.finalMessageForFamily || '',
        });
      }
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/user/end-of-life-directives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/end-of-life-directives');
      }, 1500);
    } catch (error) {
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            <Link
              href="/dashboard/end-of-life-directives"
              className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">
                Final Moments Wishes
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                What you want loved ones to know and final messages
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              What Loved Ones Should Know
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="whatLovedOnesShouldKnow" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  What do you want your loved ones to know during your final moments?
                </label>
                <textarea
                  id="whatLovedOnesShouldKnow"
                  name="whatLovedOnesShouldKnow"
                  value={formData.whatLovedOnesShouldKnow}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Share what you want them to know..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Last Rights, Rituals, or Traditions
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="lastRightsRitualsTraditions" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Are there any last rights, rituals, or traditions you want performed?
                </label>
                <textarea
                  id="lastRightsRitualsTraditions"
                  name="lastRightsRitualsTraditions"
                  value={formData.lastRightsRitualsTraditions}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Describe any rituals or traditions..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Touch & Physical Contact
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="touchHoldingHandsPreference" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Do you want touch/holding hands? Any preferences about physical contact?
                </label>
                <textarea
                  id="touchHoldingHandsPreference"
                  name="touchHoldingHandsPreference"
                  value={formData.touchHoldingHandsPreference}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Share your preferences about touch and physical contact..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              What to Say or Read Aloud
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="whatToSayReadAloud" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  What would you like said or read aloud during your final moments? (e.g., prayers, poems, letters, etc.)
                </label>
                <textarea
                  id="whatToSayReadAloud"
                  name="whatToSayReadAloud"
                  value={formData.whatToSayReadAloud}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Share what you'd like read or said..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Final Message for Family
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="finalMessageForFamily" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Your final message for your family
                </label>
                <textarea
                  id="finalMessageForFamily"
                  name="finalMessageForFamily"
                  value={formData.finalMessageForFamily}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Share your final thoughts and message..."
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-[#EBD9B5] text-[#2C2A29] px-4 py-3 rounded-lg">
              Preferences saved successfully
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard/end-of-life-directives"
              className="px-6 py-2 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

