'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Save, Heart, Sparkles, Loader2, CheckCircle2, 
  ChevronDown, ChevronUp, Info, Lightbulb, Edit3, 
  MessageSquare, Plus, X, FileText, Award, Users, 
  BookHeart, GraduationCap, Camera, PenTool, HelpCircle
} from 'lucide-react';
import QuestionnaireMode from './components/QuestionnaireMode';

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
  const [mode, setMode] = useState<'write' | 'questionnaire'>(() => {
    // Default to 'write' mode, but can be changed per section
    return 'write';
  });
  const [questionnaireSection, setQuestionnaireSection] = useState<string | null>(null);
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

  const getQuestionsForSection = (sectionId: string) => {
    const questionSets: Record<string, Array<{ id: string; question: string; placeholder?: string; type: 'text' | 'textarea' }>> = {
      lifeStory: [
        { id: 'birthplace', question: 'Where were you born?', placeholder: 'City, State/Country', type: 'text' },
        { id: 'childhood', question: 'What are some of your earliest memories from childhood?', placeholder: 'Share a few key memories or experiences...', type: 'textarea' },
        { id: 'education', question: 'Tell us about your education and school experiences.', placeholder: 'Schools attended, favorite subjects, teachers who influenced you...', type: 'textarea' },
        { id: 'career', question: 'What has your career or work life been like?', placeholder: 'Jobs, career path, achievements, what you loved about your work...', type: 'textarea' },
        { id: 'relationships', question: 'Tell us about important relationships in your life.', placeholder: 'Family, friends, mentors who shaped who you are...', type: 'textarea' },
        { id: 'life_changes', question: 'What major life changes or transitions have you experienced?', placeholder: 'Moves, career changes, family changes, personal growth...', type: 'textarea' },
        { id: 'values', question: 'What values and principles have guided your life?', placeholder: 'What matters most to you? What do you stand for?', type: 'textarea' },
      ],
      majorAccomplishments: [
        { id: 'career_achievements', question: 'What are your proudest career or professional achievements?', placeholder: 'Awards, promotions, projects, recognition...', type: 'textarea' },
        { id: 'personal_achievements', question: 'What personal accomplishments are you most proud of?', placeholder: 'Goals you reached, challenges you overcame...', type: 'textarea' },
        { id: 'contributions', question: 'How have you contributed to your community or others?', placeholder: 'Volunteer work, helping others, making a difference...', type: 'textarea' },
        { id: 'skills', question: 'What skills or talents have you developed?', placeholder: 'Things you\'re good at, hobbies, crafts, abilities...', type: 'textarea' },
        { id: 'legacy', question: 'What do you hope your legacy will be?', placeholder: 'How do you want to be remembered?', type: 'textarea' },
      ],
      familyHistory: [
        { id: 'family_origin', question: 'Where did your family come from?', placeholder: 'Family heritage, country of origin, immigration story...', type: 'textarea' },
        { id: 'family_traditions', question: 'What family traditions have been important to you?', placeholder: 'Holidays, customs, rituals, celebrations...', type: 'textarea' },
        { id: 'family_stories', question: 'What stories have been passed down in your family?', placeholder: 'Family legends, memorable events, historical moments...', type: 'textarea' },
        { id: 'family_values', question: 'What values did your family teach you?', placeholder: 'Lessons, principles, beliefs passed down...', type: 'textarea' },
        { id: 'family_members', question: 'Tell us about important family members who influenced you.', placeholder: 'Parents, grandparents, siblings, extended family...', type: 'textarea' },
      ],
      faithStory: [
        { id: 'faith_journey', question: 'How would you describe your faith or spiritual journey?', placeholder: 'Your relationship with faith, spirituality, or religion...', type: 'textarea' },
        { id: 'faith_influences', question: 'Who or what has influenced your faith?', placeholder: 'People, experiences, books, events that shaped your beliefs...', type: 'textarea' },
        { id: 'faith_practices', question: 'What spiritual practices are meaningful to you?', placeholder: 'Prayer, meditation, worship, service, study...', type: 'textarea' },
        { id: 'faith_challenges', question: 'How has your faith helped you through challenges?', placeholder: 'Times when faith provided strength, guidance, or comfort...', type: 'textarea' },
        { id: 'faith_meaning', question: 'What does faith mean to you?', placeholder: 'How faith shapes your life and perspective...', type: 'textarea' },
      ],
      lessonsLearned: [
        { id: 'life_lessons', question: 'What are the most important lessons life has taught you?', placeholder: 'Wisdom you\'ve gained from experience...', type: 'textarea' },
        { id: 'mistakes', question: 'What mistakes have you learned from?', placeholder: 'Challenges that became learning opportunities...', type: 'textarea' },
        { id: 'advice', question: 'What advice would you give to younger generations?', placeholder: 'Guidance you\'d share with others...', type: 'textarea' },
        { id: 'perspective', question: 'How has your perspective on life changed over time?', placeholder: 'What you\'ve learned about what really matters...', type: 'textarea' },
        { id: 'gratitude', question: 'What are you most grateful for?', placeholder: 'People, experiences, blessings in your life...', type: 'textarea' },
      ],
      favoriteMemories: [
        { id: 'childhood_memories', question: 'What are your favorite childhood memories?', placeholder: 'Special moments, adventures, experiences from your youth...', type: 'textarea' },
        { id: 'family_memories', question: 'What are your most cherished family memories?', placeholder: 'Times with family that you treasure...', type: 'textarea' },
        { id: 'milestone_memories', question: 'What milestone moments stand out in your memory?', placeholder: 'Weddings, births, graduations, achievements...', type: 'textarea' },
        { id: 'travel_memories', question: 'What are your favorite travel or adventure memories?', placeholder: 'Places you\'ve been, experiences you\'ve had...', type: 'textarea' },
        { id: 'simple_memories', question: 'What simple, everyday moments have brought you joy?', placeholder: 'Small moments that made a big impact...', type: 'textarea' },
      ],
    };
    return questionSets[sectionId] || [];
  };

  const handleQuestionnaireComplete = async (sectionId: string, answers: Record<string, string>) => {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return;

    try {
      const response = await fetch('/api/ai/biography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          section: section.label,
          answers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Failed to generate biography';
        
        if (response.status === 503) {
          throw new Error('AI service is currently unavailable. Please try again later.');
        } else if (response.status === 429) {
          throw new Error('AI service is temporarily busy. Please wait a moment and try again.');
        } else {
          throw new Error(errorMsg);
        }
      }

      const data = await response.json();
      if (!data.result) {
        throw new Error('No content generated. Please try again.');
      }
      
      handleChange(sectionId as keyof Biography, data.result);
      setQuestionnaireSection(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Questionnaire generation failed:', error);
      setError(error.message || 'Failed to generate biography. Please try again.');
      throw error;
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
                    {/* Mode Selector */}
                    {questionnaireSection !== section.id && (
                      <div className="bg-gradient-to-r from-[#FCFAF7] to-white rounded-lg p-4 border border-gray-200 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <HelpCircle className="w-5 h-5 text-[#93B0C8]" />
                            <span className="text-sm font-medium text-[#2C2A29]">How would you like to write this section?</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setQuestionnaireSection(null)}
                            className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-[#A5B99A] hover:bg-[#A5B99A]/5 transition-all text-left"
                          >
                            <div className="flex items-center space-x-3">
                              <PenTool className="w-5 h-5 text-[#2C2A29]" />
                              <div>
                                <div className="font-medium text-[#2C2A29]">Write Yourself</div>
                                <div className="text-xs text-gray-500">Write freely in your own words</div>
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuestionnaireSection(section.id)}
                            className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-[#93B0C8] hover:bg-[#93B0C8]/5 transition-all text-left"
                          >
                            <div className="flex items-center space-x-3">
                              <Sparkles className="w-5 h-5 text-[#93B0C8]" />
                              <div>
                                <div className="font-medium text-[#2C2A29]">AI Questionnaire</div>
                                <div className="text-xs text-gray-500">Answer questions, AI writes for you</div>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Questionnaire Mode */}
                    {questionnaireSection === section.id ? (
                      <QuestionnaireMode
                        sectionId={section.id}
                        sectionLabel={section.label}
                        questions={getQuestionsForSection(section.id)}
                        onComplete={(answers) => handleQuestionnaireComplete(section.id, answers)}
                        onCancel={() => setQuestionnaireSection(null)}
                      />
                    ) : (
                      /* Write Yourself Mode */
                      <div>
                        <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                          {section.label}
                        </label>
                        <textarea
                          value={currentContent}
                          onChange={(e) => handleChange(section.id as keyof Biography, e.target.value)}
                          rows={10}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                          placeholder={`Write your ${section.label.toLowerCase()} here...`}
                        />
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {currentContent.length} characters
                        </div>
                      </div>
                    )}
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
