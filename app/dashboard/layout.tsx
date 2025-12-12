'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  FileText,
  Heart,
  Upload,
  Mail,
  Users,
  Shield,
  LogOut,
  Menu,
  X,
  Home,
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
  Stethoscope,
  Sparkles,
  FolderHeart,
  CreditCard,
  FileQuestion,
  PenTool,
  Settings,
  LayoutDashboard,
  Gift,
  Calculator,
  Eye,
  Music,
  AlertCircle,
} from 'lucide-react';

// Preparedness-first navigation: 5 purpose-based sections
// Organized by preparedness priority, not feature categories
const navigation = [
  // 1️⃣ If Something Happens - PRIMARY, VISUALLY EMPHASIZED
  { 
    name: 'If Something Happens', 
    href: '/dashboard/if-something-happens', 
    icon: AlertCircle, 
    section: 'preparedness',
    primary: true, // Mark as primary for visual emphasis
  },
  
  // 2️⃣ People & Access - Who helps and who is allowed to act
  { name: 'Emergency & Trusted Contacts', href: '/dashboard/trusted-contacts', icon: Users, section: 'people' },
  { name: 'Access Overview', href: '/dashboard/access-overview', icon: Eye, section: 'people' },
  { name: 'Shared With Me', href: '/dashboard/shared-with-me', icon: Users, section: 'people' },
  { name: 'Access Rules', href: '/dashboard/release-settings', icon: Shield, section: 'people' },
  
  // 3️⃣ Health & Care - How care decisions should be handled
  { name: 'Medical & Legal', href: '/dashboard/medical-contacts', icon: Stethoscope, section: 'health' },
  { name: 'Care Preferences & Directives', href: '/dashboard/end-of-life-directives', icon: Heart, section: 'health' },
  { name: 'Care Checklist', href: '/dashboard/end-of-life-checklist', icon: CheckSquare, section: 'health' },
  { name: 'Personal Details', href: '/dashboard/personal-details', icon: User, section: 'health' },
  
  // 4️⃣ Documents & Finances - What information is needed to keep life functioning
  { name: 'Important Documents', href: '/dashboard/documents', icon: Upload, section: 'documents' },
  { name: 'Insurance & Financial', href: '/dashboard/insurance-financial', icon: CreditCard, section: 'documents' },
  { name: 'Assets', href: '/dashboard/assets', icon: DollarSign, section: 'documents' },
  { name: 'Digital Accounts', href: '/dashboard/digital-accounts', icon: Key, section: 'documents' },
  { name: 'Will Questionnaire', href: '/dashboard/will-questionnaire', icon: FileQuestion, section: 'documents' },
  
  // 5️⃣ Legacy & Wishes - Meaning, wishes, and remembrance (non-urgent)
  { name: 'Messages & Guidance', href: '/dashboard/letters', icon: PenTool, section: 'legacy' },
  { name: 'Life Event Planning', href: '/dashboard/life-event-planning', icon: Sparkles, section: 'legacy' },
  { name: 'Family Legacy', href: '/dashboard/family-legacy', icon: Gift, section: 'legacy' },
  { name: 'Biography', href: '/dashboard/biography', icon: BookOpen, section: 'legacy' },
  { name: 'Legacy Messages', href: '/dashboard/legacy-messages', icon: Video, section: 'legacy' },
  { name: 'Children\'s Wishes', href: '/dashboard/children-wishes', icon: Baby, section: 'legacy' },
  { name: 'My Music', href: '/dashboard/my-music', icon: Music, section: 'legacy' },
  { name: 'Life Event Preferences', href: '/dashboard/funeral-preferences', icon: Heart, section: 'legacy' },
  { name: 'Life Event Cost Calculator', href: '/dashboard/funeral-cost-calculator', icon: Calculator, section: 'legacy' },
  { name: 'Household Info', href: '/dashboard/household', icon: HomeIcon, section: 'legacy' },
  
  // Utility - Visually separated from preparedness flow
  { name: 'Complete Summary', href: '/dashboard/final-summary', icon: FileCheck, section: 'utility' },
  { name: 'Account Settings', href: '/dashboard/account-settings', icon: Settings, section: 'utility' },
];

