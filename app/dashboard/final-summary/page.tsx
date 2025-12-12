'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileCheck, User, Heart, FileText, Upload, Mail, Users, Key, DollarSign, Video, 
  CheckSquare, BookOpen, Building2, Home as HomeIcon, Baby, Shield, ArrowLeft,
  Download, FileDown, CheckCircle2, Circle, Sparkles, FileX, AlertCircle
} from 'lucide-react';

interface SectionOption {
  id: string;
  label: string;
  description: string;
  icon: any;
  color: string;
}

const sectionOptions: SectionOption[] = [
  { id: 'personalDetails', label: 'Personal Details', description: 'Name, address, contact information', icon: User, color: 'bg-[#A5B99A]' },
  { id: 'medicalContacts', label: 'Medical & Legal Contacts', description: 'Physician, attorney, medical notes', icon: Heart, color: 'bg-[#93B0C8]' },
  { id: 'endOfLifeDirectives', label: 'End-of-Life Directives', description: 'Care preferences, treatment decisions, final wishes', icon: Heart, color: 'bg-[#A5B99A]' },
  { id: 'funeralPreferences', label: 'Life Event Preferences', description: 'Service type, songs, atmosphere wishes', icon: FileText, color: 'bg-[#93B0C8]' },
  { id: 'trustedContacts', label: 'Emergency & Trusted Contacts', description: 'Family and friends with access', icon: Users, color: 'bg-[#A5B99A]' },
  { id: 'documents', label: 'Important Documents', description: 'Wills, IDs, insurance papers', icon: Upload, color: 'bg-[#93B0C8]' },
  { id: 'assets', label: 'Assets', description: 'Properties, vehicles, investments', icon: DollarSign, color: 'bg-[#A5B99A]' },
  { id: 'insuranceFinancial', label: 'Insurance & Financial', description: 'Policies, accounts, advisors', icon: Building2, color: 'bg-[#93B0C8]' },
  { id: 'household', label: 'Household Information', description: 'Pet care, access codes, utilities', icon: HomeIcon, color: 'bg-[#A5B99A]' },
  { id: 'digitalAccounts', label: 'Digital Accounts', description: 'Online accounts and passwords', icon: Key, color: 'bg-[#93B0C8]' },
  { id: 'childrenWishes', label: 'Children\'s Wishes', description: 'Messages and guardianship info', icon: Baby, color: 'bg-[#A5B99A]' },
  { id: 'biography', label: 'Personal Biography', description: 'Life story and accomplishments', icon: BookOpen, color: 'bg-[#93B0C8]' },
];

const templates = {
  executor: {
    name: 'For Executor',
    description: 'Essential information for your executor to handle your affairs',
    sections: ['personalDetails', 'medicalContacts', 'trustedContacts', 'documents', 'assets', 'insuranceFinancial', 'household', 'digitalAccounts'],
    icon: Shield,
  },
  family: {
    name: 'For Family',
    description: 'Personal information and wishes to share with loved ones',
    sections: ['personalDetails', 'funeralPreferences', 'endOfLifeDirectives', 'biography', 'childrenWishes'],
    icon: Users,
  },
  medical: {
    name: 'For Medical Team',
    description: 'Medical directives and care preferences for healthcare providers',
    sections: ['personalDetails', 'medicalContacts', 'endOfLifeDirectives'],
    icon: Heart,
  },
  complete: {
    name: 'Complete Summary',
    description: 'Everything - all sections included',
    sections: sectionOptions.map(s => s.id),
    icon: FileCheck,
  },
};

