'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import FuneralPreferenceGenerator from '@/components/ai/FuneralPreferenceGenerator';

interface FuneralPreferences {
  burialOrCremation: 'burial' | 'cremation' | '';
  funeralHome: string;
  serviceType: string;
  atmosphereWishes: string;
  song1: string;
  song2: string;
  song3: string;
  photoPreferenceUrl: string;
  preferredClothing: string;
}

export default function FuneralPreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [formData, setFormData] = useState<FuneralPreferences>({
    burialOrCremation: '',
    funeralHome: '',
    serviceType: '',
    atmosphereWishes: '',
    song1: '',
    song2: '',
    song3: '',
    photoPreferenceUrl: '',
    preferredClothing: '',
  });

  useEffect(() => {
    loadFuneralPreferences();
  }, []);

  const loadFuneralPreferences = async () => {
    try {
      const response = await fetch('/api/user/funeral-preferences');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load data');
      }

      const data = await response.json();
      if (data.funeralPreferences) {
        setFormData(data.funeralPreferences);
      }
    } catch (error) {
      setError('Failed to load funeral preferences');
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
      const response = await fetch('/api/user/funeral-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save data');

      setSuccess(true);
      // Redirect to dashboard after showing success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      setError('Failed to save funeral preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      // If there's an existing photo, delete it first
      if (formData.photoPreferenceUrl) {
        await handlePhotoDelete();
      }

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      const response = await fetch('/api/user/upload-photo', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, photoPreferenceUrl: data.url }));
      setError(''); // Clear any previous errors
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to upload photo';
      setError(errorMessage);
      console.error('Photo upload error:', error);
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handlePhotoDelete = async () => {
    if (!formData.photoPreferenceUrl) return;

    if (!confirm('Are you sure you want to delete this photo?')) return;

    setDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/user/upload-photo?url=${encodeURIComponent(formData.photoPreferenceUrl)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      setFormData(prev => ({ ...prev, photoPreferenceUrl: '' }));
      setError('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete photo';
      setError(errorMessage);
      console.error('Photo delete error:', error);
    } finally {
      setDeleting(false);
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-[#2C2A29]">Funeral Preferences</h1>
              <p className="text-sm text-[#2C2A29] opacity-70 mt-1">
                Your wishes for services and ceremonies
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAIGenerator(!showAIGenerator)}
            className="px-4 py-2 bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Generate Preferences</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAIGenerator && (
          <div className="mb-6">
            <FuneralPreferenceGenerator
              onApply={(preferences) => {
                setFormData({
                  ...formData,
                  song1: preferences.recommendedSongs[0] || formData.song1,
                  song2: preferences.recommendedSongs[1] || formData.song2,
                  song3: preferences.recommendedSongs[2] || formData.song3,
                  atmosphereWishes: preferences.atmosphereDescription || formData.atmosphereWishes,
                });
                setShowAIGenerator(false);
              }}
            />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Preferences */}
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">Basic Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                  Burial or Cremation *
                </label>
                <select
                  name="burialOrCremation"
                  value={formData.burialOrCremation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  <option value="">Select preference</option>
                  <option value="burial">Burial</option>
                  <option value="cremation">Cremation</option>
                </select>
              </div>
              <div>
                <label htmlFor="funeralHome" className="block text-sm font-medium text-[#2C2A29] mb-1">
                  Preferred Funeral Home
                </label>
                <input
                  type="text"
                  id="funeralHome"
                  name="funeralHome"
                  value={formData.funeralHome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-[#2C2A29] mb-1">
                  Service Type (e.g., religious, non-religious)
                </label>
                <input
                  type="text"
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Atmosphere & Wishes */}
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">Atmosphere & Tone</h2>
            <div>
              <label htmlFor="atmosphereWishes" className="block text-sm font-medium text-[#2C2A29] mb-1">
                Your wishes for the atmosphere and tone
              </label>
              <textarea
                id="atmosphereWishes"
                name="atmosphereWishes"
                value={formData.atmosphereWishes}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the feeling you'd like the service to have..."
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              />
            </div>
          </div>

          {/* Songs */}
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">Song Choices</h2>
            <p className="text-sm text-[#2C2A29] opacity-70 mb-4">
              Choose up to 3 songs you'd like played
            </p>
            <div className="space-y-4">
              {[1, 2, 3].map((num) => (
                <div key={num}>
                  <label htmlFor={`song${num}`} className="block text-sm font-medium text-[#2C2A29] mb-1">
                    Song {num}
                  </label>
                  <input
                    type="text"
                    id={`song${num}`}
                    name={`song${num}`}
                    value={formData[`song${num}` as keyof FuneralPreferences] as string}
                    onChange={handleChange}
                    placeholder="Song title and artist"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Photo & Clothing */}
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">Photo & Clothing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                  Photo for Obituary/Memorial
                </label>
                {formData.photoPreferenceUrl ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <div className="relative w-64 h-64 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 shadow-sm">
                        <img
                          src={formData.photoPreferenceUrl}
                          alt="Uploaded photo"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Handle broken image
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><span>Failed to load image</span></div>';
                            }
                          }}
                        />
                        {deleting && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                            <span className="text-white font-medium">Deleting...</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handlePhotoDelete}
                        disabled={deleting || uploading}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg z-20"
                        title="Delete photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photoUpload"
                      />
                      <label
                        htmlFor="photoUpload"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{uploading ? 'Uploading...' : 'Replace Photo'}</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photoUpload"
                    />
                    <label
                      htmlFor="photoUpload"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploading ? 'Uploading...' : 'Choose Photo'}</span>
                    </label>
                    <p className="text-xs text-[#2C2A29] opacity-60 mt-2">
                      Upload a photo for your obituary or memorial service
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="preferredClothing" className="block text-sm font-medium text-[#2C2A29] mb-1">
                  Preferred Clothing or Items
                </label>
                <textarea
                  id="preferredClothing"
                  name="preferredClothing"
                  value={formData.preferredClothing}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe what you'd like to wear or have with you..."
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          )}
          {success && (
            <div className="bg-[#EBD9B5] text-[#2C2A29] px-4 py-3 rounded-lg">
              Funeral preferences saved successfully
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-2 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 flex items-center space-x-2"
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
