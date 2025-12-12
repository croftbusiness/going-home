'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import SwipeCardFlow from '@/components/cards/SwipeCardFlow';
import { Loader2 } from 'lucide-react';

// Force dynamic rendering since this page uses search params and is client-only
export const dynamic = 'force-dynamic';

function CardsPageContent() {
  const router = useRouter();

  const handleComplete = () => {
    // Clear any card-related query params
    router.push('/dashboard');
  };

  const handlePause = () => {
    // Flow paused (user navigated to a section)
    // Don't navigate, just let them go
  };

  return (
    <SwipeCardFlow onComplete={handleComplete} onPause={handlePause} />
  );
}

export default function CardsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1DB954] mx-auto mb-4" />
          <p className="text-gray-600">Loading cards...</p>
        </div>
      </div>
    }>
      <CardsPageContent />
    </Suspense>
  );
}

