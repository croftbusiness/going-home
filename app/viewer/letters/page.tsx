'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Lock, Mail } from 'lucide-react';
import PermissionGate from '@/components/PermissionGate';

interface ViewerSession {
  contact: {
    id: string;
    name: string;
    email: string;
    role: string;
    relationship: string;
    ownerId: string;
  };
  permissions: Record<string, boolean>;
  tokenId: string;
  isSimulation?: boolean;
}

export default function ViewerLettersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ViewerSession | null>(null);
  const [letters, setLetters] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessionData = localStorage.getItem('viewer_session');
      if (!sessionData) {
        router.push('/viewer/login');
        return;
      }

      const parsedSession = JSON.parse(sessionData) as ViewerSession;
      setSession(parsedSession);

      if (!parsedSession.permissions.canViewLetters) {
        return;
      }

      const response = await fetch('/api/viewer/data?section=letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session: parsedSession }),
      });
      if (!response.ok) {
        if (response.status === 403) return;
        throw new Error('Failed to load data');
      }

      const result = await response.json();
      setLetters(result.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-[#2C2A29]">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <PermissionGate permission={session.permissions.canViewLetters || false} sectionName="Personal Letters">
      <div className="min-h-screen bg-[#FAF9F7]">
        <header className="bg-[#FCFAF7] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/viewer/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">Personal Letters</h1>
                <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">View-only access</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {letters.length > 0 ? (
            <div className="space-y-6">
              {letters.map((letter) => (
                <div key={letter.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-lg">
                      <Mail className="w-6 h-6 text-[#A5B99A]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#2C2A29] mb-1">
                        {letter.recipient_relationship || 'Personal Letter'}
                      </h3>
                      {letter.recipient_id && (
                        <p className="text-sm text-[#2C2A29] opacity-60 mb-2">
                          For: {letter.recipient_relationship}
                        </p>
                      )}
                    </div>
                  </div>
                  {letter.message_text && (
                    <div className="mt-4 p-4 bg-[#FAF9F7] rounded-lg">
                      <p className="text-[#2C2A29] whitespace-pre-wrap leading-relaxed">
                        {letter.message_text}
                      </p>
                    </div>
                  )}
                  {letter.file_url && (
                    <div className="mt-4">
                      <p className="text-sm text-[#2C2A29] opacity-70 mb-2">Attached file available</p>
                    </div>
                  )}
                  <p className="text-xs text-[#2C2A29] opacity-50 mt-4">
                    Created {new Date(letter.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Letters Available</h3>
              <p className="text-[#2C2A29] opacity-70">No personal letters have been shared yet.</p>
            </div>
          )}
        </main>
      </div>
    </PermissionGate>
  );
}

