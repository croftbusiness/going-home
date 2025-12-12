'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import SwipeCard, { Card } from './SwipeCard';
import { Loader2 } from 'lucide-react';

interface SwipeCardFlowProps {
  onComplete: () => void;
  onPause?: () => void;
}

function SwipeCardFlowContent({ onComplete, onPause }: SwipeCardFlowProps) {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/cards');
      
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();
      const fetchedCards = data.cards || [];
      
      if (fetchedCards.length === 0) {
        onComplete();
        return;
      }

      setCards(fetchedCards);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load cards');
      setTimeout(() => onComplete(), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = async (card: Card) => {
    if (card.card_type === 'action' && card.linked_section) {
      router.push(card.linked_section);
      if (onPause) {
        onPause();
      }
    } else {
      advanceToNext();
    }
  };

  const handleSwipeLeft = async () => {
    advanceToNext();
  };

  const advanceToNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleGoToDashboard = () => {
    onComplete();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1DB954] mx-auto mb-4" />
          <p className="text-gray-600">Loading your cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleGoToDashboard}
            className="px-6 py-3 bg-[#1DB954] text-white rounded-lg font-medium hover:bg-[#1ed760] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <div className="text-center">
          <p className="text-gray-600">No cards available</p>
          <button
            onClick={handleGoToDashboard}
            className="mt-4 px-6 py-3 bg-[#1DB954] text-white rounded-lg font-medium hover:bg-[#1ed760] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 overflow-hidden" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="w-full max-w-sm relative" style={{ height: '480px', maxHeight: '85vh' }}>
        {cards.map((card, index) => (
          <SwipeCard
            key={card.id}
            card={card}
            onSwipeRight={() => handleSwipeRight(card)}
            onSwipeLeft={handleSwipeLeft}
            onGoToDashboard={handleGoToDashboard}
            isActive={index === currentIndex}
          />
        ))}
        
        {/* Card counter */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
          {currentIndex + 1} of {cards.length}
        </div>
      </div>
    </div>
  );
}

export default function SwipeCardFlow({ onComplete, onPause }: SwipeCardFlowProps) {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1DB954] mx-auto mb-4" />
          <p className="text-gray-600">Loading cards...</p>
        </div>
      </div>
    }>
      <SwipeCardFlowContent onComplete={onComplete} onPause={onPause} />
    </Suspense>
  );
}
