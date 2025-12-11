'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  FileText, 
  Heart, 
  Upload, 
  Mail, 
  Users, 
  Shield,
  CheckCircle,
  Circle,
  ArrowRight,
  TrendingUp,
  Key,
  DollarSign,
  Video,
  CheckSquare,
  BookOpen,
  Building2,
  Home as HomeIcon,
  Baby,
  FileCheck,
  Scale,
  Sparkles,
  Sprout,
  Flower,
  Star,
  Trophy,
  Award,
  Target,
  Zap,
  FolderHeart,
} from 'lucide-react';
import AIChecklist from '@/components/ai/AIChecklist';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

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
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
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
  });

  useEffect(() => {
    checkAuthAndLoadData();
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

      const [statusRes, personalRes] = await Promise.all([
        fetch('/api/user/status'),
        fetch('/api/user/personal-details'),
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
        } else {
          // Fallback to email-based username if no personal details
          setUserName(statusData.userName || 'there');
        }
      } else {
        // Fallback to email-based username if personal details fetch fails
        setUserName(statusData.userName || 'there');
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

  // Dynamic icon based on completion percentage
  const getProgressIcon = () => {
    if (progress === 0) {
      return { Icon: Sparkles, color: 'text-gray-400', label: 'Getting Started', bgGradient: 'from-gray-100 to-gray-200' };
    } else if (progress < 25) {
      return { Icon: Sparkles, color: 'text-[#A5B99A]', label: 'Beginning', bgGradient: 'from-[#A5B99A]/20 to-[#93B0C8]/20' };
    } else if (progress < 50) {
      return { Icon: Sprout, color: 'text-[#A5B99A]', label: 'Growing', bgGradient: 'from-[#A5B99A]/30 to-[#93B0C8]/30' };
    } else if (progress < 75) {
      return { Icon: Flower, color: 'text-[#93B0C8]', label: 'Blooming', bgGradient: 'from-[#A5B99A]/40 to-[#93B0C8]/40' };
    } else if (progress < 100) {
      return { Icon: Star, color: 'text-[#93B0C8]', label: 'Almost There', bgGradient: 'from-[#A5B99A]/50 to-[#93B0C8]/50' };
    } else {
      return { Icon: Trophy, color: 'text-[#A5B99A]', label: 'Complete!', bgGradient: 'from-[#A5B99A]/60 to-[#93B0C8]/60' };
    }
  };

  const progressIcon = getProgressIcon();
  const ProgressIcon = progressIcon.Icon;

  const sections = [
    {
      title: 'Personal Details',
      description: 'Your identifying information',
      icon: User,
      href: '/dashboard/personal-details',
      completed: status.personalDetails,
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
    },
    {
      title: 'Medical & Legal',
      description: 'Physician and attorney information',
      icon: Heart,
      href: '/dashboard/medical-contacts',
      completed: status.medicalContacts,
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
    },
    {
      title: 'Funeral Planning',
      description: 'AI-guided comprehensive ceremony planning',
      icon: Heart,
      href: '/dashboard/funeral-planning',
      completed: false, // Complex section, show as always available
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
    },
    {
      title: 'Family Legacy',
      description: 'Recipes, stories, traditions, and keepsakes',
      icon: FolderHeart,
      href: '/dashboard/family-legacy',
      completed: status.familyLegacy,
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
    },
    {
      title: 'Basic Funeral Preferences',
      description: 'Quick entry for burial/cremation and service basics',
      icon: FileText,
      href: '/dashboard/funeral-preferences',
      completed: status.funeralPreferences,
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
    },
    {
      title: 'Will Questionnaire',
      description: 'Planning questionnaire for your attorney',
      icon: Scale,
      href: '/dashboard/will-questionnaire',
      completed: status.willQuestionnaire,
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
    },
    {
      title: 'Documents',
      description: 'Upload essential paperwork',
      icon: Upload,
      href: '/dashboard/documents',
      completed: status.documents,
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
    },
    {
      title: 'Personal Letters',
      description: 'Messages for trusted contacts',
      icon: Mail,
      href: '/dashboard/letters',
      completed: status.letters,
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
    },
    {
      title: 'Trusted Contacts',
      description: 'Manage access permissions',
      icon: Users,
      href: '/dashboard/trusted-contacts',
      completed: status.trustedContacts,
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
    },
    {
      title: 'Digital Accounts',
      description: 'Account passwords and access',
      icon: Key,
      href: '/dashboard/digital-accounts',
      completed: status.digitalAccounts,
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
    },
    {
      title: 'Assets',
      description: 'Estate overview and assets',
      icon: DollarSign,
      href: '/dashboard/assets',
      completed: status.assets,
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
    },
    {
      title: 'Legacy Messages',
      description: 'Video and audio messages',
      icon: Video,
      href: '/dashboard/legacy-messages',
      completed: status.legacyMessages,
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
    },
    {
      title: 'End-of-Life Checklist',
      description: 'Final preferences and wishes',
      icon: CheckSquare,
      href: '/dashboard/end-of-life-checklist',
      completed: status.endOfLifeChecklist,
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
    },
    {
      title: 'Biography',
      description: 'Your life story and memories',
      icon: BookOpen,
      href: '/dashboard/biography',
      completed: status.biography,
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
    },
    {
      title: 'Insurance & Financial',
      description: 'Financial contacts and policies',
      icon: Building2,
      href: '/dashboard/insurance-financial',
      completed: status.insuranceFinancial,
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
    },
    {
      title: 'Household Info',
      description: 'Practical household information',
      icon: HomeIcon,
      href: '/dashboard/household',
      completed: status.household,
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
    },
    {
      title: 'Children\'s Wishes',
      description: 'Messages and guardian preferences',
      icon: Baby,
      href: '/dashboard/children-wishes',
      completed: status.childrenWishes,
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
    },
    {
      title: 'Final Summary',
      description: 'Complete overview of all information',
      icon: FileCheck,
      href: '/dashboard/final-summary',
      completed: false, // Always show this
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
    },
    {
      title: 'Release Settings',
      description: 'Configure information release',
      icon: Shield,
      href: '/dashboard/release-settings',
      completed: status.releaseSettings,
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
    },
  ];

  const incompleteSections = sections.filter(s => !s.completed);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 relative">
        {/* Welcome Section with Profile Picture */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <ProfilePictureUpload
                currentUrl={profilePictureUrl}
                onUploadComplete={(url) => setProfilePictureUrl(url)}
                size="lg"
              />
              {/* Progress badge overlay */}
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border-2 border-[#FAF9F7]">
                <div className={`p-2 bg-gradient-to-br ${progressIcon.bgGradient} rounded-full`}>
                  <ProgressIcon className={`w-5 h-5 ${progressIcon.color} animate-pulse`} />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2A29] bg-gradient-to-r from-[#2C2A29] to-[#2C2A29]/80 bg-clip-text">
                  Welcome back, {userName || 'there'}
                </h1>
                {progress >= 100 && (
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-[#A5B99A] animate-bounce" />
                )}
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-[#2C2A29] opacity-70 font-light">
                {progress >= 100 
                  ? '🎉 Your planning is complete! Everything is ready.' 
                  : progress >= 75
                  ? 'You\'re almost there! Just a few more sections to go.'
                  : progress >= 50
                  ? 'Great progress! Keep building your legacy.'
                  : progress >= 25
                  ? 'You\'re off to a great start. Every step matters.'
                  : 'Let\'s begin organizing your information and preferences.'}
              </p>
            </div>
          </div>
        </div>

        {/* Premium Progress Overview Card */}
        <div className="relative mb-8 sm:mb-12">
          {/* Glassmorphism Card */}
          <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl border border-white/20 overflow-hidden">
            {/* Animated gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${progressIcon.bgGradient} opacity-10`}></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8 mb-6">
                {/* Left side: Icon and stats */}
                <div className="flex items-start space-x-4 sm:space-x-6">
                  <div className={`relative p-4 sm:p-5 bg-gradient-to-br ${progressIcon.bgGradient} rounded-2xl shadow-lg transform transition-all duration-500 hover:scale-105`}>
                    <ProgressIcon className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${progressIcon.color}`} />
                    {progress >= 100 && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-[#A5B99A] rounded-full flex items-center justify-center animate-ping">
                          <Star className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C2A29]">Your Progress</h2>
                      {progress >= 75 && (
                        <Award className="w-6 h-6 sm:w-7 sm:h-7 text-[#A5B99A]" />
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 mb-3">
                      <span className="font-semibold text-[#A5B99A]">{completedSections}</span> of <span className="font-semibold">{totalSections}</span> sections completed
                    </p>
                    <div className="flex items-center space-x-2">
                      <Target className={`w-4 h-4 ${progressIcon.color}`} />
                      <span className={`text-xs sm:text-sm font-medium ${progressIcon.color}`}>
                        {progressIcon.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Right side: Percentage */}
                <div className="text-center lg:text-right flex-shrink-0">
                  <div className="relative inline-block">
                    <div className={`text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] bg-clip-text text-transparent transition-all duration-500`}>
                      {Math.round(progress)}%
                    </div>
                    {progress >= 100 && (
                      <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A] animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-[#2C2A29] opacity-60 uppercase tracking-wider font-medium mt-2">
                    Complete
                  </div>
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-100/80 rounded-full h-5 sm:h-6 overflow-hidden shadow-inner">
                  <div
                    className={`bg-gradient-to-r from-[#A5B99A] via-[#93B0C8] to-[#A5B99A] h-full rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden`}
                    style={{ width: `${progress}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                {/* Milestone markers */}
                <div className="flex justify-between mt-2 text-xs text-[#2C2A29] opacity-40">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Checklist */}
        <div className="mb-10">
          <AIChecklist />
        </div>

        {/* Quick Actions / Next Steps */}
        {incompleteSections.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-xl">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A]" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2A29]">Next Steps</h2>
                  <p className="text-sm text-[#2C2A29] opacity-60 mt-0.5">Recommended actions to continue</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-[#A5B99A]/10 rounded-full">
                <Circle className="w-2 h-2 fill-[#A5B99A] text-[#A5B99A]" />
                <span className="text-sm font-semibold text-[#2C2A29]">
                  {incompleteSections.length} remaining
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {incompleteSections.slice(0, 3).map((section, index) => {
                const Icon = section.icon;
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-7 border border-gray-200/50 hover:border-[#A5B99A] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Number badge */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {index + 1}
                    </div>
                    
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${section.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 ${section.bgColor} rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${section.color.replace('bg-', 'text-')}`} />
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#2C2A29] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all flex-shrink-0" />
                      </div>
                      <h3 className="font-bold text-[#2C2A29] mb-2 text-lg sm:text-xl group-hover:text-[#93B0C8] transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed">
                        {section.description}
                      </p>
                      <div className="mt-4 flex items-center text-xs sm:text-sm font-semibold text-[#A5B99A] opacity-0 group-hover:opacity-100 transition-opacity">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* All Sections */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-[#93B0C8]/20 to-[#A5B99A]/20 rounded-xl">
                <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8]" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2A29]">All Sections</h2>
                <p className="text-sm text-[#2C2A29] opacity-60 mt-0.5">Complete your end-of-life planning</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#A5B99A]/10 to-[#93B0C8]/10 rounded-full border border-[#A5B99A]/20">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-[#A5B99A]" />
                <span className="text-sm font-semibold text-[#2C2A29]">
                  {completedSections}/{totalSections}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/50 hover:border-[#A5B99A] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 ${section.bgColor} rounded-xl shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${section.color.replace('bg-', 'text-')}`} />
                      </div>
                      {section.completed ? (
                        <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A] drop-shadow-lg" />
                          <span className="text-xs text-[#A5B99A] font-bold hidden sm:inline-block">Done</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 flex-shrink-0" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#2C2A29] mb-2 group-hover:text-[#93B0C8] transition-colors leading-tight">
                      {section.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-4 leading-relaxed flex-grow">
                      {section.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 group-hover:border-[#A5B99A]/30 transition-colors">
                      <span className={`text-xs sm:text-sm font-semibold ${section.completed ? 'text-[#A5B99A]' : 'text-[#2C2A29] opacity-60'} group-hover:text-[#A5B99A] transition-colors`}>
                        {section.completed ? 'View Details' : 'Get Started'}
                      </span>
                      <ArrowRight className={`w-4 h-4 ${section.completed ? 'text-[#A5B99A]' : 'text-gray-400'} group-hover:text-[#A5B99A] group-hover:translate-x-1 transition-all`} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
