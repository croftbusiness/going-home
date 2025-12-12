'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, XCircle, User, Eye } from 'lucide-react';

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

export default function ViewerAccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ViewerSession | null>(null);
  const [ownerInfo, setOwnerInfo] = useState<any>(null);
  const [viewerAvatar, setViewerAvatar] = useState<string | null>(null);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const sessionData = localStorage.getItem('viewer_session');
      if (!sessionData) {
        router.push('/viewer/login');
        return;
      }

      const parsedSession = JSON.parse(sessionData) as ViewerSession;
      setSession(parsedSession);

      // Fetch owner information
      try {
        const response = await fetch(`/api/viewer/data?section=personalDetails`);
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setOwnerInfo(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to load owner info:', error);
      }

      // Load viewer avatar (if available)
      // In a real implementation, this would come from the contact record
      setViewerAvatar(null);
    } catch (error) {
      console.error('Failed to load session:', error);
      router.push('/viewer/login');
    } finally {
      setLoading(false);
    }
  };

  const permissionsList = [
    { key: 'personalDetails', label: 'Personal Details', icon: User },
    { key: 'medicalContacts', label: 'Medical Contacts', icon: User },
    { key: 'funeralPreferences', label: 'Funeral Preferences', icon: User },
    { key: 'documents', label: 'Documents', icon: User },
    { key: 'letters', label: 'Personal Letters', icon: User },
  ];

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
    <div className="min-h-screen bg-[#FAF9F7]">
      <header className="bg-[#FCFAF7] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/viewer/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">Your Access</h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                View your permissions and access details
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Viewer Profile */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            {viewerAvatar ? (
              <Image
                src={viewerAvatar}
                alt={session.contact.name}
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] flex items-center justify-center text-white text-2xl font-semibold">
                {session.contact.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-[#2C2A29] mb-1">{session.contact.name}</h2>
              <p className="text-[#2C2A29] opacity-70 mb-2">{session.contact.email}</p>
              <div className="flex items-center space-x-4 text-sm text-[#2C2A29] opacity-60">
                <span>Role: {session.contact.role}</span>
                <span>•</span>
                <span>Relationship: {session.contact.relationship}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Information */}
        {ownerInfo && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Account Owner</h3>
            <div className="flex items-center space-x-4">
              {ownerInfo?.profile_picture_url ? (
                <Image
                  src={ownerInfo.profile_picture_url}
                  alt={ownerInfo.preferred_name || ownerInfo.full_name || 'Owner'}
                  width={60}
                  height={60}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-15 h-15 rounded-full bg-gradient-to-br from-[#93B0C8] to-[#A5B99A] flex items-center justify-center text-white text-xl font-semibold">
                  {(ownerInfo.preferred_name || ownerInfo.full_name || 'O').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-lg font-medium text-[#2C2A29]">
                  {ownerInfo.preferred_name || ownerInfo.full_name || 'Account Owner'}
                </div>
                <div className="text-sm text-[#2C2A29] opacity-60">
                  {ownerInfo.role ? `${ownerInfo.role} • ` : ''}Owner
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Permissions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Your Permissions</h3>
          <div className="space-y-3">
            {permissionsList.map((perm) => {
              const hasAccess = session.permissions[perm.key] || false;
              const Icon = perm.icon;
              return (
                <div
                  key={perm.key}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    hasAccess
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${hasAccess ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-[#2C2A29] font-medium">{perm.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasAccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">Allowed</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">Restricted</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Access Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">View-Only Access</h4>
              <p className="text-sm text-blue-800">
                You have view-only access to the sections marked as "Allowed" above. You cannot edit, modify, or delete any information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


