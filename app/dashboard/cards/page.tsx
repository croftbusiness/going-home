'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SwipeCardFlow from '@/components/cards/SwipeCardFlow';

export default function CardsPage() {
  const router = useRouter();
  const [showPreferencePrompt, setShowPreferencePrompt] = useState(false);

  const handleComplete = () => {
    // Clear any card-related query params
    router.push('/dashboard');
  };

  const handlePause = () => {
    // Flow paused (user navigated to a section)
    // Don't navigate, just let them go
  };

  return (
    <>
      <SwipeCardFlow onComplete={handleComplete} onPause={handlePause} />
    </>
  );
}

