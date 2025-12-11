'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface EmergencyInstructionsData {
  whoToCallFirst: string;
  whenNotToCall911: string;
  hospiceInstructions: string;
  underNoCircumstances: string;
  importantDocumentsLocation: string;
}

export default function EmergencyInstructionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<EmergencyInstructionsData>({
    whoToCallFirst: '',
    whenNotToCall911: '',
    hospiceInstructions: '',
    underNoCircumstances: '',
    importantDocumentsLocation: '',
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
          whoToCallFirst: data.directives.whoToCallFirst || '',
          whenNotToCall911: data.directives.whenNotToCall911 || '',
          hospiceInstructions: data.directives.hospiceInstructions || '',
          underNoCircumstances: data.directives.underNoCircumstances || '',
          importantDocumentsLocation: data.directives.importantDocumentsLocation || '',
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
                Emergency Instructions
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Who to call, when not to call 911, and important locations
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Who to Call First
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="whoToCallFirst" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Who should be called first in an emergency? (Name, relationship, phone number)
                </label>
                <textarea
                  id="whoToCallFirst"
                  name="whoToCallFirst"
                  value={formData.whoToCallFirst}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="List primary contacts..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              When NOT to Call 911
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="whenNotToCall911" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Under what circumstances should 911 NOT be called? (e.g., expected passing, DNR in place, etc.)
                </label>
                <textarea
                  id="whenNotToCall911"
                  name="whenNotToCall911"
                  value={formData.whenNotToCall911}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Describe when NOT to call emergency services..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Hospice Instructions
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="hospiceInstructions" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Any specific instructions for hospice care or hospice team contact information
                </label>
                <textarea
                  id="hospiceInstructions"
                  name="hospiceInstructions"
                  value={formData.hospiceInstructions}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Hospice organization name, phone, contact person, instructions..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Under No Circumstances
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="underNoCircumstances" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Under no circumstances should the following happen: (e.g., specific treatments, procedures, etc.)
                </label>
                <textarea
                  id="underNoCircumstances"
                  name="underNoCircumstances"
                  value={formData.underNoCircumstances}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="List things that should never happen..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Important Documents Location
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="importantDocumentsLocation" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Where are important documents located? (e.g., will, DNR, advance directive, insurance papers, etc.)
                </label>
                <textarea
                  id="importantDocumentsLocation"
                  name="importantDocumentsLocation"
                  value={formData.importantDocumentsLocation}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Describe where documents are stored..."
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

