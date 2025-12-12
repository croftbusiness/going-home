'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, Lock, Eye } from 'lucide-react';
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

export default function ViewerPersonalDetailsPage() {
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

      if (!parsedSession.permissions.canViewPersonalDetails) {
        return;
      }

      // Send session data in request body for simulation mode
      // Send session data in POST request for simulation mode support
      const response = await fetch('/api/viewer/data?section=personalDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session: parsedSession }),
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          return; // Permission denied
        }
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
    <PermissionGate permission={session.permissions.canViewPersonalDetails || false} sectionName="Personal Details">
      <div className="min-h-screen bg-[#FAF9F7]">
        <header className="bg-[#FCFAF7] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/viewer/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">Personal Details</h1>
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
                  <User className="w-6 h-6 text-[#A5B99A]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#2C2A29]">
                    {data.preferred_name || data.full_name || 'Personal Information'}
                  </h2>
                  <p className="text-sm text-[#2C2A29] opacity-60">View-only access</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.full_name && (
                  <div>
                    <label className="text-sm font-medium text-[#2C2A29] opacity-70">Full Name</label>
                    <p className="text-[#2C2A29] mt-1">{data.full_name}</p>
                  </div>
                )}
                {data.preferred_name && (
                  <div>
                    <label className="text-sm font-medium text-[#2C2A29] opacity-70">Preferred Name</label>
                    <p className="text-[#2C2A29] mt-1">{data.preferred_name}</p>
                  </div>
                )}
                {data.date_of_birth && (
                  <div>
                    <label className="text-sm font-medium text-[#2C2A29] opacity-70">Date of Birth</label>
                    <p className="text-[#2C2A29] mt-1">{new Date(data.date_of_birth).toLocaleDateString()}</p>
                  </div>
                )}
                {data.email && (
                  <div>
                    <label className="text-sm font-medium text-[#2C2A29] opacity-70">Email</label>
                    <p className="text-[#2C2A29] mt-1">{data.email}</p>
                  </div>
                )}
                {data.phone && (
                  <div>
                    <label className="text-sm font-medium text-[#2C2A29] opacity-70">Phone</label>
                    <p className="text-[#2C2A29] mt-1">{data.phone}</p>
                  </div>
                )}
                {data.address && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-[#2C2A29] opacity-70">Address</label>
                    <p className="text-[#2C2A29] mt-1">
                      {data.address}
                      {data.city && `, ${data.city}`}
                      {data.state && `, ${data.state}`}
                      {data.zip_code && ` ${data.zip_code}`}
                    </p>
                  </div>
                )}
                {data.emergency_contact_name && (
                  <div className="md:col-span-2 border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-[#2C2A29] opacity-70">Name</label>
                        <p className="text-[#2C2A29] mt-1">{data.emergency_contact_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#2C2A29] opacity-70">Phone</label>
                        <p className="text-[#2C2A29] mt-1">{data.emergency_contact_phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#2C2A29] opacity-70">Relationship</label>
                        <p className="text-[#2C2A29] mt-1">{data.emergency_contact_relationship}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Information Available</h3>
              <p className="text-[#2C2A29] opacity-70">No personal details have been shared yet.</p>
            </div>
          )}
        </main>
      </div>
    </PermissionGate>
  );
}

