'use client';

import { ArrowRight, Home } from 'lucide-react';

interface CardCompletionStateProps {
  onContinue: () => void;
  onGoToDashboard: () => void;
  cardTitle?: string;
}

export default function CardCompletionState({ onContinue, onGoToDashboard, cardTitle }: CardCompletionStateProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#1DB954]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#1DB954]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {cardTitle ? `Great progress on "${cardTitle}"!` : 'Great progress!'}
          </h3>
          <p className="text-gray-600">
            Your changes have been saved. Would you like to continue with your cards or go to the dashboard?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onContinue}
            className="w-full px-6 py-3 bg-[#1DB954] text-white rounded-lg font-medium hover:bg-[#1ed760] transition-colors flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onGoToDashboard}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

