import { useState, useEffect, useCallback } from 'react';

export interface CardSession {
  id: string;
  created_at: string;
  completed_at: string | null;
  is_active: boolean;
}

export interface CardSessionItem {
  id: string;
  session_id: string;
  card_id: string;
  status: 'pending' | 'engaged' | 'completed' | 'snoozed';
  origin: 'card' | 'dashboard';
  exited_early: boolean;
  completed_at: string | null;
  engaged_at: string | null;
  card?: {
    id: string;
    card_type: 'action' | 'affirmation' | 'reflection';
    title: string;
    description: string;
    linked_section: string | null;
  };
}

export function useCardSession() {
  const [session, setSession] = useState<CardSession | null>(null);
  const [sessionItems, setSessionItems] = useState<CardSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get or create active session
  const getOrCreateSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/cards/session');
      
      if (!response.ok) {
        throw new Error('Failed to get session');
      }

      const data = await response.json();
      setSession(data.session);
      setSessionItems(data.items || []);
      return data.session;
    } catch (err) {
      console.error('Error getting session:', err);
      setError('Failed to load session');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark card as engaged (user started but exited early)
  const markCardEngaged = useCallback(async (cardId: string, exitedEarly: boolean = false) => {
    if (!session) return;

    try {
      const response = await fetch('/api/user/cards/session/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          card_id: cardId,
          status: 'engaged',
          exited_early: exitedEarly,
        }),
      });

      if (response.ok) {
        await getOrCreateSession(); // Refresh session items
      }
    } catch (err) {
      console.error('Error marking card as engaged:', err);
    }
  }, [session, getOrCreateSession]);

  // Mark card as completed
  const markCardCompleted = useCallback(async (cardId: string) => {
    if (!session) return;

    try {
      const response = await fetch('/api/user/cards/session/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          card_id: cardId,
          status: 'completed',
        }),
      });

      if (response.ok) {
        await getOrCreateSession(); // Refresh session items
      }
    } catch (err) {
      console.error('Error marking card as completed:', err);
    }
  }, [session, getOrCreateSession]);

  // Get next pending card
  const getNextPendingCard = useCallback(() => {
    return sessionItems.find(item => item.status === 'pending');
  }, [sessionItems]);

  // Check if session has pending cards
  const hasPendingCards = useCallback(() => {
    return sessionItems.some(item => item.status === 'pending');
  }, [sessionItems]);

  // Complete session
  const completeSession = useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/user/cards/session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
        }),
      });

      if (response.ok) {
        setSession(null);
        setSessionItems([]);
      }
    } catch (err) {
      console.error('Error completing session:', err);
    }
  }, [session]);

  // Resume session (return to next card)
  const resumeSession = useCallback(async () => {
    await getOrCreateSession();
  }, [getOrCreateSession]);

  useEffect(() => {
    // Only fetch on client side
    if (typeof window !== 'undefined') {
      getOrCreateSession();
    }
  }, [getOrCreateSession]);

  return {
    session,
    sessionItems,
    loading,
    error,
    getOrCreateSession,
    markCardEngaged,
    markCardCompleted,
    getNextPendingCard,
    hasPendingCards,
    completeSession,
    resumeSession,
  };
}

