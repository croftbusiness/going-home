'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Video, Lock } from 'lucide-react';
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

export default function ViewerLegacyMessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ViewerSession | null>(null);
  const [data, setData] = useState<any>(null);

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

      if (!parsedSession.permissions.canViewLegacyMessages) {
        return;
      }

      const response = await fetch('/api/viewer/data?section=legacyMessages');
      if (!response.ok) {
        if (response.status === 403) return;
        throw new Error('Failed to load data');
      }

      const result = await response.json();
      setData(result.data);
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
    <PermissionGate permission={session.permissions.canViewLegacyMessages || false} sectionName="Legacy Messages">
      <div className="min-h-screen bg-[#FAF9F7]">
        <header className="bg-[#FCFAF7] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/viewer/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">Legacy Messages</h1>
                <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">View-only access</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {data ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
                <div className="p-3 bg-[#93B0C8] bg-opacity-10 rounded-lg">
                  <Video className="w-6 h-6 text-[#93B0C8]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#2C2A29]">Legacy Messages</h2>
                  <p className="text-sm text-[#2C2A29] opacity-60">View-only access</p>
                </div>
              </div>

              <div className="space-y-4">
                {data.messages && Array.isArray(data.messages) && data.messages.length > 0 ? (
                  data.messages.map((message: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      {message.title && (
                        <h3 className="text-lg font-semibold text-[#2C2A29] mb-2">{message.title}</h3>
                      )}
                      {message.content && (
                        <p className="text-[#2C2A29] whitespace-pre-wrap">{message.content}</p>
                      )}
                      {message.video_url && (
                        <div className="mt-4">
                          <video src={message.video_url} controls className="w-full rounded-lg" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[#2C2A29] opacity-70">No legacy messages available.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Information Available</h3>
              <p className="text-[#2C2A29] opacity-70">No legacy messages have been shared yet.</p>
            </div>
          )}
        </main>
      </div>
    </PermissionGate>
  );
}


