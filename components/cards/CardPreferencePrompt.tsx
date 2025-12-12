'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CardPreferencePromptProps {
  onEnable: () => void;
  onDisable: () => void;
  onDismiss: () => void;
}

export default function CardPreferencePrompt({ onEnable, onDisable, onDismiss }: CardPreferencePromptProps) {
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    try {
      await fetch('/api/user/cards/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_cards: true }),
      });
      onEnable();
    } catch (error) {
      console.error('Error enabling cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await fetch('/api/user/cards/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_cards: false }),
      });
      onDisable();
    } catch (error) {
      console.error('Error disabling cards:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">Cards on Login</h3>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Would you like to see helpful cards when you log in? These cards guide you through next steps and important tasks.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleDisable}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            No Thanks
          </button>
          <button
            onClick={handleEnable}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[#1DB954] text-white rounded-lg font-medium hover:bg-[#1ed760] transition-colors disabled:opacity-50"
          >
            Yes, Show Cards
          </button>
        </div>
      </div>
    </div>
  );
}

