'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface SensoryEnvironmentData {
  lightingPreferences: string;
  soundPreferences: string;
  scentPreferences: string;
  clothingBlanketsComfort: string;
  itemsWantAround: string;
}

export default function SensoryEnvironmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<SensoryEnvironmentData>({
    lightingPreferences: '',
    soundPreferences: '',
    scentPreferences: '',
    clothingBlanketsComfort: '',
    itemsWantAround: '',
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
          lightingPreferences: data.directives.lightingPreferences || '',
          soundPreferences: data.directives.soundPreferences || '',
          scentPreferences: data.directives.scentPreferences || '',
          clothingBlanketsComfort: data.directives.clothingBlanketsComfort || '',
          itemsWantAround: data.directives.itemsWantAround || '',
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
                Sensory Environment Preferences
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Lighting, sound, scents, and comfort items
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Lighting Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="lightingPreferences" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  What kind of lighting do you prefer? (e.g., dim, natural light, candles, soft lamps, etc.)
                </label>
                <textarea
                  id="lightingPreferences"
                  name="lightingPreferences"
                  value={formData.lightingPreferences}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Describe your lighting preferences..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Sound Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="soundPreferences" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  What sounds do you prefer? (e.g., silence, music, nature sounds, specific songs, etc.)
                </label>
                <textarea
                  id="soundPreferences"
                  name="soundPreferences"
                  value={formData.soundPreferences}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Describe your sound preferences..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Scent Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="scentPreferences" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  What scents do you prefer or want to avoid? (e.g., lavender, vanilla, no strong scents, etc.)
                </label>
                <textarea
                  id="scentPreferences"
                  name="scentPreferences"
                  value={formData.scentPreferences}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Describe your scent preferences..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Clothing & Blankets
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="clothingBlanketsComfort" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  What clothing or blankets bring you comfort?
                </label>
                <textarea
                  id="clothingBlanketsComfort"
                  name="clothingBlanketsComfort"
                  value={formData.clothingBlanketsComfort}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Describe preferred clothing, blankets, or comfort items..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Items You Want Around
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="itemsWantAround" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  What items would you like to have around you? (e.g., Bible, photos, favorite books, mementos, etc.)
                </label>
                <textarea
                  id="itemsWantAround"
                  name="itemsWantAround"
                  value={formData.itemsWantAround}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="List items you'd like nearby..."
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




