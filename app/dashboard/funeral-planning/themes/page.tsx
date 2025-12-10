'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, Plus, X, Loader2, Sparkles } from 'lucide-react';
import { getLifeThemes, analyzeLifeThemes } from '@/lib/api/funeral';

export default function LifeThemesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [memories, setMemories] = useState<string[]>([]);
  const [currentMemory, setCurrentMemory] = useState('');
  const [values, setValues] = useState<string[]>([]);
  const [currentValue, setCurrentValue] = useState('');
  const [themes, setThemes] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    loadExistingThemes();
  }, []);

  const loadExistingThemes = async () => {
    try {
      const existing = await getLifeThemes();
      if (existing) {
        setThemes(existing);
        setMemories(existing.key_memories || []);
        setValues(existing.core_values || []);
      }
    } catch (error) {
      console.error('Error loading themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = () => {
    if (currentMemory.trim()) {
      setMemories([...memories, currentMemory.trim()]);
      setCurrentMemory('');
    }
  };

  const handleRemoveMemory = (index: number) => {
    setMemories(memories.filter((_, i) => i !== index));
  };

  const handleAddValue = () => {
    if (currentValue.trim()) {
      setValues([...values, currentValue.trim()]);
      setCurrentValue('');
    }
  };

  const handleRemoveValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (memories.length === 0) {
      setError('Please add at least one memory to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');
    try {
      const result = await analyzeLifeThemes({
        keyMemories: memories,
        values: values.length > 0 ? values : undefined,
      });
      setThemes(result.themes);
      setAnalysis(result.analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze themes');
    } finally {
      setAnalyzing(false);
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
                Life Themes
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Discover the core values and themes that define your life story
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Intro */}
        <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#93B0C8] bg-opacity-10 rounded-xl flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-[#93B0C8]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#2C2A29] mb-2">
                What defines your life?
              </h2>
              <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 leading-relaxed">
                Share your key memories and values. Our AI will help identify the themes, lessons, 
                and motifs that make your story unique. These themes will guide all your funeral planning 
                to create a truly personalized experience.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {/* Memories Input */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">
            Key Memories <span className="text-sm font-normal text-gray-400">(At least one required)</span>
          </h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <textarea
                value={currentMemory}
                onChange={(e) => setCurrentMemory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddMemory();
                  }
                }}
                placeholder="Describe a meaningful moment, experience, or memory from your life..."
                rows={3}
                className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target resize-y"
              />
              <button
                onClick={handleAddMemory}
                className="px-4 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {memories.length > 0 && (
              <div className="space-y-2">
                {memories.map((memory, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <p className="text-sm text-[#2C2A29] flex-1">{memory}</p>
                    <button
                      onClick={() => handleRemoveMemory(idx)}
                      className="ml-3 p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Values Input (Optional) */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">
            Core Values <span className="text-sm font-normal text-gray-400">(Optional)</span>
          </h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddValue();
                  }
                }}
                placeholder="e.g., Family, Honesty, Adventure, Faith..."
                className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
              />
              <button
                onClick={handleAddValue}
                className="px-4 py-3 bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors touch-target flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {values.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {values.map((value, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 bg-[#93B0C8] bg-opacity-10 text-[#2C2A29] rounded-full text-sm"
                  >
                    {value}
                    <button
                      onClick={() => handleRemoveValue(idx)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analyze Button */}
        <div className="mb-6">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || memories.length === 0}
            className="w-full px-6 py-4 min-h-[56px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing your life themes...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Discover My Life Themes
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Theme Description */}
            {analysis.themeDescription && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Your Life Story</h3>
                <p className="text-[#2C2A29] opacity-80 leading-relaxed">{analysis.themeDescription}</p>
              </div>
            )}

            {/* Core Values */}
            {analysis.coreValues && analysis.coreValues.length > 0 && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Core Values</h3>
                <div className="flex flex-wrap gap-3">
                  {analysis.coreValues.map((value: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-[#A5B99A] bg-opacity-10 text-[#2C2A29] rounded-full font-medium"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tone Themes */}
            {analysis.toneThemes && analysis.toneThemes.length > 0 && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Tone Themes</h3>
                <div className="flex flex-wrap gap-3">
                  {analysis.toneThemes.map((theme: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-[#93B0C8] bg-opacity-10 text-[#2C2A29] rounded-full"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Life Lessons */}
            {analysis.lifeLessons && analysis.lifeLessons.length > 0 && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Life Lessons</h3>
                <ul className="space-y-2">
                  {analysis.lifeLessons.map((lesson: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-[#A5B99A] mr-2">•</span>
                      <span className="text-[#2C2A29] opacity-80">{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Identity Motifs */}
            {analysis.identityMotifs && analysis.identityMotifs.length > 0 && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Identity Motifs</h3>
                <div className="flex flex-wrap gap-3">
                  {analysis.identityMotifs.map((motif: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-[#EBD9B5] bg-opacity-20 text-[#2C2A29] rounded-full text-sm"
                    >
                      {motif}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Info Note */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-[#2C2A29] opacity-80">
                ✨ These themes will help guide your eulogy, ceremony script, playlist, and letters 
                to create a truly personalized experience that reflects who you are.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

