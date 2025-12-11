'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Music, Save } from 'lucide-react';
import type { FuneralPreferenceRequest, FuneralPreferenceResponse } from '@/types/ai';

interface FuneralPreferenceGeneratorProps {
  onApply?: (preferences: FuneralPreferenceResponse) => void;
}

export default function FuneralPreferenceGenerator({ onApply }: FuneralPreferenceGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FuneralPreferenceRequest>({
    tone: 'celebration',
    musicPreferences: [],
    culturalBackground: '',
  });
  const [musicInput, setMusicInput] = useState('');
  const [result, setResult] = useState<FuneralPreferenceResponse | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/ai/funeral-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate preferences');
      }

      const data: FuneralPreferenceResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMusic = () => {
    if (musicInput.trim()) {
      setFormData({
        ...formData,
        musicPreferences: [...(formData.musicPreferences || []), musicInput.trim()],
      });
      setMusicInput('');
    }
  };

  const handleApply = () => {
    if (result && onApply) {
      onApply(result);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-[#93B0C8] bg-opacity-10 rounded-lg">
          <Music className="w-5 h-5 text-[#93B0C8]" />
        </div>
        <h3 className="text-lg font-semibold text-[#2C2A29]">AI Funeral Preference Generator</h3>
      </div>

      {!result ? (
        <div className="space-y-4">
          <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-[#2C2A29] opacity-70">
              Tell us about your preferences, and we'll generate song recommendations and atmosphere descriptions.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Service Tone
            </label>
            <select
              value={formData.tone || 'celebration'}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            >
              <option value="celebration">Celebration of Life</option>
              <option value="spiritual">Spiritual/Religious</option>
              <option value="military">Military Honors</option>
              <option value="quiet">Quiet/Intimate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Music Preferences (Optional)
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={musicInput}
                onChange={(e) => setMusicInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMusic()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="e.g., Classical, Jazz, Hymns"
              />
              <button
                onClick={handleAddMusic}
                className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
              >
                Add
              </button>
            </div>
            {formData.musicPreferences && formData.musicPreferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.musicPreferences.map((pref, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#93B0C8] bg-opacity-10 text-[#2C2A29] rounded-full text-sm"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Cultural Background (Optional)
            </label>
            <input
              type="text"
              value={formData.culturalBackground || ''}
              onChange={(e) => setFormData({ ...formData, culturalBackground: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="e.g., Christian, Jewish, Buddhist, etc."
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Preferences</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-[#2C2A29] mb-3">Recommended Songs</h4>
            <ul className="space-y-2">
              {result.recommendedSongs.map((song, index) => (
                <li key={index} className="flex items-center space-x-2 text-[#2C2A29]">
                  <Music className="w-4 h-4 text-[#93B0C8]" />
                  <span>{song}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#2C2A29] mb-3">Atmosphere Description</h4>
            <p className="text-[#2C2A29] opacity-80 leading-relaxed">
              {result.atmosphereDescription}
            </p>
          </div>

          {result.obituaryDraft && (
            <div>
              <h4 className="font-semibold text-[#2C2A29] mb-3">Obituary Draft</h4>
              <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200">
                <p className="whitespace-pre-wrap text-[#2C2A29] leading-relaxed">
                  {result.obituaryDraft}
                </p>
              </div>
            </div>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-[#2C2A29] mb-2">Additional Suggestions</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#2C2A29] opacity-80">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => setResult(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Generate New
            </button>
            {onApply && (
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Apply These</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


