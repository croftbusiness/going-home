'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Heart, 
  Music, 
  Sparkles, 
  Calendar,
  Users,
  FileText,
  Palette,
  AlertCircle,
  Stethoscope,
  Plane,
  Car,
  Shield,
  Home,
  Briefcase,
  Lock,
  FileCheck,
} from 'lucide-react';

interface EventType {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  bgColor: string;
  category: 'unavailable' | 'emergency' | 'planning';
}

export default function LifeEventPlanningPage() {
  const router = useRouter();

  const eventTypes: EventType[] = [
    // When You're Not Available
    {
      id: 'funeral-memorial',
      title: 'Funeral & Memorial Service',
      description: 'Plan your memorial service, celebration of life, or funeral ceremony in advance',
      icon: Heart,
      href: '/dashboard/funeral-planning',
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
      category: 'unavailable',
    },
    {
      id: 'medical-emergency',
      title: 'Medical Emergency',
      description: 'Prepare for medical emergencies, hospitalizations, and healthcare decisions',
      icon: Stethoscope,
      href: '/dashboard/if-something-happens',
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
      category: 'unavailable',
    },
    {
      id: 'incapacitated',
      title: 'Incapacitation',
      description: 'Plan for situations where you cannot make decisions or handle your affairs',
      icon: AlertCircle,
      href: '/dashboard/if-something-happens',
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
      category: 'unavailable',
    },
    {
      id: 'accident',
      title: 'Accident or Injury',
      description: 'Prepare for accidents, injuries, or sudden health events that require immediate attention',
      icon: Car,
      href: '/dashboard/if-something-happens',
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
      category: 'unavailable',
    },
    {
      id: 'traveling',
      title: 'Traveling Away',
      description: 'Plan for emergencies while traveling, including medical care and document access',
      icon: Plane,
      href: '/dashboard/if-something-happens',
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
      category: 'unavailable',
    },
    {
      id: 'hospitalization',
      title: 'Hospitalization',
      description: 'Prepare for hospital stays, surgeries, and extended medical care',
      icon: Home,
      href: '/dashboard/if-something-happens',
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
      category: 'unavailable',
    },
    
    // Emergency Situations
    {
      id: 'legal-incapacity',
      title: 'Legal Incapacity',
      description: 'Plan for legal incapacity, guardianship, and power of attorney situations',
      icon: Shield,
      href: '/dashboard/end-of-life-directives',
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
      category: 'emergency',
    },
    {
      id: 'financial-emergency',
      title: 'Financial Emergency Access',
      description: 'Ensure loved ones can access accounts and handle financial matters if needed',
      icon: Briefcase,
      href: '/dashboard/digital-accounts',
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
      category: 'emergency',
    },
    {
      id: 'document-access',
      title: 'Document Access',
      description: 'Organize important documents so they can be accessed when you cannot',
      icon: FileCheck,
      href: '/dashboard/documents',
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
      category: 'emergency',
    },
    {
      id: 'care-preferences',
      title: 'Care Preferences',
      description: 'Document your care preferences, directives, and medical wishes in advance',
      icon: Heart,
      href: '/dashboard/end-of-life-directives',
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
      category: 'emergency',
    },
    
    // Planning Tools
    {
      id: 'story',
      title: 'Life Story',
      description: 'Create your life story so it can be shared when you cannot tell it yourself',
      icon: FileText,
      href: '/dashboard/funeral-planning/story',
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
      category: 'planning',
    },
    {
      id: 'visual-planning',
      title: 'Visual Planning Board',
      description: 'Plan visual elements for ceremonies and services in advance',
      icon: Palette,
      href: '/dashboard/funeral-planning/planning-board',
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
      category: 'planning',
    },
    {
      id: 'music',
      title: 'Music & Playlists',
      description: 'Create playlists for ceremonies and meaningful moments',
      icon: Music,
      href: '/dashboard/funeral-planning/playlist',
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
      category: 'planning',
    },
    {
      id: 'ceremony-script',
      title: 'Ceremony Script',
      description: 'Plan ceremony scripts, readings, and words to be shared',
      icon: FileText,
      href: '/dashboard/funeral-planning/script',
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
      category: 'planning',
    },
    {
      id: 'cost-calculator',
      title: 'Cost Calculator',
      description: 'Estimate and plan expenses for ceremonies and services',
      icon: Calendar,
      href: '/dashboard/funeral-cost-calculator',
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
      category: 'planning',
    },
  ];

  const unavailableEvents = eventTypes.filter(e => e.category === 'unavailable');
  const emergencyEvents = eventTypes.filter(e => e.category === 'emergency');
  const planningTools = eventTypes.filter(e => e.category === 'planning');

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <header className="bg-[#FCFAF7] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#2C2A29]">
                Life Event Planning
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Plan meaningful ceremonies and celebrations for life's important moments
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Welcome Message */}
        <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8 sm:mb-10">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl flex-shrink-0">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#A5B99A]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#2C2A29] mb-2">
                Plan for when you can't be there
              </h2>
              <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 leading-relaxed">
                Life's unexpected moments happen when we least expect them. These tools help you prepare for 
                situations where you cannot make decisions or handle things yourself—from medical emergencies 
                and accidents to hospitalization and incapacity. Planning ahead gives your loved ones clarity 
                and peace of mind when they need it most.
              </p>
            </div>
          </div>
        </div>

        {/* When You're Not Available */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-xl">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2A29]">When You're Not Available</h2>
              <p className="text-sm text-[#2C2A29] opacity-60 mt-0.5">Plan for situations where you cannot handle things yourself</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {unavailableEvents.map((event) => {
              const Icon = event.icon;
              return (
                <Link
                  key={event.id}
                  href={event.href}
                  className="group bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:border-[#A5B99A] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`p-3 ${event.bgColor} rounded-xl mb-4 inline-flex`}>
                    <Icon className={`w-6 h-6 ${event.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#2C2A29] mb-2 group-hover:text-[#93B0C8] transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-[#A5B99A] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Get Started →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Emergency Situations */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-[#93B0C8]/20 to-[#A5B99A]/20 rounded-xl">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2A29]">Emergency Situations</h2>
              <p className="text-sm text-[#2C2A29] opacity-60 mt-0.5">Prepare for emergencies and ensure access to important information</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {emergencyEvents.map((event) => {
              const Icon = event.icon;
              return (
                <Link
                  key={event.id}
                  href={event.href}
                  className="group bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:border-[#93B0C8] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`p-3 ${event.bgColor} rounded-xl mb-4 inline-flex`}>
                    <Icon className={`w-6 h-6 ${event.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#2C2A29] mb-2 group-hover:text-[#A5B99A] transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-[#93B0C8] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Get Started →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Planning Tools */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-xl">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2A29]">Planning Tools</h2>
              <p className="text-sm text-[#2C2A29] opacity-60 mt-0.5">Tools to help you plan any meaningful event</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {planningTools.map((event) => {
              const Icon = event.icon;
              return (
                <Link
                  key={event.id}
                  href={event.href}
                  className="group bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:border-[#A5B99A] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`p-3 ${event.bgColor} rounded-xl mb-4 inline-flex`}>
                    <Icon className={`w-6 h-6 ${event.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#2C2A29] mb-2 group-hover:text-[#93B0C8] transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-[#A5B99A] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Get Started →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Helpful Note */}
        <div className="bg-gradient-to-br from-[#FCFAF7] to-white rounded-xl p-6 sm:p-8 border border-[#A5B99A]/20">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-[#A5B99A] bg-opacity-10 rounded-lg flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#A5B99A]" />
            </div>
            <div>
              <h4 className="font-semibold text-[#2C2A29] mb-2">Why This Matters</h4>
              <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed">
                Planning for situations where you cannot be there gives your loved ones clarity and peace of mind. 
                This helps the people you love know what to do. Our tools guide you through each step, helping you 
                express your wishes in advance. You're always in control, and you can update everything as your 
                situation changes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

