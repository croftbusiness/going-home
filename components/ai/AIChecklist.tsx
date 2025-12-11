'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle, Loader2, RefreshCw, ArrowRight, Sparkles, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ChecklistResponse } from '@/types/ai';

export default function AIChecklist() {
  const router = useRouter();
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
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-[#93B0C8]" />
          <span className="ml-3 text-sm sm:text-base text-[#2C2A29]">Loading your personalized checklist...</span>
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
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200/50 overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10 rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="p-3 bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-xl shadow-md">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#A5B99A]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2A29] mb-2">
                Your Personalized Checklist
              </h2>
              <p className="text-sm text-[#2C2A29] opacity-70">
                AI-powered suggestions based on your current progress
              </p>
            </div>
          </div>
          <button
            onClick={loadChecklist}
            disabled={loading}
            className="p-3 hover:bg-[#A5B99A]/10 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0 border border-gray-200 hover:border-[#A5B99A]"
            title="Refresh suggestions"
          >
            <RefreshCw className={`w-5 h-5 text-[#93B0C8] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mb-6 p-4 bg-gradient-to-r from-[#A5B99A]/10 to-[#93B0C8]/10 rounded-xl border border-[#A5B99A]/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-[#A5B99A]" />
              <span className="text-sm font-semibold text-[#2C2A29]">Overall Progress</span>
            </div>
            <span className="text-lg font-bold text-[#A5B99A]">{checklist.completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-[#A5B99A] via-[#93B0C8] to-[#A5B99A] h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${checklist.completionPercentage}%` }}
            />
          </div>
        </div>

      {checklist.items.length === 0 ? (
        <div className="text-center py-12">
          <div className="relative inline-block mb-4">
            <CheckCircle2 className="w-16 h-16 text-[#A5B99A] mx-auto" />
            <div className="absolute inset-0 bg-[#A5B99A]/20 rounded-full blur-xl"></div>
          </div>
          <h3 className="text-xl font-bold text-[#2C2A29] mb-2">You're All Set!</h3>
          <p className="text-[#2C2A29] opacity-70 max-w-md mx-auto">
            Great job! Your profile looks complete. We'll keep checking for new suggestions as you add more information.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {checklist.items.map((item, index) => (
            <Link
              key={item.id}
              href={item.actionUrl || '#'}
              className="group flex items-start space-x-4 p-5 bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-xl hover:border-[#A5B99A] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative"
            >
              {/* Number badge */}
              <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}
              </div>

              {/* Priority indicator bar */}
              <div className={`w-1 rounded-full flex-shrink-0 ${
                item.priority === 'high' ? 'bg-red-500' :
                item.priority === 'medium' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}></div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#2C2A29] text-base sm:text-lg mb-2 group-hover:text-[#93B0C8] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm ${
                        item.priority === 'high' ? 'bg-red-100 text-red-700' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {item.actionUrl && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 group-hover:border-[#A5B99A]/30 transition-colors">
                    <span className="text-sm font-semibold text-[#A5B99A] group-hover:text-[#93B0C8] transition-colors">
                      Get Started
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#A5B99A] group-hover:text-[#93B0C8] group-hover:translate-x-1 transition-all" />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {checklist.suggestions && checklist.suggestions.length > 0 && (
        <div className="mt-6 p-5 bg-gradient-to-r from-[#93B0C8]/10 to-[#A5B99A]/10 rounded-xl border border-[#93B0C8]/20">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-[#93B0C8]/20 rounded-lg flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#93B0C8]" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#2C2A29] mb-3 text-lg">💡 Quick Tips</h4>
              <ul className="space-y-2">
                {checklist.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-[#2C2A29] opacity-80">
                    <span className="text-[#93B0C8] mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

