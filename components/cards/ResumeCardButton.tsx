'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCardSession } from '@/hooks/useCardSession';
import { Layers } from 'lucide-react';

export default function ResumeCardButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, hasPendingCards, loading } = useCardSession();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Only show if there's an active session with pending cards
    // And we're not already in the card flow
    const isOnCardsPage = pathname === '/dashboard/cards';
    const isOnLoginPage = pathname?.includes('/auth');

    if (session && hasPendingCards() && !isOnCardsPage && !isOnLoginPage && !loading) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  }, [session, hasPendingCards, loading, pathname]);

  const handleResume = () => {
    router.push('/dashboard/cards');
  };

  if (!showButton) return null;

  return (
    <button
      onClick={handleResume}
      className="fixed bottom-6 right-6 z-50 bg-[#1DB954] text-white rounded-full p-4 shadow-lg hover:bg-[#1ed760] transition-all hover:scale-105 flex items-center gap-2"
      aria-label="Resume cards"
    >
      <Layers className="w-5 h-5" />
      <span className="text-sm font-medium hidden sm:inline">Resume Cards</span>
    </button>
  );
}

