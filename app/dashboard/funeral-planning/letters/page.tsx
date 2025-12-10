'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Sparkles, Loader2, Plus, Edit2, CheckCircle } from 'lucide-react';
import { getLetters, generateLetter, updateLetter } from '@/lib/api/funeral';
import type { FuneralLetter } from '@/types/funeral';

const letterTypes = [
  { value: 'friends', label: 'To My Friends', description: 'A message for your friends' },
  { value: 'spouse', label: 'To My Spouse/Partner', description: 'A message for your spouse or partner' },
  { value: 'children', label: 'To My Children', description: 'A message for your children' },
  { value: 'everyone', label: 'To Everyone Attending', description: 'A message for all who attend' },
  { value: 'final_words', label: 'My Final Words', description: 'Final words of encouragement' },
] as const;

export default function FuneralLettersPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [letters, setLetters] = useState<FuneralLetter[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    letterType: 'friends' as typeof letterTypes[number]['value'],
    recipientDescription: '',
    keyPoints: [] as string[],
    tone: 'loving' as 'loving' | 'encouraging' | 'reflective' | 'grateful' | 'hopeful',
    draftContent: '',
    finalContent: '',
  });
  const [currentPoint, setCurrentPoint] = useState('');

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    try {
      const data = await getLetters();
      setLetters(data);
    } catch (error) {
      console.error('Error loading letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoint = () => {
    if (currentPoint.trim()) {
      setFormData(prev => ({
        ...prev,
        keyPoints: [...prev.keyPoints, currentPoint.trim()],
      }));
      setCurrentPoint('');
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const result = await generateLetter({
        letterType: formData.letterType,
        recipientDescription: formData.recipientDescription,
        keyPoints: formData.keyPoints.length > 0 ? formData.keyPoints : undefined,
        tone: formData.tone,
        id: editingId || undefined,
      });
      setFormData(prev => ({
        ...prev,
        draftContent: result.aiOutput.draft,
      }));
      if (result.letter) {
        await loadLetters();
        setEditingId(result.letter.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate letter');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.finalContent && !formData.draftContent) {
      setError('Please add content to save');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateLetter(editingId, formData.finalContent || formData.draftContent);
        setSuccess('Letter saved successfully!');
      } else {
        setError('Please generate a letter first');
      }
      await loadLetters();
      setTimeout(() => {
        setSuccess('');
        handleCancel();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save letter');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (letter: FuneralLetter) => {
    setFormData({
      letterType: letter.letter_type,
      recipientDescription: letter.recipient_description || '',
      keyPoints: [],
      tone: 'loving',
      draftContent: letter.draft_content || '',
      finalContent: letter.final_content || '',
    });
    setEditingId(letter.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      letterType: 'friends',
      recipientDescription: '',
      keyPoints: [],
      tone: 'loving',
      draftContent: '',
      finalContent: '',
    });
    setCurrentPoint('');
  };

  const handleNewLetter = (type: typeof letterTypes[number]['value']) => {
    const existing = letters.find(l => l.letter_type === type);
    if (existing) {
      handleEdit(existing);
    } else {
      setFormData({
        letterType: type,
        recipientDescription: '',
        keyPoints: [],
        tone: 'loving',
        draftContent: '',
        finalContent: '',
      });
      setEditingId(null);
      setShowForm(true);
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
                Letters to Be Read
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Write letters to your loved ones to be read at your service
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
              <Mail className="w-6 h-6 text-[#A5B99A]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#2C2A29] mb-2">
                Share your heart with those you love
              </h2>
              <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 leading-relaxed">
                Write personal letters to be read at your service. These messages will bring comfort, 
                love, and encouragement to those who matter most to you.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>
        )}

        {/* Letter Type Selection */}
        {!showForm && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {letterTypes.map((type) => {
              const existing = letters.find(l => l.letter_type === type.value);
              return (
                <button
                  key={type.value}
                  onClick={() => handleNewLetter(type.value)}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#A5B99A] hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Mail className="w-6 h-6 text-[#A5B99A] group-hover:text-[#93B0C8] transition-colors" />
                    {existing && <CheckCircle className="w-5 h-5 text-[#A5B99A]" />}
                  </div>
                  <h3 className="text-lg font-semibold text-[#2C2A29] mb-2">{type.label}</h3>
                  <p className="text-sm text-[#2C2A29] opacity-70">{type.description}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Existing Letters List */}
        {!showForm && letters.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Your Letters</h3>
            <div className="space-y-3">
              {letters.map((letter) => {
                const typeInfo = letterTypes.find(t => t.value === letter.letter_type);
                return (
                  <div
                    key={letter.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-[#2C2A29]">{typeInfo?.label || letter.letter_type}</h4>
                      <p className="text-sm text-[#2C2A29] opacity-70">
                        {(letter.final_content || letter.draft_content || '').substring(0, 100)}...
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(letter)}
                      className="ml-4 p-2 text-[#93B0C8] hover:bg-white rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Letter Form */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-[#2C2A29] mb-6">
              {editingId ? 'Edit Letter' : 'Write New Letter'}
            </h3>

            <div className="space-y-6">
              {/* Letter Type (read-only if editing) */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Letter Type
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-[#2C2A29]">
                  {letterTypes.find(t => t.value === formData.letterType)?.label}
                </div>
              </div>

              {/* Recipient Description */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Recipient Details <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={formData.recipientDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientDescription: e.target.value }))}
                  placeholder="Describe the recipient(s) to help personalize the letter..."
                  rows={2}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target resize-y"
                />
              </div>

              {/* Key Points */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Key Points to Include <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentPoint}
                    onChange={(e) => setCurrentPoint(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPoint();
                      }
                    }}
                    placeholder="e.g., Express gratitude, share a memory..."
                    className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                  />
                  <button
                    onClick={handleAddPoint}
                    className="px-4 py-3 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors touch-target"
                  >
                    Add
                  </button>
                </div>
                {formData.keyPoints.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.keyPoints.map((point, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 bg-[#A5B99A] bg-opacity-10 text-[#2C2A29] rounded-full text-sm"
                      >
                        {point}
                        <button
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            keyPoints: prev.keyPoints.filter((_, i) => i !== idx),
                          }))}
                          className="ml-2 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Tone
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value as any }))}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                >
                  <option value="loving">Loving</option>
                  <option value="encouraging">Encouraging</option>
                  <option value="reflective">Reflective</option>
                  <option value="grateful">Grateful</option>
                  <option value="hopeful">Hopeful</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full px-6 py-3 min-h-[48px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your letter...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {formData.draftContent ? 'Regenerate Letter' : 'Generate Letter with AI'}
                  </>
                )}
              </button>

              {/* Draft Content */}
              {formData.draftContent && (
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    AI-Generated Draft (Edit as needed)
                  </label>
                  <textarea
                    value={formData.draftContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, draftContent: e.target.value }))}
                    rows={12}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target resize-y"
                  />
                </div>
              )}

              {/* Final Content */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Final Letter Content {!formData.draftContent && <span className="text-gray-400">(Write your letter)</span>}
                </label>
                <textarea
                  value={formData.finalContent || formData.draftContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, finalContent: e.target.value }))}
                  rows={12}
                  placeholder="Write your letter here, or use the AI-generated draft above as a starting point..."
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors touch-target"
                >
                  Cancel
                </button>
                {editingId && (
                  <button
                    onClick={handleSave}
                    disabled={saving || (!formData.finalContent && !formData.draftContent)}
                    className="flex-1 px-6 py-3 min-h-[48px] text-base bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Letter'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

