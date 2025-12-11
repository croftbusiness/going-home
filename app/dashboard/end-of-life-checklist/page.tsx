'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckSquare, Save, Heart, Gift, BookOpen, Music, FileText, 
  Users, AlertTriangle, Sparkles, CheckCircle2, Circle, 
  Plus, X, Loader2, Info, Quote, Scroll, Bell, Shield
} from 'lucide-react';

interface EndOfLifeChecklist {
  organDonationPreference?: string;
  organDonationDetails?: string;
  lastWords?: string;
  finalNotes?: string;
  prayers?: string;
  scriptures?: string;
  songs?: string;
  poems?: string;
  readings?: string;
  immediateNotifications?: string[];
  doNotDoList?: string;
  specialInstructions?: string;
}

interface SectionStatus {
  id: string;
  completed: boolean;
}

export default function EndOfLifeChecklistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [formData, setFormData] = useState<EndOfLifeChecklist>({
    organDonationPreference: '',
    organDonationDetails: '',
    lastWords: '',
    finalNotes: '',
    prayers: '',
    scriptures: '',
    songs: '',
    poems: '',
    readings: '',
    immediateNotifications: [],
    doNotDoList: '',
    specialInstructions: '',
  });
  const [notificationInput, setNotificationInput] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['organDonation', 'lastWords']));
  const [sectionStatuses, setSectionStatuses] = useState<SectionStatus[]>([]);

  useEffect(() => {
    loadChecklist();
  }, []);

  useEffect(() => {
    updateSectionStatuses();
  }, [formData]);

  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (autoSaveStatus === 'idle' && hasChanges()) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [formData]);

  const hasChanges = () => {
    return Object.values(formData).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    });
  };

  const updateSectionStatuses = () => {
    const sections: SectionStatus[] = [
      { id: 'organDonation', completed: !!(formData.organDonationPreference || formData.organDonationDetails) },
      { id: 'lastWords', completed: !!formData.lastWords },
      { id: 'finalNotes', completed: !!formData.finalNotes },
      { id: 'spiritual', completed: !!(formData.prayers || formData.scriptures) },
      { id: 'ceremony', completed: !!(formData.songs || formData.poems || formData.readings) },
      { id: 'notifications', completed: !!(formData.immediateNotifications && formData.immediateNotifications.length > 0) },
      { id: 'instructions', completed: !!(formData.doNotDoList || formData.specialInstructions) },
    ];
    setSectionStatuses(sections);
  };

  const completedCount = sectionStatuses.filter(s => s.completed).length;
  const totalSections = sectionStatuses.length;
  const progressPercentage = totalSections > 0 ? (completedCount / totalSections) * 100 : 0;

  const loadChecklist = async () => {
    try {
      const response = await fetch('/api/user/end-of-life-checklist');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load data');
      }

      const data = await response.json();
      if (data.checklist) {
        setFormData({
          organDonationPreference: data.checklist.organDonationPreference || '',
          organDonationDetails: data.checklist.organDonationDetails || '',
          lastWords: data.checklist.lastWords || '',
          finalNotes: data.checklist.finalNotes || '',
          prayers: data.checklist.prayers || '',
          scriptures: data.checklist.scriptures || '',
          songs: data.checklist.songs || '',
          poems: data.checklist.poems || '',
          readings: data.checklist.readings || '',
          immediateNotifications: data.checklist.immediateNotifications || [],
          doNotDoList: data.checklist.doNotDoList || '',
          specialInstructions: data.checklist.specialInstructions || '',
        });
      }
    } catch (error) {
      setError('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (saving) return;
    
    setAutoSaveStatus('saving');
    try {
      const response = await fetch('/api/user/end-of-life-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save');

      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      setAutoSaveStatus('idle');
      console.error('Auto-save failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/user/end-of-life-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save data');

      setSuccess(true);
      setAutoSaveStatus('saved');
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError('Failed to save checklist');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setAutoSaveStatus('idle');
  };

  const addNotification = () => {
    if (notificationInput.trim()) {
      setFormData({
        ...formData,
        immediateNotifications: [...(formData.immediateNotifications || []), notificationInput.trim()],
      });
      setNotificationInput('');
      setAutoSaveStatus('idle');
    }
  };

  const removeNotification = (index: number) => {
    setFormData({
      ...formData,
      immediateNotifications: formData.immediateNotifications?.filter((_, i) => i !== index) || [],
    });
    setAutoSaveStatus('idle');
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

  const getSectionStatus = (sectionId: string) => {
    return sectionStatuses.find(s => s.id === sectionId)?.completed || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#A5B99A] animate-spin" />
          <div className="text-[#2C2A29] opacity-70">Loading your checklist...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-[#93B0C8] to-[#A5B99A] rounded-2xl shadow-lg">
                <CheckSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#2C2A29] mb-2">End-of-Life Checklist</h1>
                <p className="text-lg text-[#2C2A29] opacity-70">
                  Document your final wishes, preferences, and instructions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center space-x-2 text-sm text-[#2C2A29] opacity-60">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              {autoSaveStatus === 'saved' && (
                <div className="flex items-center space-x-2 text-sm text-[#A5B99A]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-[#93B0C8]" />
                <span className="text-sm font-medium text-[#2C2A29]">Progress</span>
              </div>
              <span className="text-sm font-semibold text-[#2C2A29]">
                {completedCount} of {totalSections} sections completed
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

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
                  Your final checklist provides clear guidance for your family during an overwhelming time. 
                  By documenting your organ donation wishes, last words, prayers, scriptures, songs, and 
                  special instructions now, you're ensuring nothing important is forgotten. Your family won't 
                  have to guess what you wanted or worry about missing something meaningful. This checklist 
                  becomes their roadmap, giving them confidence that they're honoring your wishes completely 
                  and allowing them to focus on celebrating your life rather than managing details.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Checklist saved successfully!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organ Donation Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('organDonation')}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getSectionStatus('organDonation') ? 'bg-[#A5B99A] bg-opacity-10' : 'bg-gray-100'}`}>
                  <Gift className={`w-5 h-5 ${getSectionStatus('organDonation') ? 'text-[#A5B99A]' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-[#2C2A29]">Organ Donation</h3>
                  <p className="text-sm text-[#2C2A29] opacity-60">Your wishes for organ and tissue donation</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getSectionStatus('organDonation') ? (
                  <CheckCircle2 className="w-5 h-5 text-[#A5B99A]" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <span className="text-sm text-gray-400">{expandedSections.has('organDonation') ? '−' : '+'}</span>
              </div>
            </button>
            {expandedSections.has('organDonation') && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Tip:</strong> Be specific about your wishes. This helps your family make decisions with confidence and ensures your wishes are honored.
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Organ Donation Preference *
                  </label>
                  <select
                    name="organDonationPreference"
                    value={formData.organDonationPreference}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
                  >
                    <option value="">Select your preference</option>
                    <option value="yes">Yes, I want to donate</option>
                    <option value="no">No, I do not want to donate</option>
                    <option value="unsure">Unsure / Let family decide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Additional Details
                  </label>
                  <textarea
                    name="organDonationDetails"
                    value={formData.organDonationDetails}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                    placeholder="Any specific details about organ donation, religious considerations, or special instructions..."
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {formData.organDonationDetails?.length || 0} characters
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Last Words Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('lastWords')}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getSectionStatus('lastWords') ? 'bg-[#93B0C8] bg-opacity-10' : 'bg-gray-100'}`}>
                  <Quote className={`w-5 h-5 ${getSectionStatus('lastWords') ? 'text-[#93B0C8]' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-[#2C2A29]">Last Words & Final Message</h3>
                  <p className="text-sm text-[#2C2A29] opacity-60">Your final message to loved ones</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getSectionStatus('lastWords') ? (
                  <CheckCircle2 className="w-5 h-5 text-[#A5B99A]" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <span className="text-sm text-gray-400">{expandedSections.has('lastWords') ? '−' : '+'}</span>
              </div>
            </button>
            {expandedSections.has('lastWords') && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-6">
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-800">
                    <strong>Tip:</strong> This is your opportunity to express love, gratitude, forgiveness, or anything else you want your loved ones to know. Take your time and speak from the heart.
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Your Final Message
                  </label>
                  <textarea
                    name="lastWords"
                    value={formData.lastWords}
                    onChange={handleChange}
                    rows={8}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                    placeholder="Write your final words to loved ones. This might include expressions of love, gratitude, forgiveness, or anything else you want them to know..."
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {formData.lastWords?.length || 0} characters
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Final Notes Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('finalNotes')}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getSectionStatus('finalNotes') ? 'bg-[#A5B99A] bg-opacity-10' : 'bg-gray-100'}`}>
                  <FileText className={`w-5 h-5 ${getSectionStatus('finalNotes') ? 'text-[#A5B99A]' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-[#2C2A29]">Final Notes</h3>
                  <p className="text-sm text-[#2C2A29] opacity-60">Any additional thoughts or reflections</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getSectionStatus('finalNotes') ? (
                  <CheckCircle2 className="w-5 h-5 text-[#A5B99A]" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <span className="text-sm text-gray-400">{expandedSections.has('finalNotes') ? '−' : '+'}</span>
              </div>
            </button>
            {expandedSections.has('finalNotes') && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-6">
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="finalNotes"
                    value={formData.finalNotes}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                    placeholder="Any final notes, thoughts, or reflections you'd like to share..."
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {formData.finalNotes?.length || 0} characters
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spiritual & Religious Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('spiritual')}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getSectionStatus('spiritual') ? 'bg-[#93B0C8] bg-opacity-10' : 'bg-gray-100'}`}>
                  <BookOpen className={`w-5 h-5 ${getSectionStatus('spiritual') ? 'text-[#93B0C8]' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-[#2C2A29]">Spiritual & Religious</h3>
                  <p className="text-sm text-[#2C2A29] opacity-60">Prayers, scriptures, and spiritual elements</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getSectionStatus('spiritual') ? (
                  <CheckCircle2 className="w-5 h-5 text-[#A5B99A]" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <span className="text-sm text-gray-400">{expandedSections.has('spiritual') ? '−' : '+'}</span>
              </div>
            </button>
            {expandedSections.has('spiritual') && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-6">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <strong>Tip:</strong> Include specific verses, prayers, or texts that are meaningful to you. Include book, chapter, and verse numbers for easy reference.
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Prayers
                  </label>
                  <textarea
                    name="prayers"
                    value={formData.prayers}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                    placeholder="Prayers you'd like included in your service or final moments..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Scriptures / Religious Texts
                  </label>
                  <textarea
                    name="scriptures"
                    value={formData.scriptures}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                    placeholder="Scriptures, verses, or religious texts you'd like shared (include book, chapter, verse)..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Ceremony Elements Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('ceremony')}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getSectionStatus('ceremony') ? 'bg-[#A5B99A] bg-opacity-10' : 'bg-gray-100'}`}>
                  <Music className={`w-5 h-5 ${getSectionStatus('ceremony') ? 'text-[#A5B99A]' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-[#2C2A29]">Ceremony Elements</h3>
                  <p className="text-sm text-[#2C2A29] opacity-60">Songs, poems, and readings for your service</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getSectionStatus('ceremony') ? (
                  <CheckCircle2 className="w-5 h-5 text-[#A5B99A]" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <span className="text-sm text-gray-400">{expandedSections.has('ceremony') ? '−' : '+'}</span>
              </div>
            </button>
            {expandedSections.has('ceremony') && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-6">
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start space-x-3">
                  <Music className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <strong>Tip:</strong> Include song titles, artists, and where you'd like them played. For poems and readings, include the full text or clear references.
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Songs / Music
                  </label>
                  <textarea
                    name="songs"
                    value={formData.songs}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                    placeholder="Songs or music you'd like played (include title, artist, and when to play)..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Poems
                  </label>
                  <textarea
                    name="poems"
                    value={formData.poems}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                    placeholder="Poems you'd like read (include full text or clear reference)..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Readings
                  </label>
                  <textarea
                    name="readings"
                    value={formData.readings}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                    placeholder="Other readings, passages, or literary works you'd like included..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Immediate Notifications Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('notifications')}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getSectionStatus('notifications') ? 'bg-[#93B0C8] bg-opacity-10' : 'bg-gray-100'}`}>
                  <Bell className={`w-5 h-5 ${getSectionStatus('notifications') ? 'text-[#93B0C8]' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-[#2C2A29]">Immediate Notifications</h3>
                  <p className="text-sm text-[#2C2A29] opacity-60">Who should be contacted right away</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getSectionStatus('notifications') ? (
                  <CheckCircle2 className="w-5 h-5 text-[#A5B99A]" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <span className="text-sm text-gray-400">{expandedSections.has('notifications') ? '−' : '+'}</span>
              </div>
            </button>
            {expandedSections.has('notifications') && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start space-x-3">
                  <Users className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-indigo-800">
                    <strong>Tip:</strong> Include names and contact information (phone numbers, emails) for people who should be notified immediately. Consider close family, friends, clergy, or others who need to know right away.
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Add Person to Notify
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={notificationInput}
                      onChange={(e) => setNotificationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNotification())}
                      className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
                      placeholder="Name and contact information (e.g., John Smith - 555-1234)"
                    />
                    <button
                      type="button"
                      onClick={addNotification}
                      className="px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center space-x-2 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
                {formData.immediateNotifications && formData.immediateNotifications.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2C2A29]">
                      People to Notify ({formData.immediateNotifications.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.immediateNotifications.map((notification, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-[#A5B99A] bg-opacity-10 text-[#2C2A29] rounded-lg text-sm border border-[#A5B99A] border-opacity-20"
                        >
                          {notification}
                          <button
                            type="button"
                            onClick={() => removeNotification(index)}
                            className="ml-2 text-[#A5B99A] hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Special Instructions Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('instructions')}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getSectionStatus('instructions') ? 'bg-[#A5B99A] bg-opacity-10' : 'bg-gray-100'}`}>
                  <Shield className={`w-5 h-5 ${getSectionStatus('instructions') ? 'text-[#A5B99A]' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-[#2C2A29]">Special Instructions</h3>
                  <p className="text-sm text-[#2C2A29] opacity-60">What should and shouldn't be done</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getSectionStatus('instructions') ? (
                  <CheckCircle2 className="w-5 h-5 text-[#A5B99A]" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <span className="text-sm text-gray-400">{expandedSections.has('instructions') ? '−' : '+'}</span>
              </div>
            </button>
            {expandedSections.has('instructions') && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-6">
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <strong>Important:</strong> Be clear and specific about what should NOT be done. This helps prevent misunderstandings and ensures your wishes are respected.
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    What Should NOT Be Done
                  </label>
                  <textarea
                    name="doNotDoList"
                    value={formData.doNotDoList}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                    placeholder="Things you specifically do NOT want done (e.g., no embalming, no viewing, no certain music, etc.)..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Additional Special Instructions
                  </label>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                    placeholder="Any other special instructions, wishes, or important details..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-3 font-semibold text-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Checklist</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
