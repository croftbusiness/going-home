'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, 
  FileText, 
  Heart, 
  Upload, 
  MessageSquare, 
  Stethoscope,
  LogOut,
  Eye,
  Lock,
  Loader2,
  Video,
  CheckSquare,
  BookOpen,
  Key,
  DollarSign,
  CreditCard,
  Home as HomeIcon,
  Baby,
  Gift,
  FileCheck,
  Shield,
  FileQuestion,
  PenTool,
  Sparkles,
} from 'lucide-react';
import PermissionGate from '@/components/PermissionGate';


interface ViewerSession {
  contact: {
    id: string;
    name: string;
    email: string;
    role: string;
    relationship: string;
    ownerId: string;
    profilePictureUrl?: string;
  };
  permissions: Record<string, boolean>;
  tokenId: string;
  isSimulation?: boolean;
}

function ViewerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ViewerSession | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [ownerProfilePicture, setOwnerProfilePicture] = useState<string | null>(null);
  const [viewerProfilePicture, setViewerProfilePicture] = useState<string | null>(null);
  const [isSimulation, setIsSimulation] = useState(false);

  useEffect(() => {
    // Check if this is a simulation from URL param
    const simParam = searchParams.get('simulation');
    if (simParam === 'true') {
      setIsSimulation(true);
    }
    loadSession();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSession = async () => {
    try {
      // Get viewer session from localStorage
      const sessionData = localStorage.getItem('viewer_session');
      if (!sessionData) {
        router.push('/viewer/login');
        return;
      }

      const parsedSession = JSON.parse(sessionData) as ViewerSession;
      setSession(parsedSession);
      setIsSimulation(parsedSession.isSimulation || false);

      // Fetch owner name and profile picture
      try {
        const response = await fetch(`/api/viewer/data?section=personalDetails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session: parsedSession }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setOwnerName(data.data.preferred_name || data.data.full_name || 'the account owner');
            if (data.data.profile_picture_url) {
              setOwnerProfilePicture(data.data.profile_picture_url);
            }
          }
        }
      } catch (error) {
        // Silently fail - not critical
      }

      // Fetch viewer's own profile picture from trusted_contacts
      // The session structure uses contact.id, so we'll fetch it directly
      try {
        // For now, we'll get it from the session if available
        // In a full implementation, you'd fetch from the API
        if (parsedSession.contact?.profilePictureUrl) {
          setViewerProfilePicture(parsedSession.contact.profilePictureUrl);
        }
      } catch (error) {
        // Silently fail - not critical
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      router.push('/viewer/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('viewer_session');
    if (isSimulation) {
      router.push('/dashboard');
    } else {
      router.push('/viewer/login');
    }
  };

  const handleExitSimulation = () => {
    localStorage.removeItem('viewer_session');
    router.push('/dashboard');
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

  const sections = [
    {
      id: 'personalDetails',
      name: 'Personal Details',
      icon: User,
      permission: session.permissions.canViewPersonalDetails,
      href: '/viewer/personal-details',
    },
    {
      id: 'medicalContacts',
      name: 'Medical & Legal',
      icon: Stethoscope,
      permission: session.permissions.canViewMedicalContacts,
      href: '/viewer/medical-contacts',
    },
    {
      id: 'funeralPreferences',
      name: 'Funeral Planning',
      icon: Sparkles,
      permission: session.permissions.canViewFuneralPreferences,
      href: '/viewer/funeral-preferences',
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: Upload,
      permission: session.permissions.canViewDocuments,
      href: '/viewer/documents',
    },
    {
      id: 'letters',
      name: 'Personal Letters',
      icon: PenTool,
      permission: session.permissions.canViewLetters,
      href: '/viewer/letters',
    },
    {
      id: 'legacyMessages',
      name: 'Legacy Messages',
      icon: Video,
      permission: session.permissions.canViewLegacyMessages,
      href: '/viewer/legacy-messages',
    },
    {
      id: 'endOfLifeDirectives',
      name: 'End-of-Life Directives',
      icon: Heart,
      permission: session.permissions.canViewEndOfLifeDirectives,
      href: '/viewer/end-of-life-directives',
    },
    {
      id: 'endOfLifeChecklist',
      name: 'End-of-Life Checklist',
      icon: CheckSquare,
      permission: session.permissions.canViewEndOfLifeChecklist,
      href: '/viewer/end-of-life-checklist',
    },
    {
      id: 'biography',
      name: 'Biography',
      icon: BookOpen,
      permission: session.permissions.canViewBiography,
      href: '/viewer/biography',
    },
    {
      id: 'willQuestionnaire',
      name: 'Will Questionnaire',
      icon: FileQuestion,
      permission: session.permissions.canViewWillQuestionnaire,
      href: '/viewer/will-questionnaire',
    },
    {
      id: 'assets',
      name: 'Assets',
      icon: DollarSign,
      permission: session.permissions.canViewAssets,
      href: '/viewer/assets',
    },
    {
      id: 'digitalAccounts',
      name: 'Digital Accounts',
      icon: Key,
      permission: session.permissions.canViewDigitalAccounts,
      href: '/viewer/digital-accounts',
    },
    {
      id: 'insuranceFinancial',
      name: 'Insurance & Financial',
      icon: CreditCard,
      permission: session.permissions.canViewInsuranceFinancial,
      href: '/viewer/insurance-financial',
    },
    {
      id: 'household',
      name: 'Household Info',
      icon: HomeIcon,
      permission: session.permissions.canViewHousehold,
      href: '/viewer/household',
    },
    {
      id: 'childrenWishes',
      name: 'Children\'s Wishes',
      icon: Baby,
      permission: session.permissions.canViewChildrenWishes,
      href: '/viewer/children-wishes',
    },
    {
      id: 'familyLegacy',
      name: 'Family Legacy',
      icon: Gift,
      permission: session.permissions.canViewFamilyLegacy,
      href: '/viewer/family-legacy',
    },
    {
      id: 'finalSummary',
      name: 'Final Summary',
      icon: FileCheck,
      permission: session.permissions.canViewFinalSummary,
      href: '/viewer/final-summary',
    },
    {
      id: 'releaseSettings',
      name: 'Release Settings',
      icon: Shield,
      permission: session.permissions.canViewReleaseSettings,
      href: '/viewer/release-settings',
    },
  ];

  const accessibleSections = sections.filter(s => s.permission);

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-[#FCFAF7] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <div className="relative w-8 h-8">
                  <Image
                    src="/logo.png"
                    alt="Going Home Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#2C2A29]">Going Home</h1>
                  <p className="text-xs text-[#2C2A29] opacity-50">Viewer Mode</p>
                </div>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-[#2C2A29] hover:bg-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Simulation Banner */}
        {isSimulation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-yellow-600" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-900">
                    You are viewing as {session.contact.name} – Simulation Mode
                  </h3>
                  <p className="text-xs text-yellow-800">
                    This is a preview of what this viewer sees. No changes will be saved.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExitSimulation}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Exit Viewer Mode
              </button>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-[#FCFAF7] rounded-lg p-6 mb-8 shadow-sm border border-gray-200">
          <div className="flex items-start space-x-4">
            {viewerProfilePicture ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#A5B99A] shadow-sm flex-shrink-0">
                <img
                  src={viewerProfilePicture}
                  alt={`${session.contact.name}'s profile`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                {session.contact.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-[#2C2A29] mb-2">
                Welcome, {session.contact.name}
              </h2>
              <p className="text-[#2C2A29] opacity-70 mb-3">
                You are viewing information shared by{' '}
                <span className="font-medium">{ownerName || 'the account owner'}</span>.
              </p>
              <div className="flex items-center space-x-4 mb-3">
                {ownerProfilePicture ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#93B0C8] shadow-sm flex-shrink-0">
                    <img
                      src={ownerProfilePicture}
                      alt={`${ownerName}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#93B0C8] to-[#A5B99A] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {ownerName.charAt(0) || 'O'}
                  </div>
                )}
                <div className="flex items-center space-x-4 text-sm text-[#2C2A29] opacity-60">
                  <span>Your Role: {session.contact.role}</span>
                  <span>•</span>
                  <span>Relationship: {session.contact.relationship}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Access Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">View-Only Access</h3>
              <p className="text-sm text-blue-800">
                You have view-only access to the sections below. You cannot edit or modify any information.
              </p>
            </div>
          </div>
        </div>

        {/* Accessible Sections */}
        {accessibleSections.length === 0 ? (
          <div className="bg-[#FCFAF7] rounded-lg p-12 text-center">
            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Access Granted</h3>
            <p className="text-[#2C2A29] opacity-70">
              You don't have permission to view any sections yet. Contact {ownerName || 'the account owner'} to request access.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold text-[#2C2A29] mb-4">Available Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accessibleSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Link
                    key={section.id}
                    href={section.href}
                    className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-[#A5B99A] transition-all group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-lg group-hover:bg-opacity-20 transition-colors">
                        <Icon className="w-6 h-6 text-[#A5B99A]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-[#2C2A29] mb-1">
                          {section.name}
                        </h4>
                        <p className="text-sm text-[#2C2A29] opacity-60">
                          View information
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked Sections (for reference) */}
        {sections.filter(s => !s.permission).length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-[#2C2A29] mb-4">Restricted Sections</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.filter(s => !s.permission).map((section) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200 opacity-60"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-200 rounded-lg">
                        <Icon className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-[#2C2A29] mb-1">
                          {section.name}
                        </h4>
                        <p className="text-sm text-[#2C2A29] opacity-60">
                          No access granted
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ViewerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#A5B99A]" />
      </div>
    }>
      <ViewerDashboardContent />
    </Suspense>
  );
}

