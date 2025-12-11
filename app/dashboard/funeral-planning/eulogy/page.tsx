'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2, Plus, X } from 'lucide-react';
import { generateEulogy } from '@/lib/api/funeral';
import type { EulogyInput } from '@/types/funeral';

export default function EulogyPage() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<EulogyInput>({
    biography: '',
    highlights: [],
    faithBased: false,
    desiredLength: 'medium',
  });
  const [currentHighlight, setCurrentHighlight] = useState('');
  const [aiOutput, setAiOutput] = useState<any>(null);

  const handleAddHighlight = () => {
    if (currentHighlight.trim()) {
      setFormData(prev => ({
        ...prev,
        highlights: [...(prev.highlights || []), currentHighlight.trim()],
      }));
      setCurrentHighlight('');
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleGenerate = async () => {
    if (!formData.biography && (!formData.highlights || formData.highlights.length === 0)) {
      setError('Please provide at least a biography or some life highlights');
      return;
    }

    setGenerating(true);
    setError('');
    try {
      const result = await generateEulogy(formData);
      setAiOutput(result.eulogy);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate eulogy');
    } finally {
      setGenerating(false);
    }
  };

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
                Eulogy Writer
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                AI helps craft a beautiful eulogy from your life story
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
              <Sparkles className="w-6 h-6 text-[#A5B99A]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#2C2A29] mb-2">
                Create a meaningful tribute
              </h2>
              <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 leading-relaxed">
                Share your life story and highlights. Our AI will help craft a beautiful eulogy that 
                honors your journey, celebrates your accomplishments, and brings comfort to those who love you.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">{error}</div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">
            Your eulogy has been generated successfully!
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200 mb-6">
          <div className="space-y-6">
            {/* Biography */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Your Life Story / Biography <span className="text-gray-400">(At least one required)</span>
              </label>
              <p className="text-xs text-[#2C2A29] opacity-60 mb-2">
                Share your life journey, accomplishments, values, and what matters most to you
              </p>
              <textarea
                value={formData.biography || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
                placeholder="Tell your life story... your journey, values, accomplishments, relationships, and what you want to be remembered for..."
                rows={8}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target resize-y"
              />
            </div>

            {/* Life Highlights */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Life Highlights <span className="text-gray-400">(Optional, but recommended)</span>
              </label>
              <p className="text-xs text-[#2C2A29] opacity-60 mb-2">
                Add specific moments, achievements, or memories you'd like highlighted
              </p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentHighlight}
                  onChange={(e) => setCurrentHighlight(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHighlight();
                    }
                  }}
                  placeholder="e.g., Graduated from college, married my best friend, raised three wonderful children..."
                  className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                />
                <button
                  onClick={handleAddHighlight}
                  className="px-4 py-3 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors touch-target"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {formData.highlights && formData.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.highlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 bg-[#93B0C8] bg-opacity-10 text-[#2C2A29] rounded-full text-sm"
                    >
                      {highlight}
                      <button
                        onClick={() => handleRemoveHighlight(idx)}
                        className="ml-2 hover:text-red-600 touch-target"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Desired Length */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Desired Length
              </label>
              <select
                value={formData.desiredLength || 'medium'}
                onChange={(e) => setFormData(prev => ({ ...prev, desiredLength: e.target.value as 'short' | 'medium' | 'long' }))}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target cursor-pointer"
              >
                <option value="short">Short (2-3 minutes)</option>
                <option value="medium">Medium (4-6 minutes)</option>
                <option value="long">Long (7-10 minutes)</option>
              </select>
            </div>

            {/* Faith-Based */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="faithBased"
                checked={formData.faithBased || false}
                onChange={(e) => setFormData(prev => ({ ...prev, faithBased: e.target.checked }))}
                className="w-5 h-5 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] touch-target"
              />
              <label htmlFor="faithBased" className="text-sm text-[#2C2A29]">
                Include faith-based elements and spiritual themes
              </label>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || (!formData.biography && (!formData.highlights || formData.highlights.length === 0))}
              className="w-full px-6 py-4 min-h-[56px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating your eulogy...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Eulogy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {aiOutput && (
          <div className="space-y-6">
            {/* Full Draft */}
            {aiOutput.fullDraft && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Full Eulogy Draft</h3>
                <div className="prose max-w-none">
                  <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                    {aiOutput.fullDraft}
                  </p>
                </div>
              </div>
            )}

            {/* Short Version */}
            {aiOutput.shortVersion && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Short Version</h3>
                <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                  {aiOutput.shortVersion}
                </p>
              </div>
            )}

            {/* Medium Version */}
            {aiOutput.mediumVersion && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Medium Version</h3>
                <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                  {aiOutput.mediumVersion}
                </p>
              </div>
            )}

            {/* Speech Pacing */}
            {aiOutput.speechPacing && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Speech Pacing Suggestions</h3>
                <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                  {aiOutput.speechPacing}
                </p>
              </div>
            )}

            {/* Faith-Based Variation */}
            {aiOutput.faithBasedVariation && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Faith-Based Variation</h3>
                <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                  {aiOutput.faithBasedVariation}
                </p>
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
                  Regenerate Eulogy
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}