export default function FinalSummaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showSectionDetails, setShowSectionDetails] = useState<string | null>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    if (selectedTemplate && templates[selectedTemplate as keyof typeof templates]) {
      const templateSections = templates[selectedTemplate as keyof typeof templates].sections;
      // Only include sections that have data
      const availableSections = templateSections.filter(sectionId => {
        const key = sectionId as keyof typeof summary;
        return summary && summary[key] !== null && summary[key] !== undefined &&
               (Array.isArray(summary[key]) ? (summary[key] as any[]).length > 0 : true);
      });
      setSelectedSections(availableSections);
    }
  }, [selectedTemplate, summary]);

  const loadSummary = async () => {
    try {
      const response = await fetch('/api/user/final-summary');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load summary');
      }

      const data = await response.json();
      setSummary(data.summary);
      
      // Default to all available sections
      const availableSections = sectionOptions
        .filter(section => {
          const key = section.id as keyof typeof data.summary;
          return data.summary[key] !== null && data.summary[key] !== undefined;
        })
        .map(s => s.id);
      setSelectedSections(availableSections);
    } catch (err: any) {
      setError(err.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
    setSelectedTemplate(null); // Clear template when manually selecting
  };

  const handleSelectAll = () => {
    const availableSections = sectionOptions
      .filter(section => {
        const key = section.id as keyof typeof summary;
        return summary && summary[key] !== null && summary[key] !== undefined &&
               (Array.isArray(summary[key]) ? (summary[key] as any[]).length > 0 : true);
      })
      .map(s => s.id);
    setSelectedSections(availableSections);
    setSelectedTemplate(null);
  };

  const handleClearAll = () => {
    setSelectedSections([]);
    setSelectedTemplate(null);
  };

  const getTemplateSections = (templateKey: string) => {
    const template = templates[templateKey as keyof typeof templates];
    if (!template) return [];
    return template.sections.filter(sectionId => {
      const key = sectionId as keyof typeof summary;
      return summary && summary[key] !== null && summary[key] !== undefined &&
             (Array.isArray(summary[key]) ? (summary[key] as any[]).length > 0 : true);
    });
  };

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
  };

  const handleExportPDF = async () => {
    if (selectedSections.length === 0) {
      setError('Please select at least one section to export');
      return;
    }

    setExporting(true);
    setError('');

    try {
      const response = await fetch('/api/user/final-summary/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: selectedSections,
          template: selectedTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `final-arrangements-${selectedTemplate || 'custom'}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A5B99A]"></div>
          <p className="text-[#2C2A29] opacity-60">Loading your summary...</p>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                Final Arrangements Summary
              </h1>
              <p className="text-sm sm:text-base opacity-90">
                Complete overview of your information and preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Export Options Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-xl">
              <Download className="w-6 h-6 text-[#A5B99A]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A29]">Export Options</h2>
              <p className="text-sm text-[#2C2A29] opacity-70">Choose what to include in your PDF</p>
            </div>
          </div>

          {/* Template Presets */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#2C2A29] uppercase tracking-wider">Quick Templates</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-[#A5B99A] hover:text-[#93B0C8] font-medium px-3 py-1 hover:bg-[#A5B99A]/10 rounded-lg transition-colors"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(templates).map(([key, template]) => {
                const TemplateIcon = template.icon;
                const isSelected = selectedTemplate === key;
                const templateSections = getTemplateSections(key);
                const allSectionsAvailable = templateSections.length === template.sections.length;
                
                return (
                  <div
                    key={key}
                    className={`relative rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#A5B99A] bg-[#A5B99A]/10 shadow-lg'
                        : 'border-gray-200 hover:border-[#A5B99A]/50 hover:shadow-md'
                    }`}
                  >
                    <button
                      onClick={() => handleTemplateSelect(key)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <TemplateIcon className={`w-5 h-5 ${isSelected ? 'text-[#A5B99A]' : 'text-gray-400'}`} />
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-[#A5B99A]" />}
                      </div>
                      <h4 className="font-semibold text-[#2C2A29] mb-1">{template.name}</h4>
                      <p className="text-xs text-[#2C2A29] opacity-70 mb-2">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#A5B99A] font-medium">
                          {templateSections.length} of {template.sections.length} available
                        </p>
                        {!allSectionsAvailable && (
                          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                            Partial
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSectionDetails(showSectionDetails === key ? null : key);
                      }}
                      className="w-full px-4 pb-3 text-left border-t border-gray-200 pt-2"
                    >
                      <span className="text-xs text-[#A5B99A] hover:text-[#93B0C8] font-medium flex items-center">
                        {showSectionDetails === key ? 'Hide' : 'Show'} included sections
                        <span className={`ml-1 transition-transform ${showSectionDetails === key ? 'rotate-180' : ''}`}>▼</span>
                      </span>
                    </button>
                    {showSectionDetails === key && (
                      <div className="px-4 pb-4 border-t border-gray-200 pt-3 space-y-1">
                        {template.sections.map((sectionId) => {
                          const section = sectionOptions.find(s => s.id === sectionId);
                          const hasData = summary && summary[sectionId as keyof typeof summary] !== null && 
                                         summary[sectionId as keyof typeof summary] !== undefined &&
                                         (Array.isArray(summary[sectionId as keyof typeof summary]) 
                                           ? (summary[sectionId as keyof typeof summary] as any[]).length > 0
                                           : true);
                          if (!section) return null;
                          return (
                            <div
                              key={sectionId}
                              className={`flex items-center space-x-2 text-xs ${
                                hasData ? 'text-[#2C2A29]' : 'text-gray-400 line-through'
                              }`}
                            >
                              {hasData ? (
                                <CheckCircle2 className="w-3 h-3 text-[#A5B99A]" />
                              ) : (
                                <Circle className="w-3 h-3 text-gray-300" />
                              )}
                              <span>{section.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Section Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#2C2A29] uppercase tracking-wider mb-1">Custom Selection</h3>
                <p className="text-xs text-[#2C2A29] opacity-60">
                  {selectedTemplate ? 'Template selected - customize below or start fresh' : 'Manually select sections for your custom report'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-[#A5B99A] hover:text-[#93B0C8] font-medium px-3 py-1.5 hover:bg-[#A5B99A]/10 rounded-lg transition-colors border border-[#A5B99A]/20"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {selectedTemplate && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Template "{templates[selectedTemplate as keyof typeof templates].name}" is selected
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    You can customize by checking/unchecking sections below. Unchecking all will clear the template selection.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTemplate(null);
                    setSelectedSections([]);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-100 rounded transition-colors"
                >
                  Clear Template
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sectionOptions.map((section) => {
                const Icon = section.icon;
                const hasData = summary && summary[section.id as keyof typeof summary] !== null && 
                               summary[section.id as keyof typeof summary] !== undefined &&
                               (Array.isArray(summary[section.id as keyof typeof summary]) 
                                 ? (summary[section.id as keyof typeof summary] as any[]).length > 0
                                 : true);
                const isSelected = selectedSections.includes(section.id);
                const isInSelectedTemplate = selectedTemplate 
                  ? templates[selectedTemplate as keyof typeof templates].sections.includes(section.id)
                  : false;
                
                if (!hasData) {
                  return (
                    <div
                      key={section.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border-2 border-gray-100 bg-gray-50 opacity-50"
                    >
                      <input
                        type="checkbox"
                        disabled
                        className="mt-1 w-4 h-4 text-gray-300 border-gray-200 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`p-1.5 ${section.color} bg-opacity-10 rounded`}>
                            <Icon className={`w-4 h-4 ${section.color.replace('bg-', 'text-')}`} />
                          </div>
                          <span className="font-medium text-sm text-gray-400">{section.label}</span>
                        </div>
                        <p className="text-xs text-gray-400">No data available</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <label
                    key={section.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all relative ${
                      isSelected
                        ? 'border-[#A5B99A] bg-[#A5B99A]/5 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    } ${isInSelectedTemplate && selectedTemplate ? 'ring-2 ring-blue-200' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSectionToggle(section.id)}
                      className="mt-1 w-4 h-4 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`p-1.5 ${section.color} bg-opacity-10 rounded`}>
                          <Icon className={`w-4 h-4 ${section.color.replace('bg-', 'text-')}`} />
                        </div>
                        <span className="font-medium text-sm text-[#2C2A29]">{section.label}</span>
                        {isInSelectedTemplate && selectedTemplate && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                            In Template
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#2C2A29] opacity-60">{section.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#A5B99A] absolute top-2 right-2" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Export Button */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-[#2C2A29]">
                  <span className="font-semibold">Selected: </span>
                  {selectedSections.length > 0 ? (
                    <span className="font-bold text-[#A5B99A] text-lg">{selectedSections.length}</span>
                  ) : (
                    <span className="font-bold text-red-600 text-lg">0</span>
                  )}{' '}
                  <span className="opacity-70">section{selectedSections.length !== 1 ? 's' : ''}</span>
                </div>
                {selectedTemplate && (
                  <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                    Using "{templates[selectedTemplate as keyof typeof templates].name}" template
                  </div>
                )}
                {!selectedTemplate && selectedSections.length > 0 && (
                  <div className="text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full font-medium">
                    Custom selection
                  </div>
                )}
              </div>
              <button
                onClick={handleExportPDF}
                disabled={exporting || selectedSections.length === 0}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-5 h-5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
            
            {selectedSections.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Please select at least one section or choose a template to generate your PDF.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Summary Preview */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#2C2A29] mb-4">Summary Preview</h2>
        </div>

        <div className="space-y-6">
          {/* Personal Details */}
          {summary?.personalDetails && (
            <SectionCard
              icon={User}
              title="Personal Details"
              color="bg-[#A5B99A]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <span className="font-medium">Full Name:</span> {summary.personalDetails.full_name}
                </div>
                {summary.personalDetails.preferred_name && (
                  <div>
                    <span className="font-medium">Preferred Name:</span> {summary.personalDetails.preferred_name}
                  </div>
                )}
                <div>
                  <span className="font-medium">Date of Birth:</span> {summary.personalDetails.date_of_birth}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {summary.personalDetails.phone}
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <span className="font-medium">Address:</span> {summary.personalDetails.address}, {summary.personalDetails.city}, {summary.personalDetails.state} {summary.personalDetails.zip_code}
                </div>
              </div>
            </SectionCard>
          )}

          {/* End-of-Life Directives */}
          {summary?.endOfLifeDirectives && (
            <SectionCard
              icon={Heart}
              title="End-of-Life Directives"
              color="bg-[#A5B99A]"
            >
              <div className="space-y-4 text-sm">
                {summary.endOfLifeDirectives.preferred_place_to_pass && (
                  <div>
                    <span className="font-medium">Preferred Place:</span> {summary.endOfLifeDirectives.preferred_place_to_pass}
                  </div>
                )}
                {(summary.endOfLifeDirectives.cpr_preference || summary.endOfLifeDirectives.ventilator_preference) && (
                  <div>
                    <span className="font-medium">Life-Sustaining Treatments:</span>
                    {summary.endOfLifeDirectives.cpr_preference && ` CPR: ${summary.endOfLifeDirectives.cpr_preference}`}
                    {summary.endOfLifeDirectives.ventilator_preference && ` Ventilator: ${summary.endOfLifeDirectives.ventilator_preference}`}
                  </div>
                )}
                {summary.endOfLifeDirectives.final_message_for_family && (
                  <div>
                    <span className="font-medium">Final Message:</span>
                    <p className="mt-1 text-[#2C2A29] opacity-80">{summary.endOfLifeDirectives.final_message_for_family.substring(0, 200)}...</p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Medical Contacts */}
          {summary?.medicalContacts && (
            <SectionCard
              icon={Heart}
              title="Medical & Legal Contacts"
              color="bg-[#93B0C8]"
            >
              <div className="space-y-2 text-sm">
                {summary.medicalContacts.physician_name && (
                  <div>
                    <span className="font-medium">Physician:</span> {summary.medicalContacts.physician_name}
                    {summary.medicalContacts.physician_phone && ` - ${summary.medicalContacts.physician_phone}`}
                  </div>
                )}
                {summary.medicalContacts.lawyer_name && (
                  <div>
                    <span className="font-medium">Lawyer:</span> {summary.medicalContacts.lawyer_name}
                    {summary.medicalContacts.lawyer_phone && ` - ${summary.medicalContacts.lawyer_phone}`}
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Funeral Preferences */}
          {summary?.funeralPreferences && (
            <SectionCard
              icon={FileText}
              title="Life Event Preferences"
              color="bg-[#A5B99A]"
            >
              <div className="space-y-2 text-sm">
                {summary.funeralPreferences.burial_or_cremation && (
                  <div>
                    <span className="font-medium">Preference:</span> {summary.funeralPreferences.burial_or_cremation}
                  </div>
                )}
                {summary.funeralPreferences.funeral_home && (
                  <div>
                    <span className="font-medium">Funeral Home:</span> {summary.funeralPreferences.funeral_home}
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Trusted Contacts */}
          {summary?.trustedContacts && summary.trustedContacts.length > 0 && (
            <SectionCard
              icon={Users}
              title="Trusted Contacts"
              color="bg-[#93B0C8]"
            >
              <div className="space-y-2 text-sm">
                {summary.trustedContacts.map((contact: any) => (
                  <div key={contact.id}>
                    <span className="font-medium">{contact.name}</span> ({contact.relationship}) - {contact.email}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Documents */}
          {summary?.documents && summary.documents.length > 0 && (
            <SectionCard
              icon={Upload}
              title="Documents"
              color="bg-[#93B0C8]"
            >
              <div className="space-y-2 text-sm">
                {summary.documents.map((doc: any) => (
                  <div key={doc.id}>
                    <span className="font-medium">{doc.document_type}:</span> {doc.file_name}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Assets */}
          {summary?.assets && summary.assets.length > 0 && (
            <SectionCard
              icon={DollarSign}
              title="Assets"
              color="bg-[#93B0C8]"
            >
              <div className="space-y-2 text-sm">
                {summary.assets.map((asset: any) => (
                  <div key={asset.id}>
                    <span className="font-medium">{asset.name}</span> ({asset.asset_type})
                    {asset.estimated_value && ` - ${asset.estimated_value}`}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Insurance & Financial */}
          {summary?.insuranceFinancial && summary.insuranceFinancial.length > 0 && (
            <SectionCard
              icon={Building2}
              title="Insurance & Financial Contacts"
              color="bg-[#93B0C8]"
            >
              <div className="space-y-2 text-sm">
                {summary.insuranceFinancial.map((contact: any) => (
                  <div key={contact.id}>
                    <span className="font-medium">{contact.company_name || contact.contact_type}</span>
                    {contact.policy_number && ` - Policy: ${contact.policy_number}`}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Household */}
          {summary?.household && (
            <SectionCard
              icon={HomeIcon}
              title="Household Information"
              color="bg-[#A5B99A]"
            >
              <div className="space-y-2 text-sm">
                {summary.household.pet_care_instructions && (
                  <div>
                    <span className="font-medium">Pet Care:</span> Available
                  </div>
                )}
                {summary.household.home_access_codes && (
                  <div>
                    <span className="font-medium">Access Codes:</span> Available
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </main>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: any;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 ${color} bg-opacity-10 rounded-lg flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        <h2 className="text-lg font-semibold text-[#2C2A29]">{title}</h2>
      </div>
      <div className="text-[#2C2A29]">
        {children}
      </div>
    </div>
  );
}
