'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Heart, 
  Upload, 
  Mail, 
  Users, 
  Shield,
  ArrowRight,
  Key,
  DollarSign,
  CheckSquare,
  BookOpen,
  Stethoscope,
  Sparkles,
  Calculator,
  Eye,
  AlertCircle,
  Phone,
  CreditCard,
} from 'lucide-react';

interface SectionStatus {
  personalDetails: boolean;
  medicalContacts: boolean;
  funeralPreferences: boolean;
  willQuestionnaire: boolean;
  documents: boolean;
  letters: boolean;
  trustedContacts: boolean;
  releaseSettings: boolean;
  digitalAccounts: boolean;
  assets: boolean;
  legacyMessages: boolean;
  endOfLifeChecklist: boolean;
  biography: boolean;
  insuranceFinancial: boolean;
  household: boolean;
  childrenWishes: boolean;
  familyLegacy: boolean;
  endOfLifeDirectives: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [grantedAccess, setGrantedAccess] = useState<any[]>([]);
  const [trustedContacts, setTrustedContacts] = useState<any[]>([]);
  const [executorInfo, setExecutorInfo] = useState<{ name: string; relationship: string } | null>(null);
  const [releaseSettings, setReleaseSettings] = useState<any>(null);
  const [emergencyContact, setEmergencyContact] = useState<{ name: string; phone: string; relationship: string } | null>(null);
  const [status, setStatus] = useState<SectionStatus>({
    personalDetails: false,
    medicalContacts: false,
    funeralPreferences: false,
    willQuestionnaire: false,
    documents: false,
    letters: false,
    trustedContacts: false,
    releaseSettings: false,
    digitalAccounts: false,
    assets: false,
    legacyMessages: false,
    endOfLifeChecklist: false,
    biography: false,
    insuranceFinancial: false,
    household: false,
    childrenWishes: false,
    familyLegacy: false,
    endOfLifeDirectives: false,
  });

