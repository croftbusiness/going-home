'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Save, RefreshCw, X } from 'lucide-react';
import type { AILetterRequest, AILetterResponse } from '@/types/ai';

interface AILetterGeneratorProps {
  onSave?: (draftText: string) => void;
  onClose?: () => void;
}

export default function AILetterGenerator({ onSave, onClose }: AILetterGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<AILetterResponse | null>(null);
  const [formData, setFormData] = useState<AILetterRequest>({
    recipientName: '',
    relationship: '',
    tone: 'heartfelt',
    topics: [],
  });
  const [topicInput, setTopicInput] = useState('');

  const handleGenerate = async () => {
    if (!formData.recipientName || !formData.relationship) {
      setError('Please fill in recipient name and relationship');
      return;
    }

    setLoading(true);
    setError('');
    setDraft(null);

    try {
      const response = await fetch('/api/ai/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate letter');
      }

      const data: AILetterResponse = await response.json();
      setDraft(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate letter');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = () => {
    if (topicInput.trim()) {
      setFormData({
        ...formData,
        topics: [...formData.topics, topicInput.trim()],
      });
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (index: number) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    if (draft?.draftText && onSave) {
      onSave(draft.draftText);
      if (onClose) onClose();
    }
  };

  const handleRegenerate = () => {
    setDraft(null);
    handleGenerate();
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="p-2 bg-[#93B0C8] bg-opacity-10 rounded-lg flex-shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#93B0C8]" />
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#2C2A29] truncate">AI Letter Generator</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {!draft ? (
        <div className="space-y-6">
          <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-[#2C2A29] opacity-70">
              ✨ Our AI will help you craft a meaningful letter to your loved one.
              You can review and edit the draft before saving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Recipient Name *
              </label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                placeholder="e.g., Sarah"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Relationship *
              </label>
              <input
                type="text"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                placeholder="e.g., Daughter, Friend, Spouse"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Tone
            </label>
            <select
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
            >
              <option value="heartfelt">Heartfelt</option>
              <option value="spiritual">Spiritual</option>
              <option value="humorous">Humorous</option>
              <option value="legacy">Legacy (Wisdom & Values)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Topics to Include (Optional)
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="e.g., Childhood memories, Life lessons"
              />
              <button
                onClick={handleAddTopic}
                className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
              >
                Add
              </button>
            </div>
            {formData.topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-2 px-3 py-1 bg-[#93B0C8] bg-opacity-10 text-[#2C2A29] rounded-full text-sm"
                  >
                    <span>{topic}</span>
                    <button
                      onClick={() => handleRemoveTopic(index)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-6 py-3 min-h-[48px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Letter</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#FAF9F7] rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Generated Draft</h3>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-[#2C2A29] leading-relaxed">
                {draft.draftText}
              </p>
            </div>
          </div>

          {draft.suggestions && draft.suggestions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-[#2C2A29] mb-2">Suggestions for Improvement:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#2C2A29] opacity-80">
                {draft.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Regenerate</span>
            </button>
            {onSave && (
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Save Draft</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

