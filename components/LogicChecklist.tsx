'use client';

import { CheckCircle2, ArrowRight, Target } from 'lucide-react';
import Link from 'next/link';

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

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  actionUrl: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface LogicChecklistProps {
  status: SectionStatus;
}

export default function LogicChecklist({ status }: LogicChecklistProps) {
  // Define essential sections with priority and metadata
  const essentialSections: Array<{
    key: keyof SectionStatus;
    title: string;
    description: string;
    href: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }> = [
    {
      key: 'personalDetails',
      title: 'Complete Personal Details',
      description: 'Add your basic information, contact details, and profile picture',
      href: '/dashboard/personal-details',
      priority: 'high',
      category: 'Essential',
    },
    {
      key: 'trustedContacts',
      title: 'Add Emergency & Trusted Contacts',
      description: 'Designate people who can access your information when needed',
      href: '/dashboard/trusted-contacts',
      priority: 'high',
      category: 'Essential',
    },
    {
      key: 'medicalContacts',
      title: 'Complete Medical & Legal Information',
      description: 'Add medical conditions, medications, allergies, and healthcare contacts',
      href: '/dashboard/medical-legal',
      priority: 'high',
      category: 'Essential',
    },
    {
      key: 'documents',
      title: 'Upload Important Documents',
      description: 'Store ID, insurance cards, legal documents, and directives',
      href: '/dashboard/documents',
      priority: 'high',
      category: 'Essential',
    },
    {
      key: 'insuranceFinancial',
      title: 'Add Insurance & Financial Information',
      description: 'Include insurance policies, financial accounts, and advisors',
      href: '/dashboard/insurance-financial',
      priority: 'high',
      category: 'Financial',
    },
    {
      key: 'releaseSettings',
      title: 'Set Up Access Rules',
      description: 'Configure who can access your information and when',
      href: '/dashboard/release-settings',
      priority: 'medium',
      category: 'Security',
    },
    {
      key: 'letters',
      title: 'Write Messages & Guidance',
      description: 'Create heartfelt messages for your loved ones',
      href: '/dashboard/letters',
      priority: 'medium',
      category: 'Legacy',
    },
    {
      key: 'funeralPreferences',
      title: 'Set Life Event Preferences',
      description: 'Specify your wishes for services and ceremonies',
      href: '/dashboard/funeral-preferences',
      priority: 'medium',
      category: 'Planning',
    },
    {
      key: 'endOfLifeDirectives',
      title: 'Complete Care Preferences & Directives',
      description: 'Document your care preferences and advance directives',
      href: '/dashboard/end-of-life-directives',
      priority: 'medium',
      category: 'Health',
    },
    {
      key: 'biography',
      title: 'Write Your Biography',
      description: 'Share your life story, memories, and accomplishments',
      href: '/dashboard/biography',
      priority: 'low',
      category: 'Legacy',
    },
    {
      key: 'familyLegacy',
      title: 'Create Family Legacy',
      description: 'Preserve recipes, stories, traditions, and keepsakes',
      href: '/dashboard/family-legacy',
      priority: 'low',
      category: 'Legacy',
    },
    {
      key: 'legacyMessages',
      title: 'Record Legacy Messages',
      description: 'Create video and audio messages for your loved ones',
      href: '/dashboard/legacy-messages',
      priority: 'low',
      category: 'Legacy',
    },
    {
      key: 'assets',
      title: 'Document Your Assets',
      description: 'List your property, investments, and valuable possessions',
      href: '/dashboard/assets',
      priority: 'medium',
      category: 'Financial',
    },
    {
      key: 'digitalAccounts',
      title: 'Add Digital Accounts',
      description: 'Document your online accounts and passwords',
      href: '/dashboard/digital-accounts',
      priority: 'medium',
      category: 'Security',
    },
    {
      key: 'willQuestionnaire',
      title: 'Complete Will Questionnaire',
      description: 'Answer questions to help create your will',
      href: '/dashboard/will-questionnaire',
      priority: 'low',
      category: 'Legal',
    },
    {
      key: 'childrenWishes',
      title: 'Add Children\'s Wishes',
      description: 'Messages, guardianship, and special wishes for your children',
      href: '/dashboard/children-wishes',
      priority: 'medium',
      category: 'Family',
    },
    {
      key: 'household',
      title: 'Complete Household Info',
      description: 'Add information about your household and family members',
      href: '/dashboard/household',
      priority: 'low',
      category: 'Personal',
    },
    {
      key: 'endOfLifeChecklist',
      title: 'Complete Care Checklist',
      description: 'Check off important care-related tasks and preferences',
      href: '/dashboard/end-of-life-checklist',
      priority: 'low',
      category: 'Health',
    },
  ];

  // Filter to only incomplete sections and sort by priority
  const incompleteItems: ChecklistItem[] = essentialSections
    .filter(section => !status[section.key])
    .map(section => ({
      id: section.key,
      title: section.title,
      description: section.description,
      actionUrl: section.href,
      priority: section.priority,
      category: section.category,
    }))
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 4); // Limit to 4 items

  // Calculate completion percentage
  const totalSections = essentialSections.length;
  const completedSections = essentialSections.filter(section => status[section.key]).length;
  const completionPercentage = Math.round((completedSections / totalSections) * 100);

  if (incompleteItems.length === 0) {
    return (
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10 rounded-full blur-3xl -z-0"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-xl shadow-md">
              <Target className="w-6 h-6 sm:w-7 sm:h-7 text-[#A5B99A]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2A29] mb-2">
                Your Personalized Checklist
              </h2>
              <p className="text-sm text-[#2C2A29] opacity-70">
                Suggestions based on your current progress
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-6 p-4 bg-gradient-to-r from-[#A5B99A]/10 to-[#93B0C8]/10 rounded-xl border border-[#A5B99A]/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-[#A5B99A]" />
                <span className="text-sm font-semibold text-[#2C2A29]">Overall Progress</span>
              </div>
              <span className="text-lg font-bold text-[#A5B99A]">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-[#A5B99A] via-[#93B0C8] to-[#A5B99A] h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="text-center py-12">
            <div className="relative inline-block mb-4">
              <CheckCircle2 className="w-16 h-16 text-[#A5B99A] mx-auto" />
              <div className="absolute inset-0 bg-[#A5B99A]/20 rounded-full blur-xl"></div>
            </div>
            <h3 className="text-xl font-bold text-[#2C2A29] mb-2">You're All Set!</h3>
            <p className="text-[#2C2A29] opacity-70 max-w-md mx-auto">
              Great job! Your profile looks complete. You can always add more information as needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200/50 overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10 rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-xl shadow-md">
            <Target className="w-6 h-6 sm:w-7 sm:h-7 text-[#A5B99A]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2A29] mb-2">
              Your Personalized Checklist
            </h2>
            <p className="text-sm text-[#2C2A29] opacity-70">
              Suggestions based on your current progress
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-6 p-4 bg-gradient-to-r from-[#A5B99A]/10 to-[#93B0C8]/10 rounded-xl border border-[#A5B99A]/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-[#A5B99A]" />
              <span className="text-sm font-semibold text-[#2C2A29]">Overall Progress</span>
            </div>
            <span className="text-lg font-bold text-[#A5B99A]">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-[#A5B99A] via-[#93B0C8] to-[#A5B99A] h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {incompleteItems.map((item, index) => (
            <Link
              key={item.id}
              href={item.actionUrl}
              className="group flex items-start space-x-4 p-5 bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-xl hover:border-[#A5B99A] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative"
            >
              {/* Number badge */}
              <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}
              </div>

              {/* Priority indicator bar */}
              <div className={`w-1 rounded-full flex-shrink-0 ${
                item.priority === 'high' ? 'bg-red-500' :
                item.priority === 'medium' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}></div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#2C2A29] text-base sm:text-lg mb-2 group-hover:text-[#93B0C8] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm ${
                        item.priority === 'high' ? 'bg-red-100 text-red-700' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {item.actionUrl && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 group-hover:border-[#A5B99A]/30 transition-colors">
                    <span className="text-sm font-semibold text-[#A5B99A] group-hover:text-[#93B0C8] transition-colors">
                      Get Started
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#A5B99A] group-hover:text-[#93B0C8] group-hover:translate-x-1 transition-all" />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

