'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Heart } from 'lucide-react';
import Link from 'next/link';

interface LifeSustainingData {
  cprPreference: string;
  ventilatorPreference: string;
  feedingTubePreference: string;
  ivHydrationPreference: string;
  antibioticsPreference: string;
  conditionalDecisions: string;
  notesForDoctors: string;
}

export default function LifeSustainingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<LifeSustainingData>({
    cprPreference: '',
    ventilatorPreference: '',
    feedingTubePreference: '',
    ivHydrationPreference: '',
    antibioticsPreference: '',
    conditionalDecisions: '',
    notesForDoctors: '',
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
          cprPreference: data.directives.cprPreference || '',
          ventilatorPreference: data.directives.ventilatorPreference || '',
          feedingTubePreference: data.directives.feedingTubePreference || '',
          ivHydrationPreference: data.directives.ivHydrationPreference || '',
          antibioticsPreference: data.directives.antibioticsPreference || '',
          conditionalDecisions: data.directives.conditionalDecisions || '',
          notesForDoctors: data.directives.notesForDoctors || '',
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

  const treatmentOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'conditional', label: 'Only if recovery is likely' },
  ];

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
                Life-Sustaining Treatment Decisions
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Your decisions about CPR, ventilator, and other treatments
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
                Life-sustaining treatment decisions are among the most difficult choices your family will face. 
                By documenting your preferences for CPR, ventilators, feeding tubes, and other treatments now, 
                you're removing an enormous burden from their shoulders. They won't have to make these 
                heart-wrenching decisions in moments of crisis or wonder if they're honoring your wishes. 
                Your clear directives give them confidence and peace, knowing they're following your exact 
                preferences and allowing them to focus on being present with you rather than struggling with 
                medical decisions.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Treatment Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="cprPreference" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  CPR (Cardiopulmonary Resuscitation)
                </label>
                <select
                  id="cprPreference"
                  name="cprPreference"
                  value={formData.cprPreference}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  {treatmentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ventilatorPreference" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Ventilator (Mechanical Breathing)
                </label>
                <select
                  id="ventilatorPreference"
                  name="ventilatorPreference"
                  value={formData.ventilatorPreference}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  {treatmentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="feedingTubePreference" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Feeding Tube
                </label>
                <select
                  id="feedingTubePreference"
                  name="feedingTubePreference"
                  value={formData.feedingTubePreference}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  {treatmentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ivHydrationPreference" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  IV Hydration (Fluids)
                </label>
                <select
                  id="ivHydrationPreference"
                  name="ivHydrationPreference"
                  value={formData.ivHydrationPreference}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  {treatmentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="antibioticsPreference" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Antibiotics
                </label>
                <select
                  id="antibioticsPreference"
                  name="antibioticsPreference"
                  value={formData.antibioticsPreference}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  {treatmentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Conditional Decisions
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="conditionalDecisions" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Any conditional decisions? (e.g., "only if recovery is likely", "only for a limited time")
                </label>
                <textarea
                  id="conditionalDecisions"
                  name="conditionalDecisions"
                  value={formData.conditionalDecisions}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Describe any conditional decisions..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              Notes for Doctors
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="notesForDoctors" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Any additional notes or instructions for your medical team
                </label>
                <textarea
                  id="notesForDoctors"
                  name="notesForDoctors"
                  value={formData.notesForDoctors}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Share any additional thoughts or concerns..."
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

