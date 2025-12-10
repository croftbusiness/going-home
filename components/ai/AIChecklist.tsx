'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import type { ChecklistResponse } from '@/types/ai';

export default function AIChecklist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checklist, setChecklist] = useState<ChecklistResponse | null>(null);

  const loadChecklist = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load checklist');
      }

      const data: ChecklistResponse = await response.json();
      setChecklist(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecklist();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      personal_info: 'Personal Info',
      documents: 'Documents',
      letters: 'Letters',
      contacts: 'Contacts',
      preferences: 'Preferences',
    };
    return labels[category] || category;
  };

  if (loading && !checklist) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#93B0C8]" />
          <span className="ml-3 text-[#2C2A29]">Loading your personalized checklist...</span>
        </div>
      </div>
    );
  }

  if (error && !checklist) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={loadChecklist}
          className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!checklist) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#2C2A29] mb-2">
            Your Suggested To-Do List
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#A5B99A] h-2 rounded-full transition-all"
                  style={{ width: `${checklist.completionPercentage}%` }}
                />
              </div>
              <span className="text-sm text-[#2C2A29] opacity-70">
                {checklist.completionPercentage}% Complete
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={loadChecklist}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-[#93B0C8] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {checklist.items.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-[#2C2A29] opacity-70">
            Great job! Your profile looks complete. We'll keep checking for new suggestions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {checklist.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="pt-1">
                <Circle className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-[#2C2A29]">{item.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}
                  >
                    {item.priority}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-[#2C2A29] opacity-70">{item.description}</p>
                )}
                {item.actionUrl && (
                  <a
                    href={item.actionUrl}
                    className="text-sm text-[#93B0C8] hover:underline mt-2 inline-block"
                  >
                    Take action →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {checklist.suggestions && checklist.suggestions.length > 0 && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-[#2C2A29] mb-2">Priority Suggestions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#2C2A29] opacity-80">
                {checklist.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

