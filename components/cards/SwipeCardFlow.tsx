'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SwipeCard, { Card } from './SwipeCard';
import CardPreferencePrompt from './CardPreferencePrompt';
import CardCompletionState from './CardCompletionState';
import { useCardSession } from '@/hooks/useCardSession';
import { Loader2 } from 'lucide-react';

interface SwipeCardFlowProps {
  onComplete: () => void;
  onPause?: () => void; // Called when user navigates away
}

export default function SwipeCardFlow({ onComplete, onPause }: SwipeCardFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  // Only access search params after mount to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const fromCard = mounted ? searchParams.get('from_card') === 'true' : false;
  const cardId = mounted ? searchParams.get('card_id') : null;
  
  const {
    session,
    sessionItems,
    loading: sessionLoading,
    getOrCreateSession,
    markCardEngaged,
    markCardCompleted,
    getNextPendingCard,
    hasPendingCards,
    completeSession,
    resumeSession,
  } = useCardSession();

  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreferencePrompt, setShowPreferencePrompt] = useState(false);
  const [preferenceChecked, setPreferenceChecked] = useState(false);
  const [showCompletionState, setShowCompletionState] = useState(false);
  const [completedCardTitle, setCompletedCardTitle] = useState<string | undefined>();

  useEffect(() => {
    initializeFlow();
  }, []);

  const initializeFlow = async () => {
    try {
      setLoading(true);
      
      // Wait for session to load first
      await getOrCreateSession();
      
      // Check if returning from a card (from_card=true)
      if (fromCard && cardId) {
        // User completed/engaged with a card, show completion state
        // Fetch card details to get title
        try {
          const cardRes = await fetch(`/api/user/cards?session_id=${session?.id}`);
          if (cardRes.ok) {
            const cardData = await cardRes.json();
            const card = cardData.cards?.find((c: Card) => c.id === cardId);
            if (card) {
              setCompletedCardTitle(card.title);
            }
          }
        } catch (err) {
          console.error('Error fetching card details:', err);
        }
        
        setShowCompletionState(true);
        setLoading(false);
        return;
      }

      // Check if resuming existing session
      if (session && hasPendingCards()) {
        await loadSessionCards();
        setLoading(false);
        return;
      }

      // New session flow
      await checkPreferenceAndFetchCards();
    } catch (error) {
      console.error('Error initializing flow:', error);
      setError('Failed to initialize');
      setLoading(false);
    }
  };

  const loadSessionCards = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/user/cards?session_id=${session.id}`);
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error loading session cards:', error);
    }
  };

  const checkPreferenceAndFetchCards = async () => {
    try {
      // Check if we should show preference prompt
      const prefRes = await fetch('/api/user/cards/preference');
      if (prefRes.ok) {
        const prefData = await prefRes.json();
        // Show prompt after 2-3 logins if preference not set
        if (prefData.login_count >= 2 && prefData.login_count <= 3 && prefData.show_cards === true) {
          setShowPreferencePrompt(true);
        }
      }
      setPreferenceChecked(true);
      await fetchCards();
    } catch (error) {
      console.error('Error checking preference:', error);
      await fetchCards();
    }
  };

  const fetchCards = async () => {
    try {
      setLoading(true);
      console.log('Fetching cards from API...');
      const response = await fetch('/api/user/cards');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch cards:', response.status, errorData);
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();
      const fetchedCards = data.cards || [];
      
      console.log('Fetched cards response:', data);
      console.log('Fetched cards count:', fetchedCards.length);
      console.log('Fetched cards data:', fetchedCards);
      
      if (fetchedCards.length === 0) {
        // No cards available, go to dashboard
        console.log('No cards available, redirecting to dashboard');
        onComplete();
        return;
      }

      // Create session with these cards
      console.log('Creating session with cards:', fetchedCards.map((c: Card) => c.id));
      const cardIds = fetchedCards.map((card: Card) => card.id);
      const sessionRes = await fetch('/api/user/cards/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_ids: cardIds }),
      });

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        console.log('Session created successfully:', sessionData);
        setCards(fetchedCards);
        setCurrentIndex(0);
        // Refresh session hook
        await getOrCreateSession();
      } else {
        const errorData = await sessionRes.json().catch(() => ({}));
        console.error('Failed to create session:', sessionRes.status, errorData);
        // Fallback: use cards without session
        console.log('Using cards without session');
        setCards(fetchedCards);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load cards');
      // On error, go to dashboard
      setTimeout(() => onComplete(), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = async (card: Card) => {
    // Track interaction
    await trackCardInteraction(card.id, 'right');
    
    if (card.card_type === 'action' && card.linked_section) {
      // Mark as engaged before navigation
      await markCardEngaged(card.id, false);
      
      // Navigate to linked section with tracking params
      const url = new URL(card.linked_section, window.location.origin);
      url.searchParams.set('from_card', 'true');
      url.searchParams.set('card_id', card.id);
      if (session) {
        url.searchParams.set('session_id', session.id);
      }
      
      router.push(url.pathname + url.search);
      
      // Pause flow (don't complete, allow resume)
      if (onPause) {
        onPause();
      }
    } else {
      // Non-action cards: mark as completed and advance
      await markCardCompleted(card.id);
      advanceToNext();
    }
  };

  const handleSwipeLeft = async (card: Card) => {
    // Track interaction and snooze
    await trackCardInteraction(card.id, 'left');
    await snoozeCard(card.id);
    
    // Mark as snoozed in session
    if (session) {
      await fetch('/api/user/cards/session/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          card_id: card.id,
          status: 'snoozed',
        }),
      });
    }
    
    // Advance to next card
    advanceToNext();
  };

  const advanceToNext = async () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Check if there are more pending cards in session
      if (session && hasPendingCards()) {
        await loadSessionCards();
        setCurrentIndex(0);
      } else {
        // All cards shown, complete session and go to dashboard
        if (session) {
          await completeSession();
        }
        onComplete();
      }
    }
  };

  const handleContinueFromCompletion = async () => {
    setShowCompletionState(false);
    
    // Mark card as completed
    if (cardId) {
      await markCardCompleted(cardId);
    }
    
    // Load next card
    if (session && hasPendingCards()) {
      await loadSessionCards();
      setCurrentIndex(0);
    } else {
      // No more cards, complete session
      if (session) {
        await completeSession();
      }
      onComplete();
    }
  };

  const handleGoToDashboardFromCompletion = async () => {
    setShowCompletionState(false);
    
    // Mark card as engaged (exited early)
    if (cardId) {
      await markCardEngaged(cardId, true);
    }
    
    // Complete session and go to dashboard
    if (session) {
      await completeSession();
    }
    onComplete();
  };

  const trackCardInteraction = async (cardId: string, direction: 'left' | 'right') => {
    try {
      await fetch('/api/user/cards/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: cardId,
          direction,
        }),
      });
    } catch (err) {
      console.error('Error tracking interaction:', err);
    }
  };

  const snoozeCard = async (cardId: string) => {
    try {
      await fetch('/api/user/cards/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: cardId,
        }),
      });
    } catch (err) {
      console.error('Error snoozing card:', err);
    }
  };

  const handleGoToDashboard = () => {
    onComplete();
  };

  const handlePreferenceEnable = () => {
    setShowPreferencePrompt(false);
  };

  const handlePreferenceDisable = () => {
    setShowPreferencePrompt(false);
    onComplete(); // Go to dashboard if disabled
  };

  const handlePreferenceDismiss = () => {
    setShowPreferencePrompt(false);
  };

  if (loading || sessionLoading || !preferenceChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1DB954] mx-auto mb-4" />
          <p className="text-gray-600">Loading your cards...</p>
        </div>
      </div>
    );
  }

  if (showPreferencePrompt) {
    return (
      <CardPreferencePrompt
        onEnable={handlePreferenceEnable}
        onDisable={handlePreferenceDisable}
        onDismiss={handlePreferenceDismiss}
      />
    );
  }

  if (showCompletionState) {
    return (
      <CardCompletionState
        onContinue={handleContinueFromCompletion}
        onGoToDashboard={handleGoToDashboardFromCompletion}
        cardTitle={completedCardTitle}
      />
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

  // Redirect to dashboard if no cards after everything is loaded
  useEffect(() => {
    if (cards.length === 0 && !loading && preferenceChecked && !showPreferencePrompt && !showCompletionState && !error) {
      console.log('No cards available, redirecting to dashboard');
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cards.length, loading, preferenceChecked, showPreferencePrompt, showCompletionState, error]);

  if (cards.length === 0 && !loading && preferenceChecked && !showPreferencePrompt && !showCompletionState) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1DB954] mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to dashboard...</p>
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
            onSwipeLeft={() => handleSwipeLeft(card)}
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

