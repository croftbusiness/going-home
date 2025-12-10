'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Wand2, Lightbulb, Check } from 'lucide-react';
import type { LegacyMessageRequest, LegacyMessageResponse } from '@/types/ai';

interface LegacyMessageCoachProps {
  initialText?: string;
  onSave?: (improvedText: string, title?: string) => void;
}

export default function LegacyMessageCoach({ initialText = '', onSave }: LegacyMessageCoachProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messageText, setMessageText] = useState(initialText);
  const [result, setResult] = useState<LegacyMessageResponse | null>(null);
  const [action, setAction] = useState<'improve' | 'suggest' | null>(null);

  const handleAction = async (actionType: 'improve' | 'suggest') => {
    if (!messageText.trim() || messageText.trim().length < 10) {
      setError('Please enter at least 10 characters of text');
      return;
    }

    setLoading(true);
    setError('');
    setAction(actionType);
    setResult(null);

    try {
      const request: LegacyMessageRequest = {
        messageText,
        action: actionType,
      };

      const response = await fetch('/api/ai/legacy-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process message');
      }

      const data: LegacyMessageResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to process message');
    } finally {
      setLoading(false);
    }
  };

  const handleUseImproved = () => {
    if (result?.improvedText) {
      setMessageText(result.improvedText);
      setResult(null);
      setAction(null);
    }
  };

  const handleSave = () => {
    if (result?.improvedText && onSave) {
      onSave(result.improvedText, result.title);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-[#93B0C8] bg-opacity-10 rounded-lg">
            <Sparkles className="w-5 h-5 text-[#93B0C8]" />
          </div>
          <h3 className="text-lg font-semibold text-[#2C2A29]">AI Message Coach</h3>
        </div>

        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type or paste your legacy message here..."
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent min-h-[200px] resize-y touch-target"
        />

        {error && (
          <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => handleAction('improve')}
            disabled={loading || !messageText.trim()}
            className="flex-1 px-4 py-3 min-h-[48px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
          >
            {loading && action === 'improve' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Improving...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Improve Message</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleAction('suggest')}
            disabled={loading || !messageText.trim()}
            className="flex-1 px-4 py-3 min-h-[48px] text-base border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
          >
            {loading && action === 'suggest' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                <span>Generate Ideas</span>
              </>
            )}
          </button>
        </div>
      </div>

      {result?.improvedText && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h4 className="font-semibold text-[#2C2A29] mb-3">Improved Version</h4>
          <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200 mb-4">
            <p className="whitespace-pre-wrap text-[#2C2A29] leading-relaxed">
              {result.improvedText}
            </p>
          </div>
          {result.title && (
            <div className="mb-4">
              <p className="text-sm text-[#2C2A29] opacity-70 mb-1">Suggested Title:</p>
              <p className="font-medium text-[#2C2A29]">{result.title}</p>
            </div>
          )}
          <div className="flex space-x-3">
            <button
              onClick={handleUseImproved}
              className="px-4 py-2 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Use This Version
            </button>
            {onSave && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
            )}
          </div>
        </div>
      )}

      {result?.suggestions && result.suggestions.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-[#2C2A29] mb-3">Content Suggestions</h4>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-[#2C2A29]">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

