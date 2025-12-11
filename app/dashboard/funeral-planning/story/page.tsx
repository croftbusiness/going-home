'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { getFuneralStory, generateFuneralStory } from '@/lib/api/funeral';
import type { FuneralStoryInput } from '@/types/funeral';

export default function FuneralStoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FuneralStoryInput>({
    atmosphere: '',
    musicChoices: [],
    toneTheme: '',
    readingsScriptures: [],
    eulogyNotes: '',
    messagesToAudience: '',
    desiredFeeling: '',
  });
  const [aiOutput, setAiOutput] = useState<any>(null);
  const [existingStory, setExistingStory] = useState<any>(null);

  useEffect(() => {
    loadExistingStory();
  }, []);

  const loadExistingStory = async () => {
    try {
      const story = await getFuneralStory();
      if (story) {
        setExistingStory(story);
        setFormData({
          atmosphere: story.atmosphere || '',
          musicChoices: story.music_choices || [],
          toneTheme: story.tone_theme || '',
          readingsScriptures: story.readings_scriptures || [],
          eulogyNotes: story.eulogy_notes || '',
          messagesToAudience: story.messages_to_audience || '',
          desiredFeeling: story.desired_feeling || '',
        });
        setAiOutput({
          ceremonyScript: story.ceremony_script,
          memorialNarrative: story.memorial_narrative,
          playlistSuggestions: story.playlist_suggestions,
          slideshowCaptions: story.slideshow_captions,
          moodDescription: story.mood_description,
        });
      }
    } catch (error) {
      console.error('Error loading story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FuneralStoryInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMusicAdd = () => {
    const input = document.getElementById('music-input') as HTMLInputElement;
    if (input?.value.trim()) {
      handleChange('musicChoices', [...(formData.musicChoices || []), input.value.trim()]);
      input.value = '';
    }
  };

  const handleReadingAdd = () => {
    const input = document.getElementById('reading-input') as HTMLInputElement;
    if (input?.value.trim()) {
      handleChange('readingsScriptures', [...(formData.readingsScriptures || []), input.value.trim()]);
      input.value = '';
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const result = await generateFuneralStory(formData);
      setAiOutput(result.aiOutput);
      setSuccess(true);
      setCurrentStep(4); // Show results
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate story');
    } finally {
      setGenerating(false);
    }
  };

  const steps = [
    { number: 1, title: 'Atmosphere & Feeling', icon: Heart },
    { number: 2, title: 'Music & Readings', icon: Sparkles },
    { number: 3, title: 'Your Message', icon: Heart },
    { number: 4, title: 'Your Story', icon: CheckCircle },
  ];

  const progress = (currentStep / steps.length) * 100;

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
                Your Funeral Story
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Let's create a meaningful ceremony that reflects who you are
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="hidden sm:flex items-center justify-between mb-2">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.number
                    ? 'bg-[#A5B99A] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                </div>
                {step.number < steps.length && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-[#A5B99A]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="sm:hidden mb-2">
            <div className="text-xs text-[#2C2A29] opacity-70 mb-1">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 sm:h-3">
            <div
              className="bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] h-2 sm:h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

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
                Creating your funeral story now gives your family a complete guide to honor you exactly as you wish. 
                Instead of struggling to remember what you might have wanted, they'll have your exact preferences 
                for atmosphere, music, readings, and messages. This removes guesswork and decision fatigue during 
                an already difficult time, allowing them to focus on celebrating your life rather than worrying 
                about getting the details right.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">{error}</div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            Your funeral story has been generated successfully!
          </div>
        )}

        {/* Step 1: Atmosphere & Feeling */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-[#2C2A29] mb-4 sm:mb-6">
              Step 1: Atmosphere & Feeling
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  What atmosphere do you want? <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={formData.atmosphere || ''}
                  onChange={(e) => handleChange('atmosphere', e.target.value)}
                  placeholder="e.g., Warm and celebratory, peaceful and reflective, joyful and light..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  What tone or theme resonates with you? <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.toneTheme || ''}
                  onChange={(e) => handleChange('toneTheme', e.target.value)}
                  placeholder="e.g., Celebration of life, gratitude, love, peace..."
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  How do you want people to feel? <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={formData.desiredFeeling || ''}
                  onChange={(e) => handleChange('desiredFeeling', e.target.value)}
                  placeholder="e.g., Comforted, inspired, grateful, at peace..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target resize-y"
                />
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto px-6 py-3 min-h-[48px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Music & Readings */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-[#2C2A29] mb-4 sm:mb-6">
              Step 2: Music & Readings
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Favorite Songs or Music <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    id="music-input"
                    type="text"
                    placeholder="e.g., Amazing Grace"
                    className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                    onKeyPress={(e) => e.key === 'Enter' && handleMusicAdd()}
                  />
                  <button
                    onClick={handleMusicAdd}
                    className="px-4 py-3 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors touch-target"
                  >
                    Add
                  </button>
                </div>
                {formData.musicChoices && formData.musicChoices.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.musicChoices.map((song, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 bg-[#A5B99A] bg-opacity-10 text-[#2C2A29] rounded-full text-sm"
                      >
                        {song}
                        <button
                          onClick={() => handleChange('musicChoices', formData.musicChoices?.filter((_, i) => i !== idx))}
                          className="ml-2 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Readings or Scriptures <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    id="reading-input"
                    type="text"
                    placeholder="e.g., Psalm 23, or a favorite quote"
                    className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                    onKeyPress={(e) => e.key === 'Enter' && handleReadingAdd()}
                  />
                  <button
                    onClick={handleReadingAdd}
                    className="px-4 py-3 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors touch-target"
                  >
                    Add
                  </button>
                </div>
                {formData.readingsScriptures && formData.readingsScriptures.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.readingsScriptures.map((reading, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 bg-[#93B0C8] bg-opacity-10 text-[#2C2A29] rounded-full text-sm"
                      >
                        {reading}
                        <button
                          onClick={() => handleChange('readingsScriptures', formData.readingsScriptures?.filter((_, i) => i !== idx))}
                          className="ml-2 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors touch-target"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 px-6 py-3 min-h-[48px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target"
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Your Message */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-[#2C2A29] mb-4 sm:mb-6">
              Step 3: Your Message
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Eulogy Notes or Life Highlights <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={formData.eulogyNotes || ''}
                  onChange={(e) => handleChange('eulogyNotes', e.target.value)}
                  placeholder="Share some highlights from your life, values that matter to you, or notes about what you'd like mentioned..."
                  rows={6}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Messages to Your Audience <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={formData.messagesToAudience || ''}
                  onChange={(e) => handleChange('messagesToAudience', e.target.value)}
                  placeholder="Anything you'd like to communicate to those who will attend your service..."
                  rows={4}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target resize-y"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors touch-target"
                >
                  ← Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 px-6 py-3 min-h-[48px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating your story...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Your Story
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {currentStep === 4 && aiOutput && (
          <div className="space-y-6">
            {/* Ceremony Script */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-[#2C2A29] mb-4">Ceremony Script</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                  {aiOutput.ceremonyScript}
                </p>
              </div>
            </div>

            {/* Memorial Narrative */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-[#2C2A29] mb-4">Memorial Narrative</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                  {aiOutput.memorialNarrative}
                </p>
              </div>
            </div>

            {/* Mood Description */}
            {aiOutput.moodDescription && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-[#2C2A29] mb-4">Atmosphere & Mood</h2>
                <p className="text-[#2C2A29] opacity-80 leading-relaxed">{aiOutput.moodDescription}</p>
              </div>
            )}

            {/* Playlist Suggestions */}
            {aiOutput.playlistSuggestions && Array.isArray(aiOutput.playlistSuggestions) && aiOutput.playlistSuggestions.length > 0 && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-[#2C2A29] mb-4">Music Suggestions</h2>
                <div className="space-y-3">
                  {aiOutput.playlistSuggestions.map((song: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-[#2C2A29]">{song.song || song}</div>
                      {song.artist && <div className="text-sm text-[#2C2A29] opacity-70">{song.artist}</div>}
                      {song.reason && <div className="text-sm text-[#2C2A29] opacity-60 mt-1">{song.reason}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors touch-target"
              >
                ← Edit Your Inputs
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 px-6 py-3 min-h-[48px] text-base bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors touch-target disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Regenerate
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