  useEffect(() => {
    checkAuthAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const checkAuthAndLoadData = async () => {
    try {
      // Check onboarding status first
      const onboardingRes = await fetch('/api/user/onboarding/complete');
      if (onboardingRes.ok) {
        const onboardingData = await onboardingRes.json();
        // If onboarding is not complete (or if field doesn't exist and defaults to false), redirect
        if (!onboardingData.onboardingComplete) {
          router.push('/onboarding');
          return;
        }
      } else {
        // If check fails, log but continue (might be new user)
        console.warn('Onboarding check failed, assuming needs onboarding');
        router.push('/onboarding');
        return;
      }

      const [statusRes, personalRes, grantedAccessRes, trustedContactsRes, releaseSettingsRes] = await Promise.all([
        fetch('/api/user/status'),
        fetch('/api/user/personal-details'),
        fetch('/api/user/granted-access'),
        fetch('/api/user/trusted-contacts'),
        fetch('/api/user/release-settings'),
      ]);
      
      if (!statusRes.ok) {
        router.push('/auth/login');
        return;
      }

      const statusData = await statusRes.json();
      setStatus(statusData.status);
      
      if (personalRes.ok) {
        const personalData = await personalRes.json();
        if (personalData.personalDetails) {
          // Use preferred name if available, otherwise full name, otherwise fallback
          const displayName = personalData.personalDetails.preferredName || 
                             personalData.personalDetails.fullName || 
                             statusData.userName || 
                             'there';
          setUserName(displayName);
          
          if (personalData.personalDetails.profilePictureUrl) {
            setProfilePictureUrl(personalData.personalDetails.profilePictureUrl);
          }

          // Store emergency contact info
          if (personalData.personalDetails.emergencyContactName && personalData.personalDetails.emergencyContactPhone) {
            setEmergencyContact({
              name: personalData.personalDetails.emergencyContactName,
              phone: personalData.personalDetails.emergencyContactPhone,
              relationship: personalData.personalDetails.emergencyContactRelationship || 'Emergency Contact',
            });
          }
        } else {
          // Fallback to email-based username if no personal details
          setUserName(statusData.userName || 'there');
        }
      } else {
        // Fallback to email-based username if personal details fetch fails
        setUserName(statusData.userName || 'there');
      }

      // Load granted access
      if (grantedAccessRes.ok) {
        const grantedData = await grantedAccessRes.json();
        setGrantedAccess(grantedData.grantedAccess || []);
      }

      // Load trusted contacts and release settings
      let contactsData = null;
      if (trustedContactsRes.ok) {
        contactsData = await trustedContactsRes.json();
        setTrustedContacts(contactsData.trustedContacts || []);
      }

      if (releaseSettingsRes.ok) {
        const releaseData = await releaseSettingsRes.json();
        setReleaseSettings(releaseData.settings);
        if (releaseData.settings?.executorContactId && contactsData) {
          // Find executor in trusted contacts
          const executor = contactsData.trustedContacts?.find(
            (c: any) => c.id === releaseData.settings.executorContactId
          );
          if (executor) {
            setExecutorInfo({ name: executor.name, relationship: executor.relationship });
          }
        }
      }
    } catch (error) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const completedSections = Object.values(status).filter(Boolean).length;
  const totalSections = Object.keys(status).length;
  const progress = (completedSections / totalSections) * 100;

  // Identify missing essentials (2-3 most important)
  const getMissingEssentials = () => {
    const essentials = [];
    if (!status.personalDetails) essentials.push({ title: 'Personal Details', href: '/dashboard/personal-details', icon: User });
    if (!status.trustedContacts) essentials.push({ title: 'Emergency & Trusted Contacts', href: '/dashboard/trusted-contacts', icon: Users });
    if (!status.medicalContacts) essentials.push({ title: 'Medical Information', href: '/dashboard/medical-contacts', icon: Stethoscope });
    if (!status.documents && essentials.length < 3) essentials.push({ title: 'Important Documents', href: '/dashboard/documents', icon: Upload });
    if (!status.insuranceFinancial && essentials.length < 3) essentials.push({ title: 'Insurance & Financial', href: '/dashboard/insurance-financial', icon: CreditCard });
    return essentials.slice(0, 3);
  };

  const missingEssentials = getMissingEssentials();


  // Get one optional next step (non-essential)
  const getOptionalNextStep = () => {
    const optional = [];
    if (!status.letters) optional.push({ title: 'Write one guidance note', href: '/dashboard/letters', description: 'This helps the people you love know what to do' });
    if (!status.biography && optional.length === 0) optional.push({ title: 'Add your biography', href: '/dashboard/biography', description: 'Share your life story' });
    if (!status.familyLegacy && optional.length === 0) optional.push({ title: 'Preserve family traditions', href: '/dashboard/family-legacy', description: 'Keep family memories alive' });
    return optional[0] || null;
  };

  const optionalNextStep = getOptionalNextStep();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A5B99A]"></div>
          <p className="text-[#2C2A29] opacity-60">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A5B99A]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#93B0C8]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 relative">
        {/* 1️⃣ Primary Preparedness Action - Large, calm CTA */}
        <div className="mb-8 sm:mb-12">
          <Link
            href="/dashboard/if-something-happens"
            className="group block bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 border-2 border-[#A5B99A]/30 hover:border-[#A5B99A] shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 sm:p-5 bg-[#A5B99A]/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-[#A5B99A]" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2A29] mb-4">
                If Something Happens
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-[#2C2A29] opacity-70 max-w-2xl mb-6">
                Essential information when you need it most. This helps the people you love know what to do.
              </p>
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-3 text-[#A5B99A] font-semibold text-base sm:text-lg group-hover:gap-3 transition-all touch-target rounded-lg hover:bg-[#A5B99A]/5">
                <span>View Preparedness Snapshot</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* 2️⃣ Preparedness Status - Simple reassurance */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#2C2A29] mb-2">
                  {progress >= 100 
                    ? 'You\'re fully prepared'
                    : progress >= 75
                    ? 'You\'re mostly prepared'
                    : progress >= 50
                    ? 'You\'re making progress'
                    : 'Getting started'}
                </h3>
                <p className="text-sm sm:text-base text-[#2C2A29] opacity-70">
                  {progress >= 100 
                    ? 'Everything is ready. Calm readiness, whenever it\'s needed.'
                    : progress >= 75
                    ? 'A few important details remain. You can return to this anytime.'
                    : progress >= 50
                    ? 'Every step matters. Take your time organizing what\'s important.'
                    : 'If something happens, this helps others know what to do.'}
                </p>
              </div>
            </div>
            
            {/* Show only 2-3 missing essentials */}
            {missingEssentials.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium text-[#2C2A29] opacity-60 mb-3">Missing essentials:</p>
                {missingEssentials.map((essential) => {
                  const Icon = essential.icon;
                  return (
                    <Link
                      key={essential.href}
                      href={essential.href}
                      className="flex items-center gap-3 p-4 sm:p-3 rounded-lg hover:bg-[#FCFAF7] transition-colors group touch-target min-h-[44px]"
                    >
                      <div className="p-2 bg-[#A5B99A]/10 rounded-lg flex-shrink-0">
                        <Icon className="w-5 h-5 sm:w-4 sm:h-4 text-[#A5B99A]" />
                      </div>
                      <span className="text-sm sm:text-base text-[#2C2A29] group-hover:text-[#A5B99A] transition-colors flex-1">
                        {essential.title}
                      </span>
                      <ArrowRight className="w-5 h-5 sm:w-4 sm:h-4 text-[#2C2A29] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3️⃣ People & Access Snapshot */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200/50">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#2C2A29] mb-6">
              People & Access
            </h3>
            <div className="space-y-4">
              {/* Primary Emergency Contact */}
              {emergencyContact ? (
                <div className="flex items-center justify-between p-4 sm:p-5 bg-[#FCFAF7] rounded-lg border border-gray-200/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-[#93B0C8]/10 rounded-lg flex-shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#2C2A29] opacity-60">Primary Emergency Contact</p>
                      <p className="text-base sm:text-lg font-semibold text-[#2C2A29] truncate">{emergencyContact.name}</p>
                      <p className="text-sm text-[#2C2A29] opacity-70">{emergencyContact.relationship}</p>
                    </div>
                  </div>
                  <a 
                    href={`tel:${emergencyContact.phone}`}
                    className="p-2 sm:p-3 text-[#93B0C8] hover:text-[#A5B99A] hover:bg-[#93B0C8]/10 rounded-lg transition-colors touch-target"
                    aria-label="Call emergency contact"
                  >
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                  </a>
                </div>
              ) : (
                <Link
                  href="/dashboard/personal-details"
                  className="flex items-center justify-between p-4 sm:p-5 bg-[#FCFAF7] rounded-lg border border-gray-200/50 hover:border-[#A5B99A] transition-colors group touch-target min-h-[60px]"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-[#93B0C8]/10 rounded-lg flex-shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#2C2A29] opacity-60">Primary Emergency Contact</p>
                      <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 group-hover:text-[#A5B99A] transition-colors">
                        Add emergency contact
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 sm:w-4 sm:h-4 text-[#2C2A29] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                </Link>
              )}

              {/* Executor / Decision-Maker */}
              {executorInfo ? (
                <div className="flex items-center justify-between p-4 sm:p-5 bg-[#FCFAF7] rounded-lg border border-gray-200/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-[#A5B99A]/10 rounded-lg flex-shrink-0">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#2C2A29] opacity-60">Executor / Decision-Maker</p>
                      <p className="text-base sm:text-lg font-semibold text-[#2C2A29] truncate">{executorInfo.name}</p>
                      <p className="text-sm text-[#2C2A29] opacity-70">{executorInfo.relationship}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/dashboard/release-settings"
                  className="flex items-center justify-between p-4 sm:p-5 bg-[#FCFAF7] rounded-lg border border-gray-200/50 hover:border-[#A5B99A] transition-colors group touch-target min-h-[60px]"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-[#A5B99A]/10 rounded-lg flex-shrink-0">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#2C2A29] opacity-60">Executor / Decision-Maker</p>
                      <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 group-hover:text-[#A5B99A] transition-colors">
                        Designate an executor
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 sm:w-4 sm:h-4 text-[#2C2A29] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                </Link>
              )}

              {/* Number of people with access */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-[#FCFAF7] rounded-lg border border-gray-200/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-[#93B0C8]/10 rounded-lg flex-shrink-0">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#2C2A29] opacity-60">People with Access</p>
                    <p className="text-base sm:text-lg font-semibold text-[#2C2A29]">
                      {trustedContacts.length} {trustedContacts.length === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/trusted-contacts"
                  className="px-3 py-2 text-sm font-medium text-[#93B0C8] hover:text-[#A5B99A] hover:bg-[#93B0C8]/10 rounded-lg transition-colors touch-target"
                >
                  Manage
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4️⃣ Optional Next Step - One Only */}
        {optionalNextStep && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200/50">
              <p className="text-sm font-medium text-[#2C2A29] opacity-60 mb-4">Optional next step</p>
              <Link
                href={optionalNextStep.href}
                className="flex items-center justify-between p-4 sm:p-5 bg-[#FCFAF7] rounded-lg border border-gray-200/50 hover:border-[#A5B99A] transition-colors group touch-target min-h-[60px]"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-base sm:text-lg font-semibold text-[#2C2A29] mb-1 group-hover:text-[#A5B99A] transition-colors">
                    {optionalNextStep.title}
                  </p>
                  <p className="text-sm sm:text-base text-[#2C2A29] opacity-70">
                    {optionalNextStep.description}
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 sm:w-5 sm:h-5 text-[#2C2A29] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


