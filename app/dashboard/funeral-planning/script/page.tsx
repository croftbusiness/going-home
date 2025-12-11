'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookText, Sparkles, Loader2, Heart } from 'lucide-react';
import { getScript, generateScript } from '@/lib/api/funeral';
import type { CeremonyScriptInput } from '@/types/funeral';

export default function CeremonyScriptPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<CeremonyScriptInput>({
    tone: 'traditional',
    includePrayers: false,
    includeReadings: false,
    customRequests: '',
  });
  const [aiOutput, setAiOutput] = useState<any>(null);
  const [existingScript, setExistingScript] = useState<any>(null);

  useEffect(() => {
    loadExistingScript();
  }, []);

  const loadExistingScript = async () => {
    try {
      const script = await getScript();
      if (script) {
        setExistingScript(script);
        setFormData({
          tone: script.tone_variation || 'traditional',
          includePrayers: !!script.prayers,
          includeReadings: !!script.readings,
          customRequests: '',
        });
        setAiOutput({
          openingWords: script.opening_words,
          closingBlessing: script.closing_blessing,
          prayers: script.prayers,
          readings: script.readings,
          transitions: script.transitions,
          fullScript: script.full_script,
        });
      }
    } catch (error) {
      console.error('Error loading script:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const result = await generateScript(formData);
      setAiOutput(result.aiOutput);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate script');
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
                Ceremony Script
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Generate opening words, readings, and closing blessings
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
              <BookText className="w-6 h-6 text-[#93B0C8]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#2C2A29] mb-2">
                Create a comforting ceremony flow
              </h2>
              <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 leading-relaxed mb-4">
                Our AI will help create a ceremony script with opening words, optional prayers and readings, 
                transitions, and closing blessings—all in a tone that brings comfort and peace.
              </p>
              
              {/* Why This Helps Loved Ones */}
              <div className="mt-4 p-4 bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10 rounded-lg border border-[#A5B99A]/20">
                <div className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-[#A5B99A] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#2C2A29] mb-1">
                      Why This Helps Your Loved Ones
                    </h3>
                    <p className="text-xs text-[#2C2A29] opacity-80 leading-relaxed">
                      Planning a ceremony flow can feel overwhelming when you're grieving. By creating your script 
                      now, you're giving your family a complete roadmap for the service. They won't have to worry 
                      about what to say, when to pause, or how to transition between moments. Your script ensures 
                      the ceremony flows smoothly and honors you exactly as you envisioned, allowing them to focus 
                      on being present rather than managing logistics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">{error}</div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">
            Your ceremony script has been generated successfully!
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200 mb-6">
          <div className="space-y-6">
            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Ceremony Tone
              </label>
              <select
                value={formData.tone || 'traditional'}
                onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value as any }))}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target cursor-pointer"
              >
                <option value="celebratory">Celebratory - Joyful celebration of life</option>
                <option value="traditional">Traditional - Classic and respectful</option>
                <option value="spiritual">Spiritual - Faith-centered and reverent</option>
                <option value="casual">Casual - Warm and informal</option>
                <option value="formal">Formal - Elegant and dignified</option>
              </select>
            </div>

            {/* Include Prayers */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includePrayers"
                checked={formData.includePrayers || false}
                onChange={(e) => setFormData(prev => ({ ...prev, includePrayers: e.target.checked }))}
                className="w-5 h-5 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] touch-target"
              />
              <label htmlFor="includePrayers" className="text-sm text-[#2C2A29]">
                Include prayers in the ceremony
              </label>
            </div>

            {/* Include Readings */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeReadings"
                checked={formData.includeReadings || false}
                onChange={(e) => setFormData(prev => ({ ...prev, includeReadings: e.target.checked }))}
                className="w-5 h-5 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] touch-target"
              />
              <label htmlFor="includeReadings" className="text-sm text-[#2C2A29]">
                Include readings or scriptures
              </label>
            </div>

            {/* Custom Requests */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Special Requests or Preferences <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                value={formData.customRequests || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, customRequests: e.target.value }))}
                placeholder="Any specific elements, themes, or requests for the ceremony script..."
                rows={4}
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
                  Creating your ceremony script...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Ceremony Script
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {aiOutput && (
          <div className="space-y-6">
            {/* Opening Words */}
            {aiOutput.openingWords && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Opening Words</h3>
                <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                  {aiOutput.openingWords}
                </p>
              </div>
            )}

            {/* Prayers */}
            {aiOutput.prayers && Array.isArray(aiOutput.prayers) && aiOutput.prayers.length > 0 && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Prayers</h3>
                <div className="space-y-4">
                  {aiOutput.prayers.map((prayer: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      {prayer.title && (
                        <div className="font-medium text-[#2C2A29] mb-2">{prayer.title}</div>
                      )}
                      <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                        {prayer.text}
                      </p>
                      {prayer.timing && (
                        <div className="text-xs text-[#2C2A29] opacity-60 mt-2">
                          Timing: {prayer.timing}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Readings */}
            {aiOutput.readings && Array.isArray(aiOutput.readings) && aiOutput.readings.length > 0 && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Readings</h3>
                <div className="space-y-4">
                  {aiOutput.readings.map((reading: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      {reading.title && (
                        <div className="font-medium text-[#2C2A29] mb-2">{reading.title}</div>
                      )}
                      {reading.source && (
                        <div className="text-xs text-[#2C2A29] opacity-70 mb-2">Source: {reading.source}</div>
                      )}
                      <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                        {reading.text}
                      </p>
                      {reading.timing && (
                        <div className="text-xs text-[#2C2A29] opacity-60 mt-2">
                          Timing: {reading.timing}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transitions */}
            {aiOutput.transitions && Array.isArray(aiOutput.transitions) && aiOutput.transitions.length > 0 && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Ceremony Transitions</h3>
                <div className="space-y-3">
                  {aiOutput.transitions.map((transition: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-[#2C2A29] opacity-70 mb-1">
                        From: {transition.from} → To: {transition.to}
                      </div>
                      <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 leading-relaxed">
                        {transition.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Closing Blessing */}
            {aiOutput.closingBlessing && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Closing Blessing</h3>
                <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                  {aiOutput.closingBlessing}
                </p>
              </div>
            )}

            {/* Full Script */}
            {aiOutput.fullScript && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Complete Ceremony Script</h3>
                <div className="p-4 bg-[#FCFAF7] rounded-lg border border-gray-200">
                  <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                    {aiOutput.fullScript}
                  </p>
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
                  Regenerate Script
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}



