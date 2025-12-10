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
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
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
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const response = await fetch('/api/user/status');
      if (!response.ok) {
        router.push('/auth/login');
        return;
      }

      const data = await response.json();
      setUserName(data.userName);
      setStatus(data.status);
    } catch (error) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const completedSections = Object.values(status).filter(Boolean).length;
  const totalSections = Object.keys(status).length;
  const progress = (completedSections / totalSections) * 100;

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
      title: 'Funeral Preferences',
      description: 'Your wishes for services',
      icon: FileText,
      href: '/dashboard/funeral-preferences',
      completed: status.funeralPreferences,
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
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
      title: 'Letters',
      description: 'Personal messages for family',
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-[#2C2A29]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-[#2C2A29] mb-3">
            Welcome back, {userName || 'there'}
          </h1>
          <p className="text-lg text-[#2C2A29] opacity-70">
            Continue organizing your information and preferences
          </p>
        </div>

        {/* Progress Overview Card */}
        <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-white rounded-xl p-8 shadow-md border border-gray-100 mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] bg-opacity-10 rounded-xl">
                <TrendingUp className="w-7 h-7 text-[#A5B99A]" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#2C2A29] mb-1">Your Progress</h2>
                <p className="text-sm text-[#2C2A29] opacity-60">
                  {completedSections} of {totalSections} sections completed
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-4xl font-bold text-[#A5B99A] mb-1">{Math.round(progress)}%</div>
              <div className="text-xs text-[#2C2A29] opacity-60 uppercase tracking-wide">Complete</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-[#A5B99A] via-[#93B0C8] to-[#A5B99A] h-4 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions / Next Steps */}
        {incompleteSections.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#2C2A29]">Next Steps</h2>
              <span className="text-sm text-[#2C2A29] opacity-60">
                {incompleteSections.length} remaining
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {incompleteSections.slice(0, 3).map((section) => {
                const Icon = section.icon;
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-[#A5B99A] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 ${section.bgColor} rounded-xl`}>
                        <Icon className={`w-6 h-6 ${section.color.replace('bg-', 'text-')}`} />
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#2C2A29] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-semibold text-[#2C2A29] mb-2 text-lg">{section.title}</h3>
                    <p className="text-sm text-[#2C2A29] opacity-70">{section.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* All Sections */}
        <div>
          <h2 className="text-2xl font-semibold text-[#2C2A29] mb-6">All Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-[#A5B99A] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3.5 ${section.bgColor} rounded-xl shadow-sm`}>
                      <Icon className={`w-6 h-6 ${section.color.replace('bg-', 'text-')}`} />
                    </div>
                    {section.completed ? (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-5 h-5 text-[#A5B99A]" />
                        <span className="text-xs text-[#A5B99A] font-medium">Done</span>
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-[#2C2A29] mb-2 group-hover:text-[#93B0C8] transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-[#2C2A29] opacity-70 mb-4 leading-relaxed">
                    {section.description}
                  </p>
                  <div className="flex items-center text-sm text-[#A5B99A] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {section.completed ? 'View Details' : 'Get Started'} 
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
