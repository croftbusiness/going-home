'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Personal Details', href: '/dashboard/personal-details', icon: User },
  { name: 'Medical & Legal', href: '/dashboard/medical-contacts', icon: Heart },
  { name: 'Funeral Preferences', href: '/dashboard/funeral-preferences', icon: FileText },
  { name: 'Will Questionnaire', href: '/dashboard/will-questionnaire', icon: Scale },
  { name: 'Documents', href: '/dashboard/documents', icon: Upload },
  { name: 'Letters', href: '/dashboard/letters', icon: Mail },
  { name: 'Trusted Contacts', href: '/dashboard/trusted-contacts', icon: Users },
  { name: 'Digital Accounts', href: '/dashboard/digital-accounts', icon: Key },
  { name: 'Assets', href: '/dashboard/assets', icon: DollarSign },
  { name: 'Legacy Messages', href: '/dashboard/legacy-messages', icon: Video },
  { name: 'End-of-Life Checklist', href: '/dashboard/end-of-life-checklist', icon: CheckSquare },
  { name: 'Biography', href: '/dashboard/biography', icon: BookOpen },
  { name: 'Insurance & Financial', href: '/dashboard/insurance-financial', icon: Building2 },
  { name: 'Household Info', href: '/dashboard/household', icon: HomeIcon },
  { name: 'Children\'s Wishes', href: '/dashboard/children-wishes', icon: Baby },
  { name: 'Final Summary', href: '/dashboard/final-summary', icon: FileCheck },
  { name: 'Release Settings', href: '/dashboard/release-settings', icon: Shield },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const response = await fetch('/api/user/status');
      if (response.ok) {
        const data = await response.json();
        setUserName(data.userName);
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
        fixed inset-y-0 left-0 z-50 w-64 bg-[#FCFAF7] border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-semibold text-[#2C2A29]">Going Home</h1>
              <p className="text-xs text-[#2C2A29] opacity-60 mt-0.5">Secure Planning</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#2C2A29]" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] font-medium border-l-3 border-[#A5B99A]'
                        : 'text-[#2C2A29] hover:bg-white hover:text-[#93B0C8]'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#A5B99A]' : 'opacity-70'}`} />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="px-4 py-2 mb-3">
              <p className="text-xs text-[#2C2A29] opacity-60 mb-1">Signed in as</p>
              <p className="text-sm font-medium text-[#2C2A29] truncate">
                {userName || 'User'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-[#2C2A29] hover:bg-white rounded-lg transition-colors"
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
            <h1 className="text-lg font-semibold text-[#2C2A29]">Going Home</h1>
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

