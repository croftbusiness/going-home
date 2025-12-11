'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, Home, Users, Pill, Heart, Gift, HeartHandshake, Lightbulb, AlertCircle, MessageCircle } from 'lucide-react';

interface SectionStatus {
  careLocation: boolean;
  visitors: boolean;
  painManagement: boolean;
  lifeSustaining: boolean;
  organDonation: boolean;
  spiritualCare: boolean;
  sensoryEnvironment: boolean;
  emergencyInstructions: boolean;
  finalMoments: boolean;
}

export default function EndOfLifeDirectivesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({
    careLocation: false,
    visitors: false,
    painManagement: false,
    lifeSustaining: false,
    organDonation: false,
    spiritualCare: false,
    sensoryEnvironment: false,
    emergencyInstructions: false,
    finalMoments: false,
  });

  useEffect(() => {
    loadDirectives();
  }, []);

  const loadDirectives = async () => {
    try {
      const response = await fetch('/api/user/end-of-life-directives');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
      }

      const data = await response.json();
      if (data.directives) {
        // Check which sections have data
        setSectionStatus({
          careLocation: !!(data.directives.preferredPlaceToPass || data.directives.environmentPreferences),
          visitors: !!(data.directives.whoWantPresent || data.directives.visitorHours),
          painManagement: !!(data.directives.preferredPainMedications || data.directives.comfortMeasures),
          lifeSustaining: !!(data.directives.cprPreference || data.directives.ventilatorPreference),
          organDonation: !!(data.directives.donorStatus || data.directives.organsTissuesConsent),
          spiritualCare: !!(data.directives.preferredSpiritualLeader || data.directives.favoriteBibleVerses),
          sensoryEnvironment: !!(data.directives.lightingPreferences || data.directives.soundPreferences),
          emergencyInstructions: !!(data.directives.whoToCallFirst || data.directives.hospiceInstructions),
          finalMoments: !!(data.directives.whatLovedOnesShouldKnow || data.directives.finalMessageForFamily),
        });
      }
    } catch (error) {
      console.error('Failed to load directives:', error);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'care-location',
      title: 'Care Location',
      description: 'Where you want to pass and environment preferences',
      icon: Home,
      href: '/dashboard/end-of-life-directives/care-location',
      status: sectionStatus.careLocation,
    },
    {
      id: 'visitors',
      title: 'Visitors & Personal Presence',
      description: 'Who should be present and visitor preferences',
      icon: Users,
      href: '/dashboard/end-of-life-directives/visitors',
      status: sectionStatus.visitors,
    },
    {
      id: 'pain-management',
      title: 'Pain Management Preferences',
      description: 'Medications and comfort measures',
      icon: Pill,
      href: '/dashboard/end-of-life-directives/pain-management',
      status: sectionStatus.painManagement,
    },
    {
      id: 'life-sustaining',
      title: 'Life-Sustaining Treatment Decisions',
      description: 'CPR, ventilator, feeding tube, and other decisions',
      icon: Heart,
      href: '/dashboard/end-of-life-directives/life-sustaining',
      status: sectionStatus.lifeSustaining,
    },
    {
      id: 'organ-donation',
      title: 'Organ Donation Wishes',
      description: 'Your organ donation preferences',
      icon: Gift,
      href: '/dashboard/end-of-life-directives/organ-donation',
      status: sectionStatus.organDonation,
    },
    {
      id: 'spiritual-care',
      title: 'Spiritual Care',
      description: 'Spiritual leader, prayers, and worship preferences',
      icon: HeartHandshake,
      href: '/dashboard/end-of-life-directives/spiritual-care',
      status: sectionStatus.spiritualCare,
    },
    {
      id: 'sensory-environment',
      title: 'Sensory Environment Preferences',
      description: 'Lighting, sound, scents, and comfort items',
      icon: Lightbulb,
      href: '/dashboard/end-of-life-directives/sensory-environment',
      status: sectionStatus.sensoryEnvironment,
    },
    {
      id: 'emergency-instructions',
      title: 'Emergency Instructions',
      description: 'Who to call, when not to call 911, and important locations',
      icon: AlertCircle,
      href: '/dashboard/end-of-life-directives/emergency-instructions',
      status: sectionStatus.emergencyInstructions,
    },
    {
      id: 'final-moments',
      title: 'Final Moments Wishes',
      description: 'What you want loved ones to know and final messages',
      icon: MessageCircle,
      href: '/dashboard/end-of-life-directives/final-moments',
      status: sectionStatus.finalMoments,
    },
  ];

  const completedCount = Object.values(sectionStatus).filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-[#2C2A29]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-[#FCFAF7] border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">
                End-of-Life Directives
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Your comprehensive care plan for life's final stage
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Progress Indicator */}
        <div className="bg-[#FCFAF7] rounded-xl p-6 mb-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-[#2C2A29]">Your Progress</h2>
            <span className="text-sm text-[#2C2A29] opacity-70">
              {completedCount} of {sections.length} sections completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#A5B99A] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-[#FCFAF7] rounded-xl p-6 mb-8 shadow-sm border border-gray-200">
          <p className="text-[#2C2A29] leading-relaxed">
            This is your space to thoughtfully document your wishes for end-of-life care. 
            Like a birth plan, but for life's final stage, this guide helps ensure your 
            preferences are honored with dignity and respect. Take your time, and know that 
            you can update these preferences at any time.
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.id}
                href={section.href}
                className="bg-[#FCFAF7] rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                    section.status 
                      ? 'bg-[#A5B99A] text-white' 
                      : 'bg-gray-100 text-[#2C2A29] group-hover:bg-[#A5B99A] group-hover:text-white transition-colors'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-medium text-[#2C2A29] group-hover:text-[#A5B99A] transition-colors">
                        {section.title}
                      </h3>
                      {section.status ? (
                        <CheckCircle2 className="w-5 h-5 text-[#A5B99A] flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-[#2C2A29] opacity-70">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