const sectionLabels: Record<string, string> = {
  preparedness: '', // No label for primary section
  people: 'People & Access',
  health: 'Health & Care',
  documents: 'Documents & Finances',
  legacy: 'Legacy & Wishes',
  utility: '', // Visually separated, no label needed
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const [statusRes, personalRes] = await Promise.all([
        fetch('/api/user/status'),
        fetch('/api/user/personal-details'),
      ]);
      
      // Prioritize personal details for name display
      if (personalRes.ok) {
        const personalData = await personalRes.json();
        if (personalData.personalDetails) {
          // Use preferred name if available, otherwise full name
          const displayName = personalData.personalDetails.preferredName || 
                             personalData.personalDetails.fullName || 
                             'User';
          setUserName(displayName);
          
          if (personalData.personalDetails.profilePictureUrl) {
            setProfilePictureUrl(personalData.personalDetails.profilePictureUrl);
          }
        } else if (statusRes.ok) {
          // Fallback to email-based username if no personal details
          const statusData = await statusRes.json();
          setUserName(statusData.userName || 'User');
        }
      } else if (statusRes.ok) {
        // Fallback to email-based username if personal details fetch fails
        const statusData = await statusRes.json();
        setUserName(statusData.userName || 'User');
      }
    } catch (error) {
      // Ignore errors
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#FCFAF7] to-white border-r border-gray-200/50 shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
            <Link href="/dashboard" className="flex items-center group">
              <div className="relative h-8 flex-shrink-0">
                <Image
                  src="/logo.svg"
                  alt="StillReady Logo"
                  width={160}
                  height={40}
                  className="object-contain h-8 w-auto"
                  priority
                />
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#2C2A29]" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="space-y-6">
              {Object.entries(
                navigation.reduce((acc, item) => {
                  const section = item.section || 'preparedness';
                  if (!acc[section]) acc[section] = [];
                  acc[section].push(item);
                  return acc;
                }, {} as Record<string, Array<typeof navigation[0]>>)
              ).map(([section, items]) => {
                const isPreparednessSection = section === 'preparedness';
                const isUtilitySection = section === 'utility';
                const sectionLabel = sectionLabels[section];
                
                return (
                  <div key={section} className={isUtilitySection ? 'mt-8 pt-6 border-t border-gray-200/50' : ''}>
                    {sectionLabel && (
                      <div className="px-4 py-2 mb-2">
                        <p className="text-xs font-semibold text-[#2C2A29] opacity-40 uppercase tracking-wider">
                          {sectionLabel}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const isPrimary = item.primary || false;
                        
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                              group flex items-center space-x-3 px-4 py-3 sm:py-2.5 rounded-xl transition-all duration-200 relative touch-target min-h-[44px]
                              ${isActive
                                ? 'bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white shadow-md shadow-[#A5B99A]/20'
                                : isPrimary
                                ? 'text-[#2C2A29] hover:bg-[#A5B99A]/10 hover:text-[#A5B99A] font-semibold'
                                : 'text-[#2C2A29] hover:bg-gray-50 hover:text-[#93B0C8]'
                              }
                              ${isPrimary ? 'mb-2' : ''}
                            `}
                          >
                            <div className={`
                              p-2 sm:p-1.5 rounded-lg transition-all flex-shrink-0
                              ${isActive 
                                ? 'bg-white/20' 
                                : isPrimary
                                ? 'bg-[#A5B99A]/10 group-hover:bg-[#A5B99A]/20'
                                : 'bg-gray-100 group-hover:bg-[#A5B99A]/10'
                              }
                            `}>
                              <Icon className={`w-5 h-5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : isPrimary ? 'text-[#A5B99A]' : 'text-[#2C2A29] opacity-70'}`} />
                            </div>
                            <span className={`text-sm sm:text-base ${isActive ? 'text-white font-medium' : isPrimary ? 'text-[#2C2A29] font-semibold' : 'text-[#2C2A29] font-medium'} flex-1`}>
                              {item.name}
                            </span>
                            {isActive && (
                              <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/60" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
            <div className="px-4 py-3 mb-3 bg-gradient-to-br from-[#FAF9F7] to-white rounded-xl border border-gray-200/50">
              <div className="flex items-center space-x-3">
                {profilePictureUrl ? (
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#A5B99A] shadow-sm flex-shrink-0">
                    <img
                      src={profilePictureUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.nextElementSibling) {
                          (target.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] border-2 border-white shadow-sm flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#2C2A29] opacity-50 mb-0.5 font-medium">Signed in as</p>
                  <p className="text-sm font-semibold text-[#2C2A29] truncate">
                    {userName || 'User'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-[#2C2A29] hover:bg-gray-100 rounded-xl transition-all duration-200 touch-target border border-gray-200/50 hover:border-gray-300"
            >
              <LogOut className="w-4 h-4 opacity-70" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-[#FCFAF7] border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-[#2C2A29]" />
            </button>
            <Link href="/dashboard" className="flex items-center">
              <div className="relative h-7 flex-shrink-0">
                <Image
                  src="/logo.svg"
                  alt="StillReady Logo"
                  width={140}
                  height={35}
                  className="object-contain h-7 w-auto"
                />
              </div>
            </Link>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

