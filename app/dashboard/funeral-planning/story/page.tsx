'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Heart, Sparkles, Loader2, CheckCircle2, Save, 
  ChevronDown, ChevronUp, Music, BookOpen, MessageCircle, 
  Palette, Camera, Users, Gift, Coffee, FileText, Download,
  Info, Plus, X, Calendar, Clock, MapPin, Image as ImageIcon
} from 'lucide-react';
import { getFuneralStory, generateFuneralStory } from '@/lib/api/funeral';
import type { FuneralStoryInput } from '@/types/funeral';

interface ExpandedStoryInput extends FuneralStoryInput {
  serviceStructure?: string;
  visualElements?: string;
  specialMoments?: string[];
  memorialKeepsakes?: string;
  receptionDetails?: string;
  dressCode?: string;
  photographyPreferences?: string;
  guestParticipation?: string;
  ceremonyTiming?: string;
  venuePreferences?: string;
  flowerPreferences?: string[];
  colorPreferences?: string[];
}

export default function FuneralStoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['atmosphere']));
  const [formData, setFormData] = useState<ExpandedStoryInput>({
    atmosphere: '',
    musicChoices: [],
    toneTheme: '',
    readingsScriptures: [],
    eulogyNotes: '',
    messagesToAudience: '',
    desiredFeeling: '',
    serviceStructure: '',
    visualElements: '',
    specialMoments: [],
    memorialKeepsakes: '',
    receptionDetails: '',
    dressCode: '',
    photographyPreferences: '',
    guestParticipation: '',
    ceremonyTiming: '',
    venuePreferences: '',
    flowerPreferences: [],
    colorPreferences: [],
  });
  const [aiOutput, setAiOutput] = useState<any>(null);
  const [existingStory, setExistingStory] = useState<any>(null);
  const [tempMusicInput, setTempMusicInput] = useState('');
  const [tempReadingInput, setTempReadingInput] = useState('');
  const [tempSpecialMomentInput, setTempSpecialMomentInput] = useState('');
  const [tempFlowerInput, setTempFlowerInput] = useState('');
  const [tempColorInput, setTempColorInput] = useState('');

  useEffect(() => {
    loadExistingStory();
  }, []);

  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (autoSaveStatus === 'idle' && hasChanges()) {
        handleAutoSave();
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [formData]);

  const hasChanges = () => {
    return Object.values(formData).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    });
  };

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
          serviceStructure: story.service_structure || '',
          visualElements: story.visual_elements || '',
          specialMoments: story.special_moments || [],
          memorialKeepsakes: story.memorial_keepsakes || '',
          receptionDetails: story.reception_details || '',
          dressCode: story.dress_code || '',
          photographyPreferences: story.photography_preferences || '',
          guestParticipation: story.guest_participation || '',
          ceremonyTiming: story.ceremony_timing || '',
          venuePreferences: story.venue_preferences || '',
          flowerPreferences: story.flower_preferences || [],
          colorPreferences: story.color_preferences || [],
        });
        setAiOutput({
          ceremonyScript: story.ceremony_script,
          memorialNarrative: story.memorial_narrative,
          playlistSuggestions: story.playlist_suggestions,
          slideshowCaptions: story.slideshow_captions,
          moodDescription: story.mood_description,
          ceremonyTimeline: story.ceremony_timeline,
          serviceOrder: story.service_order,
          receptionGuide: story.reception_guide,
          visualDesignGuide: story.visual_design_guide,
          guestParticipationGuide: story.guest_participation_guide,
        });
      }
    } catch (error) {
      console.error('Error loading story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (saving || generating) return;
    
    setAutoSaveStatus('saving');
    try {
      // Save form data only (not generating AI)
      const response = await fetch('/api/funeral/story', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    } catch (error) {
      setAutoSaveStatus('idle');
      console.error('Auto-save failed:', error);
    }
  };

  const handleChange = (field: keyof ExpandedStoryInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setAutoSaveStatus('idle');
  };

  const addItem = (field: 'musicChoices' | 'readingsScriptures' | 'specialMoments' | 'flowerPreferences' | 'colorPreferences', input: string, setInput: (val: string) => void) => {
    if (input.trim()) {
      handleChange(field, [...(formData[field] || []), input.trim()]);
      setInput('');
    }
  };

  const removeItem = (field: 'musicChoices' | 'readingsScriptures' | 'specialMoments' | 'flowerPreferences' | 'colorPreferences', index: number) => {
    handleChange(field, formData[field]?.filter((_, i) => i !== index) || []);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const result = await generateFuneralStory(formData);
      setAiOutput(result.aiOutput);
      setSuccess(true);
      setCurrentStep(5); // Show results
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate story');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const steps = [
    { id: 1, title: 'Atmosphere & Feeling', icon: Heart, color: 'bg-[#A5B99A]' },
    { id: 2, title: 'Music & Readings', icon: Music, color: 'bg-[#93B0C8]' },
    { id: 3, title: 'Service Details', icon: Calendar, color: 'bg-[#A5B99A]' },
    { id: 4, title: 'Visual & Reception', icon: Palette, color: 'bg-[#93B0C8]' },
    { id: 5, title: 'Your Story', icon: FileText, color: 'bg-[#A5B99A]' },
  ];

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#A5B99A] animate-spin" />
          <div className="text-[#2C2A29] opacity-70">Loading your story...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
      <header className="bg-[#FCFAF7] border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                href="/dashboard/funeral-planning"
                className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
              </Link>
              <div className="p-3 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">
                  Your Funeral Story
                </h1>
                <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                  Create a meaningful ceremony that reflects who you are
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center space-x-2 text-sm text-[#2C2A29] opacity-60">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </div>
              )}
              {autoSaveStatus === 'saved' && (
                <div className="flex items-center space-x-2 text-sm text-[#A5B99A]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Progress Steps */}
        {currentStep < 5 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              {steps.slice(0, 4).map((step) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                          currentStep > step.id
                            ? `${step.color} text-white`
                            : currentStep === step.id
                            ? `${step.color} text-white ring-4 ring-opacity-30`
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-6 h-6" />
                        )}
                      </div>
                      <span className={`text-xs mt-2 text-center ${currentStep === step.id ? 'font-medium text-[#2C2A29]' : 'text-gray-500'}`}>
                        {step.title}
                      </span>
                    </div>
                    {step.id < 4 && (
                      <div className={`flex-1 h-1 mx-2 ${currentStep > step.id ? step.color : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Why This Helps */}
        <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-white rounded-xl p-6 mb-6 shadow-sm border border-[#A5B99A]/20">
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
                for atmosphere, music, readings, visual elements, and messages. This removes guesswork and decision 
                fatigue during an already difficult time, allowing them to focus on celebrating your life rather than 
                worrying about getting the details right.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Your funeral story has been generated successfully!</span>
          </div>
        )}

        {/* Step 1: Atmosphere & Feeling */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-[#2C2A29] mb-6 flex items-center space-x-3">
                <Heart className="w-6 h-6 text-[#A5B99A]" />
                <span>Step 1: Atmosphere & Feeling</span>
              </h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>Tip:</strong> Think about how you want people to feel during your service. 
                      Do you want it to be celebratory, peaceful, reflective, or joyful? Your words here 
                      will guide the entire ceremony.
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    What atmosphere do you want?
                  </label>
                  <textarea
                    value={formData.atmosphere || ''}
                    onChange={(e) => handleChange('atmosphere', e.target.value)}
                    placeholder="e.g., Warm and celebratory, peaceful and reflective, joyful and light, traditional and formal..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    What tone or theme resonates with you?
                  </label>
                  <input
                    type="text"
                    value={formData.toneTheme || ''}
                    onChange={(e) => handleChange('toneTheme', e.target.value)}
                    placeholder="e.g., Celebration of life, gratitude, love, peace, remembrance..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    How do you want people to feel?
                  </label>
                  <textarea
                    value={formData.desiredFeeling || ''}
                    onChange={(e) => handleChange('desiredFeeling', e.target.value)}
                    placeholder="e.g., Comforted, inspired, grateful, at peace, uplifted, connected..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Messages to Your Audience
                  </label>
                  <textarea
                    value={formData.messagesToAudience || ''}
                    onChange={(e) => handleChange('messagesToAudience', e.target.value)}
                    placeholder="Anything you'd like to communicate to those who will attend your service..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-8 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 font-semibold"
              >
                <span>Continue</span>
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Music & Readings */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-[#2C2A29] mb-6 flex items-center space-x-3">
                <Music className="w-6 h-6 text-[#93B0C8]" />
                <span>Step 2: Music & Readings</span>
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Favorite Songs or Music
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tempMusicInput}
                      onChange={(e) => setTempMusicInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('musicChoices', tempMusicInput, setTempMusicInput))}
                      placeholder="e.g., Amazing Grace by Elvis Presley"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
                    />
                    <button
                      onClick={() => addItem('musicChoices', tempMusicInput, setTempMusicInput)}
                      className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  {formData.musicChoices && formData.musicChoices.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.musicChoices.map((song, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-4 py-2 bg-[#A5B99A] bg-opacity-10 text-[#2C2A29] rounded-lg text-sm border border-[#A5B99A] border-opacity-20"
                        >
                          {song}
                          <button
                            onClick={() => removeItem('musicChoices', idx)}
                            className="ml-2 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Readings or Scriptures
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tempReadingInput}
                      onChange={(e) => setTempReadingInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('readingsScriptures', tempReadingInput, setTempReadingInput))}
                      placeholder="e.g., Psalm 23, or a favorite quote"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
                    />
                    <button
                      onClick={() => addItem('readingsScriptures', tempReadingInput, setTempReadingInput)}
                      className="px-4 py-2 bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  {formData.readingsScriptures && formData.readingsScriptures.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.readingsScriptures.map((reading, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-4 py-2 bg-[#93B0C8] bg-opacity-10 text-[#2C2A29] rounded-lg text-sm border border-[#93B0C8] border-opacity-20"
                        >
                          {reading}
                          <button
                            onClick={() => removeItem('readingsScriptures', idx)}
                            className="ml-2 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Eulogy Notes or Life Highlights
                  </label>
                  <textarea
                    value={formData.eulogyNotes || ''}
                    onChange={(e) => handleChange('eulogyNotes', e.target.value)}
                    placeholder="Share some highlights from your life, values that matter to you, or notes about what you'd like mentioned..."
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 border-2 border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-8 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 font-semibold"
              >
                <span>Continue</span>
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Service Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-[#2C2A29] mb-6 flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-[#A5B99A]" />
                <span>Step 3: Service Details</span>
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Service Structure Preferences
                  </label>
                  <textarea
                    value={formData.serviceStructure || ''}
                    onChange={(e) => handleChange('serviceStructure', e.target.value)}
                    placeholder="How would you like the service structured? (e.g., Opening music, welcome, readings, eulogy, closing prayer, recessional...)"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Ceremony Timing & Duration
                  </label>
                  <input
                    type="text"
                    value={formData.ceremonyTiming || ''}
                    onChange={(e) => handleChange('ceremonyTiming', e.target.value)}
                    placeholder="e.g., 45 minutes, morning service, afternoon gathering..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Venue Preferences
                  </label>
                  <textarea
                    value={formData.venuePreferences || ''}
                    onChange={(e) => handleChange('venuePreferences', e.target.value)}
                    placeholder="e.g., Outdoor garden, church, funeral home, family home, beach..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Special Moments or Rituals
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tempSpecialMomentInput}
                      onChange={(e) => setTempSpecialMomentInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('specialMoments', tempSpecialMomentInput, setTempSpecialMomentInput))}
                      placeholder="e.g., Candle lighting, memory sharing, moment of silence..."
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
                    />
                    <button
                      onClick={() => addItem('specialMoments', tempSpecialMomentInput, setTempSpecialMomentInput)}
                      className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  {formData.specialMoments && formData.specialMoments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.specialMoments.map((moment, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-4 py-2 bg-[#A5B99A] bg-opacity-10 text-[#2C2A29] rounded-lg text-sm border border-[#A5B99A] border-opacity-20"
                        >
                          {moment}
                          <button
                            onClick={() => removeItem('specialMoments', idx)}
                            className="ml-2 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Guest Participation Opportunities
                  </label>
                  <textarea
                    value={formData.guestParticipation || ''}
                    onChange={(e) => handleChange('guestParticipation', e.target.value)}
                    placeholder="e.g., Open mic for sharing memories, writing messages, lighting candles..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Photography & Videography Preferences
                  </label>
                  <textarea
                    value={formData.photographyPreferences || ''}
                    onChange={(e) => handleChange('photographyPreferences', e.target.value)}
                    placeholder="e.g., Please take photos, no flash photography, video recording welcome..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Dress Code Preferences
                  </label>
                  <input
                    type="text"
                    value={formData.dressCode || ''}
                    onChange={(e) => handleChange('dressCode', e.target.value)}
                    placeholder="e.g., Casual, formal, colorful celebration, specific colors..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 border-2 border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-8 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 font-semibold"
              >
                <span>Continue</span>
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Visual & Reception */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-[#2C2A29] mb-6 flex items-center space-x-3">
                <Palette className="w-6 h-6 text-[#93B0C8]" />
                <span>Step 4: Visual & Reception</span>
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Color Preferences
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tempColorInput}
                      onChange={(e) => setTempColorInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('colorPreferences', tempColorInput, setTempColorInput))}
                      placeholder="e.g., Soft blues and greens, warm earth tones..."
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
                    />
                    <button
                      onClick={() => addItem('colorPreferences', tempColorInput, setTempColorInput)}
                      className="px-4 py-2 bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  {formData.colorPreferences && formData.colorPreferences.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.colorPreferences.map((color, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-4 py-2 bg-[#93B0C8] bg-opacity-10 text-[#2C2A29] rounded-lg text-sm border border-[#93B0C8] border-opacity-20"
                        >
                          {color}
                          <button
                            onClick={() => removeItem('colorPreferences', idx)}
                            className="ml-2 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Flower Preferences
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tempFlowerInput}
                      onChange={(e) => setTempFlowerInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('flowerPreferences', tempFlowerInput, setTempFlowerInput))}
                      placeholder="e.g., Sunflowers, roses, wildflowers..."
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
                    />
                    <button
                      onClick={() => addItem('flowerPreferences', tempFlowerInput, setTempFlowerInput)}
                      className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  {formData.flowerPreferences && formData.flowerPreferences.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.flowerPreferences.map((flower, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-4 py-2 bg-[#A5B99A] bg-opacity-10 text-[#2C2A29] rounded-lg text-sm border border-[#A5B99A] border-opacity-20"
                        >
                          {flower}
                          <button
                            onClick={() => removeItem('flowerPreferences', idx)}
                            className="ml-2 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Visual Elements & Decorations
                  </label>
                  <textarea
                    value={formData.visualElements || ''}
                    onChange={(e) => handleChange('visualElements', e.target.value)}
                    placeholder="e.g., Photo displays, memory boards, candles, specific decorations..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Reception Details
                  </label>
                  <textarea
                    value={formData.receptionDetails || ''}
                    onChange={(e) => handleChange('receptionDetails', e.target.value)}
                    placeholder="e.g., Casual gathering after service, light refreshments, full meal, location preferences..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Memorial Keepsakes
                  </label>
                  <textarea
                    value={formData.memorialKeepsakes || ''}
                    onChange={(e) => handleChange('memorialKeepsakes', e.target.value)}
                    placeholder="e.g., Seed packets, memorial cards, photo prints, custom items..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 border-2 border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-8 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2 font-semibold"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating your story...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Your Story</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Results */}
        {currentStep === 5 && aiOutput && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#2C2A29] flex items-center space-x-3">
                <FileText className="w-6 h-6 text-[#A5B99A]" />
                <span>Your Complete Funeral Story</span>
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Edit Inputs
                </button>
              </div>
            </div>

            {/* Ceremony Script */}
            {aiOutput.ceremonyScript && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-[#2C2A29] mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#A5B99A]" />
                  <span>Ceremony Script</span>
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                    {aiOutput.ceremonyScript}
                  </p>
                </div>
              </div>
            )}

            {/* Memorial Narrative */}
            {aiOutput.memorialNarrative && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-[#2C2A29] mb-4 flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-[#93B0C8]" />
                  <span>Memorial Narrative</span>
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                    {aiOutput.memorialNarrative}
                  </p>
                </div>
              </div>
            )}

            {/* Mood Description */}
            {aiOutput.moodDescription && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-[#2C2A29] mb-4 flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-[#A5B99A]" />
                  <span>Atmosphere & Mood</span>
                </h3>
                <p className="text-[#2C2A29] opacity-80 leading-relaxed">{aiOutput.moodDescription}</p>
              </div>
            )}

            {/* Playlist Suggestions */}
            {aiOutput.playlistSuggestions && Array.isArray(aiOutput.playlistSuggestions) && aiOutput.playlistSuggestions.length > 0 && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-[#2C2A29] mb-4 flex items-center space-x-2">
                  <Music className="w-5 h-5 text-[#93B0C8]" />
                  <span>Music Suggestions</span>
                </h3>
                <div className="space-y-3">
                  {aiOutput.playlistSuggestions.map((song: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-medium text-[#2C2A29]">{song.song || song}</div>
                      {song.artist && <div className="text-sm text-[#2C2A29] opacity-70 mt-1">{song.artist}</div>}
                      {song.reason && <div className="text-sm text-[#2C2A29] opacity-60 mt-2">{song.reason}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Output Sections */}
            {aiOutput.ceremonyTimeline && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-[#2C2A29] mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#A5B99A]" />
                  <span>Ceremony Timeline</span>
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                    {aiOutput.ceremonyTimeline}
                  </p>
                </div>
              </div>
            )}

            {aiOutput.serviceOrder && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-[#2C2A29] mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#93B0C8]" />
                  <span>Service Order</span>
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                    {aiOutput.serviceOrder}
                  </p>
                </div>
              </div>
            )}

            {aiOutput.receptionGuide && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-[#2C2A29] mb-4 flex items-center space-x-2">
                  <Coffee className="w-5 h-5 text-[#A5B99A]" />
                  <span>Reception Planning Guide</span>
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                    {aiOutput.receptionGuide}
                  </p>
                </div>
              </div>
            )}

            {aiOutput.visualDesignGuide && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-[#2C2A29] mb-4 flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-[#93B0C8]" />
                  <span>Visual Design Guide</span>
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                    {aiOutput.visualDesignGuide}
                  </p>
                </div>
              </div>
            )}

            {aiOutput.guestParticipationGuide && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-[#2C2A29] mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-[#A5B99A]" />
                  <span>Guest Participation Guide</span>
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                    {aiOutput.guestParticipationGuide}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Edit Your Inputs
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#93B0C8] to-[#A5B99A] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Regenerate Story</span>
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
