import { useRouter, useSearchParams } from 'next/navigation';
import { useCardSession } from './useCardSession';

/**
 * Hook to handle navigation from cards and track completion
 */
export function useCardNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { markCardCompleted, markCardEngaged } = useCardSession();

  const fromCard = searchParams.get('from_card') === 'true';
  const cardId = searchParams.get('card_id');
  const sessionId = searchParams.get('session_id');

  /**
   * Mark card as completed and return to cards
   */
  const completeCardTask = async () => {
    if (cardId) {
      await markCardCompleted(cardId);
    }
    
    // Return to cards flow
    router.push('/dashboard/cards?from_card=true&card_id=' + cardId);
  };

  /**
   * Mark card as engaged (exited early) and go to dashboard
   */
  const exitCardTask = async () => {
    if (cardId) {
      await markCardEngaged(cardId, true);
    }
    
    // Go to dashboard (clear card params)
    router.push('/dashboard');
  };

  /**
   * Check if user came from a card
   */
  const isFromCard = () => {
    return fromCard && cardId !== null;
  };

  /**
   * Get the card ID if from card
   */
  const getCardId = () => {
    return cardId;
  };

  return {
    fromCard,
    cardId,
    sessionId,
    completeCardTask,
    exitCardTask,
    isFromCard,
    getCardId,
  };
}

