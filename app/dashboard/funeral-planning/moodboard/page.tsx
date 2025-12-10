'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Palette, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { getMoodboard, generateMoodboard } from '@/lib/api/funeral';
import type { MoodboardInput } from '@/types/funeral';

export default function MoodboardPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<MoodboardInput>({
    colors: [],
    flowers: [],
    clothingPreferences: '',
    aestheticStyle: '',
    venueType: '',
  });
  const [currentColor, setCurrentColor] = useState('');
  const [currentFlower, setCurrentFlower] = useState('');
  const [aiOutput, setAiOutput] = useState<any>(null);
  const [existingMoodboard, setExistingMoodboard] = useState<any>(null);

  useEffect(() => {
    loadExistingMoodboard();
  }, []);

  const loadExistingMoodboard = async () => {
    try {
      const moodboard = await getMoodboard();
      if (moodboard) {
        setExistingMoodboard(moodboard);
        setFormData({
          colors: moodboard.colors || [],
          flowers: moodboard.flowers || [],
          clothingPreferences: moodboard.clothing_preferences || '',
          aestheticStyle: moodboard.aesthetic_style || '',
          venueType: moodboard.venue_type || '',
        });
        setAiOutput({
          vibeGuide: moodboard.vibe_guide,
          decorSuggestions: moodboard.decor_suggestions,
          invitationWording: moodboard.invitation_wording,
          moodboardLayout: moodboard.moodboard_layout,
        });
      }
    } catch (error) {
      console.error('Error loading moodboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddColor = () => {
    if (currentColor.trim()) {
      setFormData(prev => ({
        ...prev,
        colors: [...(prev.colors || []), currentColor.trim()],
      }));
      setCurrentColor('');
    }
  };

  const handleAddFlower = () => {
    if (currentFlower.trim()) {
      setFormData(prev => ({
        ...prev,
        flowers: [...(prev.flowers || []), currentFlower.trim()],
      }));
      setCurrentFlower('');
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const result = await generateMoodboard(formData);
      setAiOutput(result.aiOutput);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate moodboard');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <Loader2 className="w-6 h-6 animate-spin text-[#93B0C8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <header className="bg-[#FCFAF7] border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/dashboard/funeral-planning"
              className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">
                Visual Moodboard
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Design the atmosphere and aesthetic of your service
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Intro */}
        <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl flex-shrink-0">
              <Palette className="w-6 h-6 text-[#A5B99A]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#2C2A29] mb-2">
                Create your visual vision
              </h2>
              <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 leading-relaxed">
                Share your preferences for colors, flowers, style, and atmosphere. 
                We'll create a beautiful moodboard and guide that helps bring your vision to life.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">
            Your moodboard has been generated successfully!
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 mb-6">
          <div className="space-y-6">
            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Colors <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddColor();
                    }
                  }}
                  placeholder="e.g., Soft blues, warm creams, sage green..."
                  className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                />
                <button
                  onClick={handleAddColor}
                  className="px-4 py-3 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors touch-target"
                >
                  Add
                </button>
              </div>
              {formData.colors && formData.colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 bg-[#A5B99A] bg-opacity-10 text-[#2C2A29] rounded-full text-sm"
                    >
                      {color}
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          colors: prev.colors?.filter((_, i) => i !== idx) || [],
                        }))}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Flowers */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Flowers <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentFlower}
                  onChange={(e) => setCurrentFlower(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFlower();
                    }
                  }}
                  placeholder="e.g., Roses, lilies, sunflowers..."
                  className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                />
                <button
                  onClick={handleAddFlower}
                  className="px-4 py-3 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors touch-target"
                >
                  Add
                </button>
              </div>
              {formData.flowers && formData.flowers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.flowers.map((flower, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 bg-[#93B0C8] bg-opacity-10 text-[#2C2A29] rounded-full text-sm"
                    >
                      {flower}
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          flowers: prev.flowers?.filter((_, i) => i !== idx) || [],
                        }))}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Aesthetic Style */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Aesthetic Style <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.aestheticStyle || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aestheticStyle: e.target.value }))}
                placeholder="e.g., Natural and peaceful, elegant and formal, rustic and warm..."
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
              />
            </div>

            {/* Venue Type */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Preferred Venue Type <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.venueType || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, venueType: e.target.value }))}
                placeholder="e.g., Garden, chapel, home, beach, forest..."
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
              />
            </div>

            {/* Clothing Preferences */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Clothing Preferences <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                value={formData.clothingPreferences || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, clothingPreferences: e.target.value }))}
                placeholder="e.g., Casual and comfortable, formal attire, specific colors..."
                rows={3}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target resize-y"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full px-6 py-4 min-h-[56px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating your moodboard...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Moodboard
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {aiOutput && (
          <div className="space-y-6">
            {/* Vibe Guide */}
            {aiOutput.vibeGuide && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Atmosphere Guide</h3>
                <p className="text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                  {aiOutput.vibeGuide}
                </p>
              </div>
            )}

            {/* Décor Suggestions */}
            {aiOutput.decorSuggestions && Array.isArray(aiOutput.decorSuggestions) && aiOutput.decorSuggestions.length > 0 && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Décor Suggestions</h3>
                <div className="space-y-3">
                  {aiOutput.decorSuggestions.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="font-medium text-[#2C2A29] mb-1">{item.item || item}</div>
                      {item.placement && <div className="text-sm text-[#2C2A29] opacity-70 mb-1">Placement: {item.placement}</div>}
                      {item.reason && <div className="text-sm text-[#2C2A29] opacity-60">{item.reason}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invitation Wording */}
            {aiOutput.invitationWording && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Suggested Invitation Wording</h3>
                <div className="p-4 bg-[#FCFAF7] rounded-lg border border-gray-200">
                  <p className="text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                    {aiOutput.invitationWording}
                  </p>
                </div>
              </div>
            )}

            {/* Moodboard Layout */}
            {aiOutput.moodboardLayout && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Visual Moodboard</h3>
                <div className="space-y-4">
                  {aiOutput.moodboardLayout.colorPalette && (
                    <div>
                      <h4 className="text-sm font-medium text-[#2C2A29] mb-2">Color Palette</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiOutput.moodboardLayout.colorPalette.map((color: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-[#2C2A29] rounded-full text-sm"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiOutput.moodboardLayout.styleDescription && (
                    <div>
                      <h4 className="text-sm font-medium text-[#2C2A29] mb-2">Style</h4>
                      <p className="text-[#2C2A29] opacity-80">{aiOutput.moodboardLayout.styleDescription}</p>
                    </div>
                  )}
                  {aiOutput.moodboardLayout.atmosphere && (
                    <div>
                      <h4 className="text-sm font-medium text-[#2C2A29] mb-2">Atmosphere</h4>
                      <p className="text-[#2C2A29] opacity-80">{aiOutput.moodboardLayout.atmosphere}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Regenerate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full px-6 py-3 min-h-[48px] text-base bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors touch-target disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Regenerate Moodboard
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

