'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface OrganDonationData {
  donorStatus: string;
  organsTissuesConsent: string;
  religiousPhilosophicalNotes: string;
  organDonationOrgContact: string;
}

export default function OrganDonationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<OrganDonationData>({
    donorStatus: '',
    organsTissuesConsent: '',
    religiousPhilosophicalNotes: '',
    organDonationOrgContact: '',
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
          donorStatus: data.directives.donorStatus || '',
          organsTissuesConsent: data.directives.organsTissuesConsent || '',
          religiousPhilosophicalNotes: data.directives.religiousPhilosophicalNotes || '',
          organDonationOrgContact: data.directives.organDonationOrgContact || '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
                Organ Donation Wishes
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Your organ donation preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Donor Status
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="donorStatus" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Do you wish to be an organ donor?
                </label>
                <select
                  id="donorStatus"
                  name="donorStatus"
                  value={formData.donorStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes - Full donation</option>
                  <option value="partial">Yes - Partial donation (specific organs/tissues)</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Organs & Tissues Consent
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="organsTissuesConsent" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  What organs/tissues do you consent to donate? (if partial donation)
                </label>
                <textarea
                  id="organsTissuesConsent"
                  name="organsTissuesConsent"
                  value={formData.organsTissuesConsent}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="List specific organs or tissues (e.g., heart, kidneys, corneas, skin, etc.)"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Religious or Philosophical Notes
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="religiousPhilosophicalNotes" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Any religious or philosophical considerations regarding organ donation?
                </label>
                <textarea
                  id="religiousPhilosophicalNotes"
                  name="religiousPhilosophicalNotes"
                  value={formData.religiousPhilosophicalNotes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Share any religious or philosophical thoughts..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Organ Donation Organization Contact
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="organDonationOrgContact" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Contact details for your preferred organ donation organization
                </label>
                <textarea
                  id="organDonationOrgContact"
                  name="organDonationOrgContact"
                  value={formData.organDonationOrgContact}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Organization name, phone number, website, etc."
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





