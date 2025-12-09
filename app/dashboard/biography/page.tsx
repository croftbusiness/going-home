'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Save } from 'lucide-react';

interface Biography {
  lifeStory?: string;
  majorAccomplishments?: string;
  familyHistory?: string;
  faithStory?: string;
  lessonsLearned?: string;
  favoriteMemories?: string;
}

export default function BiographyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Biography>({
    lifeStory: '',
    majorAccomplishments: '',
    familyHistory: '',
    faithStory: '',
    lessonsLearned: '',
    favoriteMemories: '',
  });

  useEffect(() => {
    loadBiography();
  }, []);

  const loadBiography = async () => {
    try {
      const response = await fetch('/api/user/biography');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load data');
      }

      const data = await response.json();
      if (data.biography) {
        setFormData({
          lifeStory: data.biography.lifeStory || '',
          majorAccomplishments: data.biography.majorAccomplishments || '',
          familyHistory: data.biography.familyHistory || '',
          faithStory: data.biography.faithStory || '',
          lessonsLearned: data.biography.lessonsLearned || '',
          favoriteMemories: data.biography.favoriteMemories || '',
        });
      }
    } catch (error) {
      setError('Failed to load biography');
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
      const response = await fetch('/api/user/biography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save data');

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      setError('Failed to save biography');
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
        <div className="text-[#2C2A29]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl">
              <BookOpen className="w-6 h-6 text-[#A5B99A]" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-[#2C2A29]">Personal Biography</h1>
              <p className="text-[#2C2A29] opacity-70 mt-1">
                Share your life story, memories, and lessons learned
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">
              Biography saved successfully!
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 space-y-8">
          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Life Story
            </label>
            <p className="text-xs text-[#2C2A29] opacity-60 mb-2">
              Tell your life story - where you came from, important moments, and your journey
            </p>
            <textarea
              name="lifeStory"
              value={formData.lifeStory}
              onChange={handleChange}
              rows={8}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Write your life story here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Major Accomplishments
            </label>
            <p className="text-xs text-[#2C2A29] opacity-60 mb-2">
              Share your proudest achievements and milestones
            </p>
            <textarea
              name="majorAccomplishments"
              value={formData.majorAccomplishments}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="List your major accomplishments..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Family History
            </label>
            <p className="text-xs text-[#2C2A29] opacity-60 mb-2">
              Document your family history, heritage, and traditions
            </p>
            <textarea
              name="familyHistory"
              value={formData.familyHistory}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Share your family history..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Faith Story
            </label>
            <p className="text-xs text-[#2C2A29] opacity-60 mb-2">
              Your spiritual journey and faith experiences
            </p>
            <textarea
              name="faithStory"
              value={formData.faithStory}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Share your faith story..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Lessons Learned
            </label>
            <p className="text-xs text-[#2C2A29] opacity-60 mb-2">
              Wisdom and lessons you've learned throughout your life
            </p>
            <textarea
              name="lessonsLearned"
              value={formData.lessonsLearned}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Share the lessons you've learned..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Favorite Memories
            </label>
            <p className="text-xs text-[#2C2A29] opacity-60 mb-2">
              Your most cherished memories and moments
            </p>
            <textarea
              name="favoriteMemories"
              value={formData.favoriteMemories}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Share your favorite memories..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Biography'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

