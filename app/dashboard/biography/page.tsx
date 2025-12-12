'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Save, Sparkles, Loader2, CheckCircle2, 
  ArrowLeft, Upload, FileText, X, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import DocumentTextExtractor from '@/components/DocumentTextExtractor';

interface BiographyData {
  sections: {
    lifeStory?: string;
    majorAccomplishments?: string;
    familyHistory?: string;
    faithStory?: string;
    lessonsLearned?: string;
    favoriteMemories?: string;
  };
  uploadedDocument?: string;
  finalBiography?: string;
}

const SECTIONS = [
  { id: 'lifeStory', label: 'Life Story', placeholder: 'Where you were born, childhood, education, career, important relationships...' },
  { id: 'majorAccomplishments', label: 'Major Accomplishments', placeholder: 'Career achievements, personal milestones, contributions to others...' },
  { id: 'familyHistory', label: 'Family History', placeholder: 'Family heritage, traditions, stories passed down, important family members...' },
  { id: 'faithStory', label: 'Faith Story', placeholder: 'Your spiritual journey, beliefs, practices, how faith has shaped your life...' },
  { id: 'lessonsLearned', label: 'Lessons Learned', placeholder: 'Important life lessons, wisdom gained, advice for future generations...' },
  { id: 'favoriteMemories', label: 'Favorite Memories', placeholder: 'Cherished moments, special experiences, milestones, simple joys...' },
];

export default function BiographyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<BiographyData>({
    sections: {},
    uploadedDocument: '',
    finalBiography: '',
  });

  useEffect(() => {
    loadBiography();
  }, []);

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
        // Check if we have a final biography (new format) or section-based (old format)
        if (data.biography.finalBiography) {
          setFormData({
            sections: {},
            uploadedDocument: data.biography.uploadedDocument || '',
            finalBiography: data.biography.finalBiography || '',
          });
        } else {
          // Old format - convert to new format
          setFormData({
            sections: {
              lifeStory: data.biography.lifeStory || '',
              majorAccomplishments: data.biography.majorAccomplishments || '',
              familyHistory: data.biography.familyHistory || '',
              faithStory: data.biography.faithStory || '',
              lessonsLearned: data.biography.lessonsLearned || '',
              favoriteMemories: data.biography.favoriteMemories || '',
            },
            uploadedDocument: '',
            finalBiography: data.biography.finalBiography || '',
          });
        }
      }
    } catch (error) {
      setError('Failed to load biography');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (sectionId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: value,
      },
    }));
  };

  const handleDocumentUpload = (text: string) => {
    setFormData(prev => ({
      ...prev,
      uploadedDocument: text,
      sections: {}, // Clear sections when document is uploaded
    }));
  };

  const handleGenerateBiography = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      // If document is uploaded, use that; otherwise use sections
      const inputData = formData.uploadedDocument 
        ? { document: formData.uploadedDocument }
        : { sections: formData.sections };

      const response = await fetch('/api/ai/biography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          ...inputData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate biography');
      }

      const data = await response.json();
      if (!data.result) {
        throw new Error('No biography generated. Please try again.');
      }

      setFormData(prev => ({
        ...prev,
        finalBiography: data.result,
      }));

      setSuccess('Biography generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to generate biography. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Save in old format for backward compatibility, but also save finalBiography
      const saveData = {
        lifeStory: formData.sections.lifeStory || '',
        majorAccomplishments: formData.sections.majorAccomplishments || '',
        familyHistory: formData.sections.familyHistory || '',
        faithStory: formData.sections.faithStory || '',
        lessonsLearned: formData.sections.lessonsLearned || '',
        favoriteMemories: formData.sections.favoriteMemories || '',
        finalBiography: formData.finalBiography || '',
        uploadedDocument: formData.uploadedDocument || '',
      };

      const response = await fetch('/api/user/biography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) throw new Error('Failed to save');

      setSuccess('Biography saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to save biography');
    } finally {
      setSaving(false);
    }
  };

  const hasContent = () => {
    return formData.uploadedDocument || 
           Object.values(formData.sections).some(v => v && v.trim().length > 0) ||
           formData.finalBiography;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#A5B99A] animate-spin" />
          <p className="text-[#2C2A29] opacity-60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/dashboard"
              className="p-1.5 sm:p-2 hover:bg-[#FAF9F7] rounded-lg transition-colors flex-shrink-0 touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#2C2A29] leading-tight">
                Personal Biography
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-0.5">
                Share your story for future generations
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm sm:text-base flex items-start space-x-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Document Upload Option */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8]" />
              <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Upload Document (Optional)</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-4">
              Upload a document with your biography, or fill out the sections below for AI to generate one.
            </p>
            <DocumentTextExtractor
              label="Upload Biography Document"
              description="Upload a PDF, Word document, or text file containing your biography"
              onTextExtracted={handleDocumentUpload}
            />
            {formData.uploadedDocument && (
              <div className="mt-4 p-3 bg-[#FAF9F7] rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-[#A5B99A]" />
                    <span className="text-sm font-medium text-[#2C2A29]">Document uploaded</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, uploadedDocument: '' }))}
                    className="p-1 hover:bg-gray-100 rounded transition-colors touch-target"
                  >
                    <X className="w-4 h-4 text-[#2C2A29] opacity-60" />
                  </button>
                </div>
                <p className="text-xs text-[#2C2A29] opacity-60">
                  {formData.uploadedDocument.length} characters
                </p>
              </div>
            )}
          </div>

          {/* Sections for AI Input */}
          {!formData.uploadedDocument && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A]" />
                <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Fill Out Sections</h2>
              </div>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-4">
                Fill out any or all of these sections. The AI will use this information to write your biography.
              </p>
              <div className="space-y-4">
                {SECTIONS.map((section) => (
                  <div key={section.id}>
                    <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                      {section.label}
                    </label>
                    <textarea
                      value={formData.sections[section.id as keyof typeof formData.sections] || ''}
                      onChange={(e) => handleSectionChange(section.id, e.target.value)}
                      placeholder={section.placeholder}
                      rows={4}
                      className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base resize-none min-h-[100px] touch-target"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Biography Button */}
          {hasContent() && !formData.finalBiography && (
            <div className="bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#A5B99A]/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 text-[#93B0C8]" />
                    <h3 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Generate Biography</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70">
                    {formData.uploadedDocument 
                      ? 'Use AI to format and enhance your uploaded document into a complete biography.'
                      : 'Use AI to create a complete biography from the sections you filled out.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateBiography}
                  disabled={generating}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium touch-target min-h-[44px]"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Biography</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Final Biography Display */}
          {formData.finalBiography && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A]" />
                  <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Your Biography</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, finalBiography: '' }))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                >
                  <X className="w-4 h-4 text-[#2C2A29] opacity-60" />
                </button>
              </div>
              <div className="prose prose-sm sm:prose-base max-w-none">
                <div className="text-sm sm:text-base text-[#2C2A29] leading-relaxed whitespace-pre-wrap">
                  {formData.finalBiography}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-[#2C2A29] opacity-60">
                  {formData.finalBiography.length} characters
                </p>
              </div>
            </div>
          )}

          {/* Save Button - Sticky on Mobile */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 -mx-3 sm:-mx-4 lg:-mx-8 px-3 sm:px-4 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors text-center text-sm sm:text-base font-medium touch-target min-h-[44px] flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasContent()}
              className="w-full sm:w-auto px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base font-medium touch-target min-h-[44px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Save Biography</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
