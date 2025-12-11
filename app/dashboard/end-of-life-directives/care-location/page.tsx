'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface CareLocationData {
  preferredPlaceToPass: string;
  secondaryOption: string;
  notesForFamily: string;
  environmentPreferences: string;
}

export default function CareLocationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<CareLocationData>({
    preferredPlaceToPass: '',
    secondaryOption: '',
    notesForFamily: '',
    environmentPreferences: '',
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
          preferredPlaceToPass: data.directives.preferredPlaceToPass || '',
          secondaryOption: data.directives.secondaryOption || '',
          notesForFamily: data.directives.notesForFamily || '',
          environmentPreferences: data.directives.environmentPreferences || '',
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
          // Include all other fields as empty to preserve them
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
                Care Location
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Where you want to pass and your environment preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Preferred Place to Pass
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="preferredPlaceToPass" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Where would you prefer to pass away?
                </label>
                <select
                  id="preferredPlaceToPass"
                  name="preferredPlaceToPass"
                  value={formData.preferredPlaceToPass}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  <option value="home">Home</option>
                  <option value="hospital">Hospital</option>
                  <option value="hospice_facility">Hospice Facility</option>
                </select>
              </div>

              <div>
                <label htmlFor="secondaryOption" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Secondary Option (if preferred location is not available)
                </label>
                <select
                  id="secondaryOption"
                  name="secondaryOption"
                  value={formData.secondaryOption}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  <option value="home">Home</option>
                  <option value="hospital">Hospital</option>
                  <option value="hospice_facility">Hospice Facility</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Environment Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="environmentPreferences" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  What kind of environment would you prefer? (e.g., natural light, candles, no TV, quiet, etc.)
                </label>
                <textarea
                  id="environmentPreferences"
                  name="environmentPreferences"
                  value={formData.environmentPreferences}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Describe your preferred environment..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Notes for Family
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="notesForFamily" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Any additional notes or instructions for your family regarding your care location preferences
                </label>
                <textarea
                  id="notesForFamily"
                  name="notesForFamily"
                  value={formData.notesForFamily}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Share any thoughts or concerns about your care location..."
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

