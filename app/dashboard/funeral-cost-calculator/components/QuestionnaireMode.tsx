'use client';

import { useState } from 'react';
import { CalculatorData } from '../hooks/useCalculator';
import { estimateCostsFromQuestionnaire, QuestionnaireAnswers } from '../utils/costEstimates';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface QuestionnaireModeProps {
  onComplete: (data: CalculatorData) => void;
}

export default function QuestionnaireMode({ onComplete }: QuestionnaireModeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});

  const questions = [
    {
      id: 'burialOrCremation',
      question: 'Do you prefer burial or cremation?',
      type: 'choice',
      options: [
        { value: 'burial', label: 'Burial', description: 'Traditional ground burial' },
        { value: 'cremation', label: 'Cremation', description: 'Cremation services' },
      ],
    },
    {
      id: 'serviceStyle',
      question: 'What style of service do you prefer?',
      type: 'choice',
      options: [
        { value: 'simple', label: 'Simple', description: 'Minimal, intimate gathering' },
        { value: 'traditional', label: 'Traditional', description: 'Standard funeral service' },
        { value: 'elaborate', label: 'Elaborate', description: 'Full traditional ceremony' },
      ],
    },
    {
      id: 'casketUrnPreference',
      question: 'What quality level for casket/urn?',
      type: 'choice',
      options: [
        { value: 'basic', label: 'Basic', description: 'Standard quality' },
        { value: 'standard', label: 'Standard', description: 'Good quality' },
        { value: 'premium', label: 'Premium', description: 'High-end quality' },
      ],
    },
    {
      id: 'flowers',
      question: 'How much would you like to spend on flowers?',
      type: 'choice',
      options: [
        { value: 'none', label: 'None', description: 'No flowers' },
        { value: 'minimal', label: 'Minimal', description: 'Basic arrangements' },
        { value: 'moderate', label: 'Moderate', description: 'Standard arrangements' },
        { value: 'extensive', label: 'Extensive', description: 'Elaborate displays' },
      ],
    },
    {
      id: 'ceremonyVenue',
      question: 'Ceremony venue preference?',
      type: 'choice',
      options: [
        { value: 'none', label: 'None', description: 'At funeral home only' },
        { value: 'basic', label: 'Basic', description: 'Simple venue' },
        { value: 'premium', label: 'Premium', description: 'Special venue' },
      ],
    },
    {
      id: 'receptionVenue',
      question: 'Reception venue preference?',
      type: 'choice',
      options: [
        { value: 'none', label: 'None', description: 'No reception' },
        { value: 'basic', label: 'Basic', description: 'Simple reception' },
        { value: 'premium', label: 'Premium', description: 'Special reception venue' },
      ],
    },
    {
      id: 'catering',
      question: 'Catering preference?',
      type: 'choice',
      options: [
        { value: 'none', label: 'None', description: 'No catering' },
        { value: 'light', label: 'Light', description: 'Light refreshments' },
        { value: 'moderate', label: 'Moderate', description: 'Standard meal' },
        { value: 'extensive', label: 'Extensive', description: 'Full catering' },
      ],
    },
    {
      id: 'transportation',
      question: 'Transportation preference?',
      type: 'choice',
      options: [
        { value: 'none', label: 'None', description: 'Family vehicles only' },
        { value: 'basic', label: 'Basic', description: 'Family vehicle service' },
        { value: 'premium', label: 'Premium', description: 'Limousine service' },
      ],
    },
    {
      id: 'memorialVideo',
      question: 'Would you like a memorial video/photo montage?',
      type: 'boolean',
    },
    {
      id: 'musician',
      question: 'Would you like live music/musician?',
      type: 'boolean',
    },
    {
      id: 'keepsakeUrns',
      question: 'Would you like keepsake urns/jewelry? (Cremation only)',
      type: 'boolean',
      conditional: answers.burialOrCremation === 'cremation',
    },
  ];

  const activeQuestions = questions.filter(q => 
    !q.conditional || (q.conditional && answers.burialOrCremation === 'cremation')
  );

  const handleAnswer = (value: any) => {
    const question = activeQuestions[currentQuestion];
    setAnswers({ ...answers, [question.id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Generate estimates
      const completeAnswers = answers as QuestionnaireAnswers;
      const estimatedCosts = estimateCostsFromQuestionnaire(completeAnswers);
      
      const calculatorData: CalculatorData = {
        burialOrCremation: completeAnswers.burialOrCremation,
        ...estimatedCosts,
      };
      
      onComplete(calculatorData);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentQ = activeQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / activeQuestions.length) * 100;
  const canProceed = answers[currentQ?.id as keyof QuestionnaireAnswers] !== undefined;

  if (activeQuestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">
            Quick Cost Estimate
          </h2>
          <span className="text-sm text-[#2C2A29] opacity-70">
            {currentQuestion + 1} of {activeQuestions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[#2C2A29] opacity-70 text-sm sm:text-base">
          Answer a few questions to get an estimated cost based on your preferences
        </p>
      </div>

      <div className="bg-[#FCFAF7] rounded-lg p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg sm:text-xl font-semibold text-[#2C2A29] mb-4 sm:mb-6">
          {currentQ.question}
        </h3>

        {currentQ.type === 'choice' && (
          <div className="space-y-3">
            {currentQ.options?.map((option) => {
              const isSelected = answers[currentQ.id as keyof QuestionnaireAnswers] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full text-left p-4 sm:p-5 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-[#A5B99A] bg-[#A5B99A] bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-[#2C2A29] text-base sm:text-lg">
                          {option.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-[#A5B99A] flex-shrink-0" />
                        )}
                      </div>
                      {option.description && (
                        <p className="text-sm text-[#2C2A29] opacity-70">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {currentQ.type === 'boolean' && (
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all ${
                answers[currentQ.id as keyof QuestionnaireAnswers] === true
                  ? 'border-[#A5B99A] bg-[#A5B99A] bg-opacity-10'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle2
                  className={`w-5 h-5 ${
                    answers[currentQ.id as keyof QuestionnaireAnswers] === true
                      ? 'text-[#A5B99A]'
                      : 'text-gray-400'
                  }`}
                />
                <span className="font-semibold text-[#2C2A29]">Yes</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all ${
                answers[currentQ.id as keyof QuestionnaireAnswers] === false
                  ? 'border-gray-400 bg-gray-100'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="font-semibold text-[#2C2A29]">No</span>
              </div>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-4 sm:px-6 py-2.5 sm:py-3 min-h-[48px] bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial text-sm sm:text-base"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="px-4 sm:px-6 py-2.5 sm:py-3 min-h-[48px] bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial text-sm sm:text-base font-medium"
        >
          {currentQuestion === activeQuestions.length - 1 ? 'Generate Estimate' : 'Next'}
        </button>
      </div>
    </div>
  );
}



