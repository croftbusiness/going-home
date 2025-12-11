'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChefHat,
  BookOpen,
  Gift,
  Sparkles,
  MessageSquare,
  Music,
  Coffee,
  FileText,
  Heart,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface LegacySection {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  bgColor: string;
  completed: boolean;
}

export default function FamilyLegacyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sectionStatus, setSectionStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Check authentication
      const statusRes = await fetch('/api/user/status');
      if (!statusRes.ok) {
        router.push('/auth/login');
        return;
      }

      // Load section completion status
      await loadSectionStatus();
    } catch (error) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const loadSectionStatus = async () => {
    try {
      const response = await fetch('/api/user/family-legacy/status');
      if (response.ok) {
        const data = await response.json();
        setSectionStatus(data.status || {});
      }
    } catch (error) {
      console.error('Failed to load section status:', error);
    }
  };

  const sections: LegacySection[] = [
    {
      id: 'recipes',
      title: 'Favorite Recipes',
      description: 'Share your beloved recipes with the stories behind them',
      icon: ChefHat,
      href: '/dashboard/family-legacy/recipes',
      color: 'text-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-10',
      completed: sectionStatus.recipes || false,
    },
    {
      id: 'stories',
      title: 'Family Stories',
      description: 'Preserve your favorite memories and family tales',
      icon: BookOpen,
      href: '/dashboard/family-legacy/stories',
      color: 'text-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-10',
      completed: sectionStatus.stories || false,
    },
    {
      id: 'heirlooms',
      title: 'Heirlooms & Keepsakes',
      description: 'Document special items and who they should go to',
      icon: Gift,
      href: '/dashboard/family-legacy/heirlooms',
      color: 'text-[#EBD9B5]',
      bgColor: 'bg-[#EBD9B5] bg-opacity-10',
      completed: sectionStatus.heirlooms || false,
    },
    {
      id: 'traditions',
      title: 'Traditions to Continue',
      description: 'Keep your family traditions alive for future generations',
      icon: Sparkles,
      href: '/dashboard/family-legacy/traditions',
      color: 'text-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-10',
      completed: sectionStatus.traditions || false,
    },
    {
      id: 'advice',
      title: 'Life Advice',
      description: 'Share wisdom on marriage, parenting, faith, and more',
      icon: MessageSquare,
      href: '/dashboard/family-legacy/advice',
      color: 'text-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-10',
      completed: sectionStatus.advice || false,
    },
    {
      id: 'letters',
      title: 'Letters to Loved Ones',
      description: 'Write personal letters to family and friends',
      icon: Heart,
      href: '/dashboard/family-legacy/letters',
      color: 'text-[#EBD9B5]',
      bgColor: 'bg-[#EBD9B5] bg-opacity-10',
      completed: sectionStatus.letters || false,
    },
    {
      id: 'playlists',
      title: 'Favorite Music & Playlists',
      description: 'Share the songs that mean the most to you',
      icon: Music,
      href: '/dashboard/family-legacy/playlists',
      color: 'text-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-10',
      completed: sectionStatus.playlists || false,
    },
    {
      id: 'routines',
      title: 'Daily Routines & Comforts',
      description: 'Help them remember your daily life and special habits',
      icon: Coffee,
      href: '/dashboard/family-legacy/routines',
      color: 'text-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-10',
      completed: sectionStatus.routines || false,
    },
    {
      id: 'instructions',
      title: 'Important Instructions',
      description: 'Leave helpful guidance for handling your affairs',
      icon: FileText,
      href: '/dashboard/family-legacy/instructions',
      color: 'text-[#EBD9B5]',
      bgColor: 'bg-[#EBD9B5] bg-opacity-10',
      completed: sectionStatus.instructions || false,
    },
  ];

  const completedCount = Object.values(sectionStatus).filter(Boolean).length;
  const totalSections = sections.length;
  const progressPercentage = Math.round((completedCount / totalSections) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A5B99A] mx-auto mb-4"></div>
          <p className="text-[#2C2A29] opacity-70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] mb-4 shadow-lg">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2A29] mb-3">
            Family Legacy
          </h1>
          <p className="text-base sm:text-lg text-[#2C2A29] opacity-70 max-w-2xl mx-auto mb-6">
            Preserve the meaningful moments, traditions, and wisdom that will comfort your loved ones
          </p>
          
          {/* Why This Helps Loved Ones */}
          <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-white rounded-xl p-6 max-w-3xl mx-auto shadow-sm border border-gray-100">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl flex-shrink-0">
                <Heart className="w-6 h-6 text-[#A5B99A]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-2">
                  Why This Helps Your Loved Ones
                </h3>
                <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed">
                  Your family legacy is more than memories—it's the recipes, stories, traditions, advice, and 
                  personal touches that make you uniquely you. By documenting these now, you're giving your 
                  loved ones a way to keep you close. They'll be able to cook your favorite recipes, continue 
                  your traditions, read your stories, and hear your advice whenever they need comfort or connection. 
                  This legacy becomes a bridge between generations, ensuring your values, wisdom, and love continue 
                  to shape your family long after you're gone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 sm:mb-12 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#2C2A29] opacity-70">Progress</span>
              <span className="text-sm font-semibold text-[#2C2A29]">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-[#2C2A29] opacity-60 mt-2 text-center">
              {completedCount} of {totalSections} sections completed
            </p>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.id}
                href={section.href}
                className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200/50 hover:shadow-lg hover:border-[#A5B99A] transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${section.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${section.color}`} />
                  </div>
                  {section.completed && (
                    <CheckCircle2 className="w-5 h-5 text-[#A5B99A] flex-shrink-0" />
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#2C2A29] mb-2 group-hover:text-[#A5B99A] transition-colors">
                  {section.title}
                </h2>
                <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 mb-4 line-clamp-2">
                  {section.description}
                </p>
                <div className="flex items-center text-[#93B0C8] font-medium text-sm group-hover:text-[#A5B99A] transition-colors">
                  <span>{section.completed ? 'View' : 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State Message */}
        {completedCount === 0 && (
          <div className="mt-12 text-center max-w-2xl mx-auto">
            <p className="text-[#2C2A29] opacity-60 text-sm sm:text-base">
              This is your space to share the things that matter most. Start with any section that feels meaningful to you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



