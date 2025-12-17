'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Save } from 'lucide-react';

interface Routines {
  id?: string;
  morningRoutine?: string;
  eveningRoutine?: string;
  favoriteFoods?: string;
  quirks?: string;
  specialHabits?: string;
  thingsToRemember?: string;
}

export default function RoutinesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Routines>({
    morningRoutine: '',
    eveningRoutine: '',
    favoriteFoods: '',
    quirks: '',
    specialHabits: '',
    thingsToRemember: '',
  });

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      const response = await fetch('/api/user/family-legacy/routines');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load routines');
      }
      const data = await response.json();
      if (data.routines) {
        setFormData({
          morningRoutine: data.routines.morningRoutine || '',
          eveningRoutine: data.routines.eveningRoutine || '',
          favoriteFoods: data.routines.favoriteFoods || '',
          quirks: data.routines.quirks || '',
          specialHabits: data.routines.specialHabits || '',
          thingsToRemember: data.routines.thingsToRemember || '',
        });
      }
    } catch (error) {
      console.error('Failed to load routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/family-legacy/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save routines');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save routines. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A5B99A] mx-auto mb-4"></div>
          <p className="text-[#2C2A29] opacity-70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2A29] mb-2">Daily Routines & Comforts</h1>
          <p className="text-[#2C2A29] opacity-70">Help them remember your daily life and special habits</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg">
            Saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">Morning Routine (Optional)</label>
            <textarea
              name="morningRoutine"
              value={formData.morningRoutine}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
              placeholder="How do you start your day? Coffee, exercise, reading..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">Evening Routine (Optional)</label>
            <textarea
              name="eveningRoutine"
              value={formData.eveningRoutine}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
              placeholder="How do you end your day? Reading, prayers, reflection..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">Favorite Foods (Optional)</label>
            <textarea
              name="favoriteFoods"
              value={formData.favoriteFoods}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
              placeholder="Your favorite meals, comfort foods, special treats..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">Quirks & Habits (Optional)</label>
            <textarea
              name="quirks"
              value={formData.quirks}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
              placeholder="Little things that make you, you..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">Special Habits (Optional)</label>
            <textarea
              name="specialHabits"
              value={formData.specialHabits}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
              placeholder="Traditions, routines, or habits you've developed over time..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Things I Want My Family to Remember About Me *
            </label>
            <textarea
              name="thingsToRemember"
              value={formData.thingsToRemember}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
              placeholder="What do you want them to remember? Your values, your love, your sense of humor..."
            />
            <p className="text-xs text-[#2C2A29] opacity-60 mt-1">
              This is the most important section - share what matters most
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Routines'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}







