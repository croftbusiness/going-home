'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect from old URL to new URL
export default function MedicalContactsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/medical-legal');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A5B99A]"></div>
        <p className="text-[#2C2A29] opacity-60">Redirecting...</p>
      </div>
    </div>
  );
}
