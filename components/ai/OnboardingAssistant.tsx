'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import type { OnboardingResponse } from '@/types/ai';

interface OnboardingAssistantProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function OnboardingAssistant({ onComplete, onSkip }: OnboardingAssistantProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<OnboardingResponse | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadNextStep();
  }, []);

  const loadNextStep = async (response?: string) => {
    setSubmitting(true);
    setError('');

    try {
      const body: any = {};
      if (currentStep?.currentStep.id) {
        body.currentStep = currentStep.currentStep.id;
      }
      if (response) {
        body.userResponse = response;
      }

      const res = await fetch('/api/ai/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load step');
      }

      const data: OnboardingResponse = await res.json();
      setCurrentStep(data);
      setUserResponse('');
      setLoading(false);

      if (data.completed && onComplete) {
        setTimeout(() => onComplete(), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load step');
      setLoading(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userResponse.trim() || !currentStep?.currentStep.fieldName) {
      loadNextStep(userResponse.trim());
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      loadNextStep('skip');
    }
  };

  if (loading && !currentStep) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#93B0C8]" />
          <span className="ml-3 text-[#2C2A29]">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentStep) return null;

  const step = currentStep.currentStep;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#93B0C8] bg-opacity-10 rounded-lg">
            <MessageCircle className="w-5 h-5 text-[#93B0C8]" />
          </div>
          <h2 className="text-xl font-semibold text-[#2C2A29]">Getting Started</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-[#2C2A29] opacity-70">
            {currentStep.progress}% Complete
          </span>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#A5B99A] h-2 rounded-full transition-all"
              style={{ width: `${currentStep.progress}%` }}
            />
          </div>
        </div>
      </div>

      {currentStep.completed ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#2C2A29] mb-2">You're All Set!</h3>
          <p className="text-[#2C2A29] opacity-70 mb-6">
            You can always add more information later. Take your time, and remember we're here to support you.
          </p>
        </div>
      ) : (
        <>
          {step.explanation && (
            <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200 mb-6">
              <p className="text-sm text-[#2C2A29] opacity-80">{step.explanation}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium text-[#2C2A29] mb-4">{step.question}</h3>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step.fieldType === 'select' && step.options ? (
                <div className="space-y-2">
                  {step.options.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setUserResponse(option);
                        setTimeout(() => loadNextStep(option), 300);
                      }}
                      className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#A5B99A] transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : step.fieldType === 'date' ? (
                <input
                  type="date"
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  required={step.fieldName ? true : false}
                />
              ) : step.fieldType === 'textarea' ? (
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent min-h-[100px] resize-y"
                  required={step.fieldName ? true : false}
                />
              ) : (
                <input
                  type="text"
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  required={step.fieldName ? true : false}
                />
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting || (step.fieldName && !userResponse.trim())}
                  className="flex-1 px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                {onSkip && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-6 py-3 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Skip
                  </button>
                )}
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

