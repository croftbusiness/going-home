'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Save, Heart, Sparkles, Loader2, CheckCircle2, 
  ChevronDown, ChevronUp, Info, Lightbulb, Edit3, 
  MessageSquare, Plus, X, FileText, Award, Users, 
  BookHeart, GraduationCap, Camera
} from 'lucide-react';

interface Biography {
  lifeStory?: string;
  majorAccomplishments?: string;
  familyHistory?: string;
  faithStory?: string;
  lessonsLearned?: string;
  favoriteMemories?: string;
}

interface SectionStatus {
  id: string;
  completed: boolean;
}

const SECTIONS = [
  { id: 'lifeStory', label: 'Life Story', icon: BookOpen, color: 'bg-[#A5B99A]', description: 'Your journey from beginning to now' },
  { id: 'majorAccomplishments', label: 'Major Accomplishments', icon: Award, color: 'bg-[#93B0C8]', description: 'Your proudest achievements' },
  { id: 'familyHistory', label: 'Family History', icon: Users, color: 'bg-[#A5B99A]', description: 'Your family heritage and traditions' },
  { id: 'faithStory', label: 'Faith Story', icon: BookHeart, color: 'bg-[#93B0C8]', description: 'Your spiritual journey' },
  { id: 'lessonsLearned', label: 'Lessons Learned', icon: GraduationCap, color: 'bg-[#A5B99A]', description: 'Wisdom from your experiences' },
  { id: 'favoriteMemories', label: 'Favorite Memories', icon: Camera, color: 'bg-[#93B0C8]', description: 'Your most cherished moments' },
];

export default function BiographyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['lifeStory']));
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<Biography>({
    lifeStory: '',
    majorAccomplishments: '',
    familyHistory: '',
    faithStory: '',
    lessonsLearned: '',
    favoriteMemories: '',
  });
  const [sectionStatuses, setSectionStatuses] = useState<SectionStatus[]>([]);

  useEffect(() => {
    loadBiography();
  }, []);

  useEffect(() => {
    updateSectionStatuses();
  }, [formData]);

  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (autoSaveStatus === 'idle' && hasChanges()) {
        handleAutoSave();
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [formData]);

  const hasChanges = () => {
    return Object.values(formData).some(value => value !== '' && value !== null && value !== undefined);
  };

  const updateSectionStatuses = () => {
    const sections: SectionStatus[] = SECTIONS.map(section => ({
      id: section.id,
      completed: !!(formData[section.id as keyof Biography] && formData[section.id as keyof Biography]!.trim().length > 0),
    }));
    setSectionStatuses(sections);
  };

  const completedCount = sectionStatuses.filter(s => s.completed).length;
  const totalSections = sectionStatuses.length;
  const progressPercentage = totalSections > 0 ? (completedCount / totalSections) * 100 : 0;

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

  const handleAutoSave = async () => {
    if (saving) return;
    
    setAutoSaveStatus('saving');
    try {
      const response = await fetch('/api/user/biography', {
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
      const response = await fetch('/api/user/biography', {
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
      setError('Failed to save biography');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Biography, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
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

  const isLoadingForSection = (action: string, sectionId: string) => {
    return aiLoading === `${action}-${sectionId}`;
  };

  const handleAIAction = async (action: 'suggest' | 'expand' | 'questions' | 'improve', sectionId: string) => {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return;

    setAiLoading(`${action}-${sectionId}`);
    try {
      const response = await fetch('/api/ai/biography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          section: section.label,
          content: formData[sectionId as keyof Biography] || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate AI content');
      }

      const data = await response.json();
      if (!data.result) {
        throw new Error('No content generated. Please try again.');
      }
      
      if (action === 'expand' || action === 'improve') {
        handleChange(sectionId as keyof Biography, data.result);
      } else {
        setAiSuggestions({
          ...aiSuggestions,
          [sectionId]: data.result,
        });
      }
    } catch (error: any) {
      console.error('AI action failed:', error);
      setError(error.message || 'Failed to generate AI content. Please try again.');
    } finally {
      setAiLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#A5B99A] animate-spin" />
          <div className="text-[#2C2A29] opacity-70">Loading your biography...</div>
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
              <div className="p-4 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#2C2A29] mb-2">Personal Biography</h1>
                <p className="text-lg text-[#2C2A29] opacity-70">
                  Preserve your story for generations to come
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
                  Your biography preserves your story for generations to come. By documenting your life journey, 
                  accomplishments, family history, faith story, and lessons learned, you're creating a precious 
                  legacy. Future generations will be able to know who you were, what mattered to you, and the 
                  wisdom you gained. This biography helps your family celebrate you authentically, share your 
                  story with others, and ensures your memory lives on in a meaningful way long after you're gone.
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
              <span>Biography saved successfully!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {SECTIONS.map((section) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            const isCompleted = getSectionStatus(section.id);
            const currentContent = formData[section.id as keyof Biography] || '';
            const isLoading = aiLoading !== null && aiLoading.includes(section.id);

            return (
              <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${isCompleted ? section.color + ' bg-opacity-10' : 'bg-gray-100'}`}>
                      <SectionIcon className={`w-5 h-5 ${isCompleted ? 'text-' + section.color.replace('bg-', '') : 'text-gray-400'}`} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-[#2C2A29]">{section.label}</h3>
                      <p className="text-sm text-[#2C2A29] opacity-60">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-[#A5B99A]" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className="text-sm text-gray-400">{isExpanded ? '−' : '+'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-6">
                    {/* AI Help Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-[#2C2A29]">AI Writing Assistant</h4>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleAIAction('questions', section.id)}
                          disabled={!!aiLoading}
                          className="px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm disabled:opacity-50 flex items-center space-x-2"
                        >
                          {isLoadingForSection('questions', section.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Lightbulb className="w-4 h-4" />
                          )}
                          <span>Get Questions</span>
                        </button>
                        {currentContent && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAIAction('expand', section.id)}
                              disabled={!!aiLoading}
                              className="px-3 py-2 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm disabled:opacity-50 flex items-center space-x-2"
                            >
                              {isLoadingForSection('expand', section.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                              <span>Expand</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAIAction('improve', section.id)}
                              disabled={!!aiLoading}
                              className="px-3 py-2 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm disabled:opacity-50 flex items-center space-x-2"
                            >
                              {isLoadingForSection('improve', section.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Edit3 className="w-4 h-4" />
                              )}
                              <span>Improve</span>
                            </button>
                          </>
                        )}
                      </div>
                      {aiSuggestions[section.id] && (
                        <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-medium text-blue-700">AI Suggestions:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newSuggestions = { ...aiSuggestions };
                                delete newSuggestions[section.id];
                                setAiSuggestions(newSuggestions);
                              }}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-sm text-[#2C2A29] whitespace-pre-wrap">
                            {aiSuggestions[section.id]}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Text Area */}
                    <div>
                      <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                        {section.label}
                      </label>
                      <textarea
                        value={currentContent}
                        onChange={(e) => handleChange(section.id as keyof Biography, e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                        placeholder={`Write your ${section.label.toLowerCase()} here...`}
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {currentContent.length} characters
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

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
                  <span>Save Biography</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
