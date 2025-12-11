'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface VisitorsData {
  whoWantPresent: string;
  whoNotWantPresent: string;
  maxVisitors: number | null;
  visitorHours: string;
  privacyQuietPreferences: string;
}

export default function VisitorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<VisitorsData>({
    whoWantPresent: '',
    whoNotWantPresent: '',
    maxVisitors: null,
    visitorHours: '',
    privacyQuietPreferences: '',
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
          whoWantPresent: data.directives.whoWantPresent || '',
          whoNotWantPresent: data.directives.whoNotWantPresent || '',
          maxVisitors: data.directives.maxVisitors || null,
          visitorHours: data.directives.visitorHours || '',
          privacyQuietPreferences: data.directives.privacyQuietPreferences || '',
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
    setFormData(prev => ({ ...prev, [name]: name === 'maxVisitors' ? (value ? parseInt(value) : null) : value }));
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
                Visitors & Personal Presence
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Who should be present and your visitor preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Why This Helps Loved Ones */}
        <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl flex-shrink-0">
              <Heart className="w-6 h-6 text-[#A5B99A]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#2C2A29] mb-2">
                Why This Helps Your Loved Ones
              </h3>
              <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed">
                Managing visitors during your final days can be emotionally complex for your family. By 
                documenting who you want present, visitor limits, and privacy preferences now, you're giving 
                them clear guidance and permission to protect your peace. They won't have to guess who you'd 
                want to see or worry about managing difficult conversations with people who want to visit. 
                Your preferences help them create the right environment for you while protecting their own 
                emotional energy during this precious time together.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Who You Want Present
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="whoWantPresent" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Who would you like to have present during your final days?
                </label>
                <textarea
                  id="whoWantPresent"
                  name="whoWantPresent"
                  value={formData.whoWantPresent}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="List names and relationships..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Who You Do Not Want Present
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="whoNotWantPresent" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Are there people you do not want present? (Optional)
                </label>
                <textarea
                  id="whoNotWantPresent"
                  name="whoNotWantPresent"
                  value={formData.whoNotWantPresent}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="List names if applicable..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Visitor Guidelines
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="maxVisitors" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Maximum number of visitors at one time
                </label>
                <input
                  type="number"
                  id="maxVisitors"
                  name="maxVisitors"
                  value={formData.maxVisitors || ''}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="e.g., 3"
                />
              </div>

              <div>
                <label htmlFor="visitorHours" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Hours when visitors are welcome
                </label>
                <input
                  type="text"
                  id="visitorHours"
                  name="visitorHours"
                  value={formData.visitorHours}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="e.g., 10am - 8pm, or anytime"
                />
              </div>

              <div>
                <label htmlFor="privacyQuietPreferences" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Preferences for privacy or quiet time
                </label>
                <textarea
                  id="privacyQuietPreferences"
                  name="privacyQuietPreferences"
                  value={formData.privacyQuietPreferences}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Describe your preferences for privacy and quiet time..."
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

