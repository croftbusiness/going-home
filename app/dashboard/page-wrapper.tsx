'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import DashboardPage from './page';

export default function DashboardPageWrapper() {
  const router = useRouter();
  const { isMobile } = useDeviceDetection();
  const [shouldShowCards, setShouldShowCards] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCardPreference();
  }, []);

  const checkCardPreference = async () => {
    try {
      // Check if user wants to see cards
      const response = await fetch('/api/user/cards/preference');
      if (response.ok) {
        const data = await response.json();
        // Only show cards on mobile devices (Tinder-style swipe experience)
        if (isMobile && data.show_cards !== false) {
          // Check login count to show preference prompt after 2-3 logins
          const cardsResponse = await fetch('/api/user/cards');
          if (cardsResponse.ok) {
            const cardsData = await cardsResponse.json();
            if (cardsData.cards && cardsData.cards.length > 0) {
              router.push('/dashboard');
              return;
            }
          }
        }
      }
      setShouldShowCards(false);
    } catch (error) {
      console.error('Error checking card preference:', error);
      setShouldShowCards(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DB954] mx-auto"></div>
        </div>
      </div>
    );
  }

  return <DashboardPage />;
}

