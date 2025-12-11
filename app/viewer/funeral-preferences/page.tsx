'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Lock } from 'lucide-react';
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

export default function ViewerFuneralPreferencesPage() {
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

      if (!parsedSession.permissions.canViewFuneralPreferences) {
        return;
      }

      const response = await fetch('/api/viewer/data?section=funeralPreferences');
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
    <PermissionGate permission={session.permissions.canViewFuneralPreferences || false} sectionName="Funeral Preferences">
      <div className="min-h-screen bg-[#FAF9F7]">
        <header className="bg-[#FCFAF7] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/viewer/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">Funeral Preferences</h1>
                <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">View-only access</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {data ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
                <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-lg">
                  <Heart className="w-6 h-6 text-[#A5B99A]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#2C2A29]">Funeral & Memorial Preferences</h2>
                  <p className="text-sm text-[#2C2A29] opacity-60">View-only access</p>
                </div>
              </div>

              <div className="space-y-6">
                {data.burial_or_cremation && (
                  <div>
                    <label className="text-sm font-medium text-[#2C2A29] opacity-70">Preference</label>
                    <p className="text-[#2C2A29] mt-1 capitalize">{data.burial_or_cremation}</p>
                  </div>
                )}
                {data.funeral_home && (
                  <div>
                    <label className="text-sm font-medium text-[#2C2A29] opacity-70">Preferred Funeral Home</label>
                    <p className="text-[#2C2A29] mt-1">{data.funeral_home}</p>
                  </div>
                )}
                {data.service_type && (
                  <div>
                    <label className="text-sm font-medium text-[#2C2A29] opacity-70">Service Type</label>
                    <p className="text-[#2C2A29] mt-1">{data.service_type}</p>
                  </div>
                )}
                {(data.song_1 || data.song_2 || data.song_3) && (
                  <div>
                    <label className="text-sm font-medium text-[#2C2A29] opacity-70">Song Choices</label>
                    <ul className="mt-1 space-y-1">
                      {data.song_1 && <li className="text-[#2C2A29]">1. {data.song_1}</li>}
                      {data.song_2 && <li className="text-[#2C2A29]">2. {data.song_2}</li>}
                      {data.song_3 && <li className="text-[#2C2A29]">3. {data.song_3}</li>}
                    </ul>
                  </div>
                )}
                {data.atmosphere_wishes && (
                  <div>
                    <label className="text-sm font-medium text-[#2C2A29] opacity-70">Atmosphere Wishes</label>
                    <p className="text-[#2C2A29] mt-1 whitespace-pre-wrap">{data.atmosphere_wishes}</p>
                  </div>
                )}
                {data.preferred_clothing && (
                  <div>
                    <label className="text-sm font-medium text-[#2C2A29] opacity-70">Preferred Clothing</label>
                    <p className="text-[#2C2A29] mt-1">{data.preferred_clothing}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Information Available</h3>
              <p className="text-[#2C2A29] opacity-70">No funeral preferences have been shared yet.</p>
            </div>
          )}
        </main>
      </div>
    </PermissionGate>
  );
}

