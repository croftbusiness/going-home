'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  placeholder?: string;
  type: 'text' | 'textarea';
}

interface QuestionnaireModeProps {
  sectionId: string;
  sectionLabel: string;
  questions: Question[];
  onComplete: (answers: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}

export default function QuestionnaireMode({
  sectionId,
  sectionLabel,
  questions,
  onComplete,
  onCancel,
}: QuestionnaireModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const isFirstStep = currentStep === 0;

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = () => {
    if (isLastStep) {
      handleGenerate();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      await onComplete(answers);
    } catch (err: any) {
      setError(err.message || 'Failed to generate biography. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentAnswer = answers[currentQuestion.id] || '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#2C2A29]">AI Questionnaire</h3>
              <p className="text-sm text-[#2C2A29] opacity-60">{sectionLabel}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Question {currentStep + 1} of {questions.length}
        </div>
      </div>

      {/* Question Card */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-[#FCFAF7] to-white rounded-lg p-6 border border-gray-200">
          <div className="mb-4">
            <label className="block text-base font-medium text-[#2C2A29] mb-3">
              {currentQuestion.question}
            </label>
            {currentQuestion.type === 'textarea' ? (
              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                rows={6}
                placeholder={currentQuestion.placeholder}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
              />
            ) : (
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
              />
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={isFirstStep || generating}
          className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!currentAnswer.trim() || generating}
          className="px-6 py-2.5 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : isLastStep ? (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Biography</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

