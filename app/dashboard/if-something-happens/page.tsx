'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Heart,
  FileText,
  Shield,
  Phone,
  Mail,
  AlertCircle,
  Building2,
  FileCheck,
  Info,
  ChevronDown,
  Stethoscope,
  Home,
  Plane,
} from 'lucide-react';

type Situation = 'medical-emergency' | 'hospitalization' | 'incapacitated' | 'traveling' | 'death';

interface MedicalInfo {
  conditions?: string[];
  medications?: Array<{ name: string; dosage?: string; frequency?: string }>;
  allergies?: string[];
  bloodType?: string;
  organDonor?: boolean;
  dnrStatus?: boolean;
  advanceDirective?: string;
  otherNotes?: string;
  medicalContacts?: Array<{
    name: string;
    specialty?: string;
    phone: string;
    email?: string;
  }>;
}

interface PreparednessData {
  trustedContacts: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
  medicalInfo: {
    physicianName?: string;
    physicianPhone?: string;
    medicalNotes?: string;
    expanded?: MedicalInfo;
  } | null;
  insuranceInfo: Array<{
    contactType: string;
    companyName?: string;
    policyNumber?: string;
    accountNumber?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  }>;
  documents: Array<{
    id: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    note?: string;
  }>;
  criticalInstructions: Array<{
    type: string;
    content: string;
  }>;
}

const situations: Array<{ value: Situation; label: string; icon: any; subtle?: boolean }> = [
  { value: 'medical-emergency', label: 'Medical Emergency', icon: Stethoscope },
  { value: 'hospitalization', label: 'Hospitalization', icon: Heart },
  { value: 'incapacitated', label: 'Incapacitated', icon: AlertCircle },
  { value: 'traveling', label: 'Traveling', icon: Plane },
  { value: 'death', label: 'Death', icon: Home, subtle: true },
];

export default function IfSomethingHappensPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedSituation, setSelectedSituation] = useState<Situation>('medical-emergency');
  const [showSituationDropdown, setShowSituationDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PreparednessData>({
    trustedContacts: [],
    medicalInfo: null,
    insuranceInfo: [],
    documents: [],
    criticalInstructions: [],
  });

  useEffect(() => {
    loadPreparednessData();
  }, []);

  const loadPreparednessData = async () => {
    try {
      // Try to load from cache first (for offline support)
      const cachedData = localStorage.getItem('preparedness_snapshot');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          // Only use cache if it's less than 1 hour old
          if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
            setData(parsed.data);
            setLoading(false);
          }
        } catch (e) {
          // Invalid cache, continue to fetch
        }
      }

      const [contactsRes, medicalRes, insuranceRes, documentsRes, personalRes] = await Promise.allSettled([
        fetch('/api/user/trusted-contacts'),
        fetch('/api/user/medical-contacts'),
        fetch('/api/user/insurance-financial'),
        fetch('/api/user/documents'),
        fetch('/api/user/personal-details'),
      ]);

      const trustedContacts = contactsRes.status === 'fulfilled' && contactsRes.value.ok 
        ? (await contactsRes.value.json()).trustedContacts || [] 
        : [];
      const medicalInfoRaw = medicalRes.status === 'fulfilled' && medicalRes.value.ok 
        ? (await medicalRes.value.json()).medicalContacts 
        : null;
      
      // Parse expanded medical information from JSON
      let medicalInfo = medicalInfoRaw;
      let expandedMedicalInfo: MedicalInfo | undefined;
      if (medicalInfoRaw?.medicalNotes) {
        try {
          const parsed = JSON.parse(medicalInfoRaw.medicalNotes);
          if (parsed.conditions || parsed.medications || parsed.allergies) {
            expandedMedicalInfo = parsed;
            medicalInfo = { ...medicalInfoRaw, expanded: expandedMedicalInfo };
          }
        } catch (e) {
          // Not JSON, keep as plain text
        }
      }

      const insuranceData = insuranceRes.status === 'fulfilled' && insuranceRes.value.ok 
        ? (await insuranceRes.value.json()).contacts || [] 
        : [];
      const documentsData = documentsRes.status === 'fulfilled' && documentsRes.value.ok 
        ? (await documentsRes.value.json()).documents || [] 
        : [];
      const personalData = personalRes.status === 'fulfilled' && personalRes.value.ok 
        ? (await personalRes.value.json()).personalDetails 
        : null;

      // Build critical instructions from various sources
      const criticalInstructions: Array<{ type: string; content: string }> = [];
      
      if (personalData?.emergencyContactName) {
        criticalInstructions.push({
          type: 'Emergency Contact',
          content: `Primary emergency contact: ${personalData.emergencyContactName} (${personalData.emergencyContactPhone})`,
        });
      }

      // Add critical medical information
      if (expandedMedicalInfo) {
        if (expandedMedicalInfo.allergies && expandedMedicalInfo.allergies.length > 0) {
          criticalInstructions.push({
            type: 'Allergies',
            content: `Known allergies: ${expandedMedicalInfo.allergies.filter(a => a).join(', ')}`,
          });
        }
        if (expandedMedicalInfo.dnrStatus) {
          criticalInstructions.push({
            type: 'DNR Status',
            content: 'Do Not Resuscitate (DNR) order is in place',
          });
        }
        if (expandedMedicalInfo.bloodType) {
          criticalInstructions.push({
            type: 'Blood Type',
            content: `Blood type: ${expandedMedicalInfo.bloodType}`,
          });
        }
      } else if (medicalInfo?.medicalNotes && !expandedMedicalInfo) {
        criticalInstructions.push({
          type: 'Medical Notes',
          content: medicalInfo.medicalNotes,
        });
      }

      const newData = {
        trustedContacts: trustedContacts.map((tc: any) => ({
          id: tc.id,
          name: tc.name,
          email: tc.email,
          phone: tc.phone,
          relationship: tc.relationship,
        })),
        medicalInfo,
        insuranceInfo: insuranceData.map((ins: any) => ({
          contactType: ins.contactType,
          companyName: ins.companyName,
          policyNumber: ins.policyNumber,
          accountNumber: ins.accountNumber,
          contactName: ins.contactName,
          contactPhone: ins.contactPhone,
          contactEmail: ins.contactEmail,
        })),
        documents: documentsData.map((doc: any) => ({
          id: doc.id,
          documentType: doc.documentType,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          note: doc.note,
        })),
        criticalInstructions,
      };

      setData(newData);
      setError(null);

      // Cache the data for offline access
      try {
        localStorage.setItem('preparedness_snapshot', JSON.stringify({
          data: newData,
          timestamp: Date.now(),
        }));
      } catch (e) {
        // Ignore localStorage errors
      }
    } catch (error) {
      console.error('Error loading preparedness data:', error);
      setError('Unable to load some information. Showing last available data.');
      // Try to load from cache as fallback
      const cachedData = localStorage.getItem('preparedness_snapshot');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setData(parsed.data);
        } catch (e) {
          // Invalid cache
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getEmphasizedSections = () => {
    switch (selectedSituation) {
      case 'medical-emergency':
        return ['medical', 'contacts'];
      case 'hospitalization':
        return ['medical', 'contacts', 'insurance'];
      case 'incapacitated':
        return ['contacts', 'documents', 'instructions'];
      case 'traveling':
        return ['documents', 'insurance', 'contacts'];
      case 'death':
        return ['contacts', 'documents', 'instructions'];
      default:
        return [];
    }
  };

  const emphasizedSections = getEmphasizedSections();
  const selectedSituationData = situations.find(s => s.value === selectedSituation);
  const SituationIcon = selectedSituationData?.icon || Info;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A5B99A]"></div>
          <p className="text-[#2C2A29] opacity-60">Loading your information...</p>
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

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-10">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[#2C2A29] mb-2 sm:mb-3">
            If Something Happens
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#2C2A29] opacity-70 font-light">
            Essential information when you need it most
          </p>
        </div>

        {/* Situation Selector */}
        <div className="mb-4 sm:mb-6 lg:mb-8 relative">
          <label className="block text-xs sm:text-sm font-medium text-[#2C2A29] opacity-70 mb-1.5 sm:mb-2">
            Situation
          </label>
          <div className="relative">
            <button
              onClick={() => setShowSituationDropdown(!showSituationDropdown)}
              className="w-full bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200/50 hover:border-[#A5B99A] active:bg-[#FAF9F7] transition-all duration-200 flex items-center justify-between group touch-target"
              aria-label="Select situation"
              aria-expanded={showSituationDropdown}
              aria-haspopup="listbox"
            >
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="p-1.5 sm:p-2 bg-[#A5B99A]/10 rounded-lg flex-shrink-0">
                  <SituationIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#A5B99A]" />
                </div>
                <span className="text-sm sm:text-base text-[#2C2A29] font-medium truncate">
                  {selectedSituationData?.label || 'Select a situation'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 sm:w-5 sm:h-5 text-[#2C2A29] opacity-50 transition-transform duration-200 flex-shrink-0 ml-2 ${
                  showSituationDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showSituationDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSituationDropdown(false)}
                />
                <div 
                  className="absolute z-20 w-full mt-1.5 sm:mt-2 bg-white/95 backdrop-blur-lg rounded-xl border border-gray-200/50 shadow-xl overflow-hidden max-h-[60vh] overflow-y-auto"
                  role="listbox"
                >
                  {situations.map((situation) => {
                    const Icon = situation.icon;
                    return (
                      <button
                        key={situation.value}
                        onClick={() => {
                          setSelectedSituation(situation.value);
                          setShowSituationDropdown(false);
                        }}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center space-x-2 sm:space-x-3 hover:bg-[#A5B99A]/5 active:bg-[#A5B99A]/10 transition-colors touch-target ${
                          selectedSituation === situation.value ? 'bg-[#A5B99A]/10' : ''
                        } ${situation.subtle ? 'opacity-70' : ''}`}
                        role="option"
                        aria-selected={selectedSituation === situation.value}
                      >
                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${situation.subtle ? 'text-[#2C2A29] opacity-50' : 'text-[#A5B99A]'}`} />
                        <span className={`text-sm sm:text-base text-[#2C2A29] font-medium ${situation.subtle ? 'opacity-70' : ''}`}>
                          {situation.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Banner (if network issues) */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-[#EBD9B5]/20 border border-[#EBD9B5]/30 rounded-xl">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#EBD9B5] flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-80 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Preparedness Snapshot */}
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          {/* Emergency & Trusted Contacts */}
          {(emphasizedSections.includes('contacts') || data.trustedContacts.length > 0) && (
            <section
              className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border ${
                emphasizedSections.includes('contacts')
                  ? 'border-[#A5B99A] shadow-lg'
                  : 'border-gray-200/50'
              } transition-all duration-300`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="p-1.5 sm:p-2 bg-[#93B0C8]/10 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8]" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2C2A29] leading-tight">Emergency & Trusted Contacts</h2>
              </div>
              {data.trustedContacts.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {data.trustedContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-gray-200/30"
                    >
                      <div className="flex flex-col gap-2.5 sm:gap-3">
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-[#2C2A29] mb-1">{contact.name}</h3>
                          <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-2.5 sm:mb-2">
                            {contact.relationship}
                          </p>
                          <div className="flex flex-col gap-2.5 sm:gap-2">
                            {contact.phone && (
                              <a 
                                href={`tel:${contact.phone}`} 
                                className="flex items-center space-x-2 text-sm sm:text-base text-[#93B0C8] hover:text-[#A5B99A] active:text-[#A5B99A] transition-colors touch-target py-1.5 sm:py-1"
                              >
                                <Phone className="w-4 h-4 sm:w-5 sm:h-4 flex-shrink-0" />
                                <span className="break-all">{contact.phone}</span>
                              </a>
                            )}
                            {contact.email && (
                              <a 
                                href={`mailto:${contact.email}`} 
                                className="flex items-center space-x-2 text-sm sm:text-base text-[#93B0C8] hover:text-[#A5B99A] active:text-[#A5B99A] transition-colors touch-target py-1.5 sm:py-1"
                              >
                                <Mail className="w-4 h-4 sm:w-5 sm:h-4 flex-shrink-0" />
                                <span className="break-all">{contact.email}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <p className="text-xs sm:text-sm text-[#2C2A29] opacity-60 mb-2">No contacts available</p>
                  <Link
                    href="/dashboard/trusted-contacts"
                    className="text-xs sm:text-sm text-[#93B0C8] hover:text-[#A5B99A] active:text-[#A5B99A] transition-colors touch-target inline-block py-1"
                  >
                    Add contacts →
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Medical Summary */}
          {(emphasizedSections.includes('medical') || data.medicalInfo) && (
            <section
              className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border ${
                emphasizedSections.includes('medical')
                  ? 'border-[#A5B99A] shadow-lg'
                  : 'border-gray-200/50'
              } transition-all duration-300`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="p-1.5 sm:p-2 bg-[#A5B99A]/10 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A]" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2C2A29] leading-tight">Medical Summary</h2>
              </div>
              {data.medicalInfo ? (
                <div className="space-y-3 sm:space-y-4">
                  {/* Expanded Medical Info */}
                  {data.medicalInfo.expanded && (
                    <>
                      {/* Conditions */}
                      {data.medicalInfo.expanded.conditions && data.medicalInfo.expanded.conditions.length > 0 && (
                        <div className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-gray-200/30">
                          <h3 className="text-sm sm:text-base font-semibold text-[#2C2A29] mb-2">Medical Conditions</h3>
                          <div className="flex flex-wrap gap-2">
                            {data.medicalInfo.expanded.conditions.filter(c => c).map((condition, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-[#A5B99A]/10 text-[#A5B99A] rounded-lg text-xs sm:text-sm">
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Allergies */}
                      {data.medicalInfo.expanded.allergies && data.medicalInfo.expanded.allergies.length > 0 && (
                        <div className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-[#EBD9B5]/30">
                          <h3 className="text-sm sm:text-base font-semibold text-[#2C2A29] mb-2">Allergies</h3>
                          <div className="flex flex-wrap gap-2">
                            {data.medicalInfo.expanded.allergies.filter(a => a).map((allergy, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-[#EBD9B5]/30 text-[#2C2A29] rounded-lg text-xs sm:text-sm font-medium">
                                {allergy}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Medications */}
                      {data.medicalInfo.expanded.medications && data.medicalInfo.expanded.medications.length > 0 && (
                        <div className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-gray-200/30">
                          <h3 className="text-sm sm:text-base font-semibold text-[#2C2A29] mb-2">Medications</h3>
                          <div className="space-y-2">
                            {data.medicalInfo.expanded.medications.filter(m => m.name).map((med, idx) => (
                              <div key={idx} className="text-sm sm:text-base text-[#2C2A29] opacity-80">
                                <span className="font-medium">{med.name}</span>
                                {(med.dosage || med.frequency) && (
                                  <span className="text-xs sm:text-sm opacity-70 ml-2">
                                    {med.dosage && med.frequency 
                                      ? `${med.dosage}, ${med.frequency}`
                                      : med.dosage || med.frequency}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Blood Type & Organ Donor */}
                      {(data.medicalInfo.expanded.bloodType || data.medicalInfo.expanded.organDonor || data.medicalInfo.expanded.dnrStatus) && (
                        <div className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-gray-200/30">
                          <h3 className="text-sm sm:text-base font-semibold text-[#2C2A29] mb-2">Important Details</h3>
                          <div className="space-y-1.5 text-sm sm:text-base text-[#2C2A29] opacity-80">
                            {data.medicalInfo.expanded.bloodType && (
                              <p><span className="font-medium">Blood Type:</span> {data.medicalInfo.expanded.bloodType}</p>
                            )}
                            {data.medicalInfo.expanded.organDonor && (
                              <p><span className="font-medium">Organ Donor:</span> Yes</p>
                            )}
                            {data.medicalInfo.expanded.dnrStatus && (
                              <p><span className="font-medium">DNR Status:</span> Do Not Resuscitate order in place</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Medical Contacts */}
                      {data.medicalInfo.expanded.medicalContacts && data.medicalInfo.expanded.medicalContacts.length > 0 && (
                        <div className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-gray-200/30">
                          <h3 className="text-sm sm:text-base font-semibold text-[#2C2A29] mb-2">Medical Contacts</h3>
                          <div className="space-y-2">
                            {data.medicalInfo.expanded.medicalContacts.map((contact, idx) => (
                              <div key={idx} className="text-sm sm:text-base">
                                <p className="font-medium text-[#2C2A29]">{contact.name}</p>
                                {contact.specialty && (
                                  <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70">{contact.specialty}</p>
                                )}
                                {contact.phone && (
                                  <a 
                                    href={`tel:${contact.phone}`} 
                                    className="flex items-center space-x-1 text-[#A5B99A] hover:text-[#93B0C8] active:text-[#93B0C8] transition-colors touch-target mt-1"
                                  >
                                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="text-xs sm:text-sm">{contact.phone}</span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Advance Directive */}
                      {data.medicalInfo.expanded.advanceDirective && (
                        <div className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-gray-200/30">
                          <h3 className="text-sm sm:text-base font-semibold text-[#2C2A29] mb-2">Advance Directive</h3>
                          <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                            {data.medicalInfo.expanded.advanceDirective}
                          </p>
                        </div>
                      )}

                      {/* Other Notes */}
                      {data.medicalInfo.expanded.otherNotes && (
                        <div className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-gray-200/30">
                          <h3 className="text-sm sm:text-base font-semibold text-[#2C2A29] mb-2">Additional Notes</h3>
                          <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                            {data.medicalInfo.expanded.otherNotes}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Legacy format - Primary Physician */}
                  {!data.medicalInfo.expanded && data.medicalInfo.physicianName && (
                    <div className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-gray-200/30">
                      <h3 className="text-sm sm:text-base font-semibold text-[#2C2A29] mb-1">Primary Physician</h3>
                      <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 mb-2">{data.medicalInfo.physicianName}</p>
                      {data.medicalInfo.physicianPhone && (
                        <a 
                          href={`tel:${data.medicalInfo.physicianPhone}`} 
                          className="flex items-center space-x-2 text-sm sm:text-base text-[#A5B99A] hover:text-[#93B0C8] active:text-[#93B0C8] transition-colors touch-target py-1"
                        >
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{data.medicalInfo.physicianPhone}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Legacy format - Medical Notes */}
                  {!data.medicalInfo.expanded && data.medicalInfo.medicalNotes && (
                    <div className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-gray-200/30">
                      <h3 className="text-sm sm:text-base font-semibold text-[#2C2A29] mb-2">Medical Information</h3>
                      <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                        {data.medicalInfo.medicalNotes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <p className="text-xs sm:text-sm text-[#2C2A29] opacity-60 mb-2">No medical information available</p>
                  <Link
                    href="/dashboard/medical-contacts"
                    className="text-xs sm:text-sm text-[#93B0C8] hover:text-[#A5B99A] active:text-[#A5B99A] transition-colors touch-target inline-block py-1"
                  >
                    Add medical information →
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Insurance Overview */}
          {(emphasizedSections.includes('insurance') || data.insuranceInfo.length > 0) && (
            <section
              className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border ${
                emphasizedSections.includes('insurance')
                  ? 'border-[#A5B99A] shadow-lg'
                  : 'border-gray-200/50'
              } transition-all duration-300`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="p-1.5 sm:p-2 bg-[#93B0C8]/10 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8]" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2C2A29] leading-tight">Insurance Overview</h2>
              </div>
              {data.insuranceInfo.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {data.insuranceInfo.map((insurance, index) => {
                    const typeLabels: Record<string, string> = {
                      health_insurance: 'Health Insurance',
                      life_insurance: 'Life Insurance',
                      auto_insurance: 'Auto Insurance',
                      home_insurance: 'Home Insurance',
                      burial_insurance: 'Burial Insurance',
                      disability_insurance: 'Disability Insurance',
                      retirement_account: 'Retirement Account',
                      employer_benefits: 'Employer Benefits',
                      financial_advisor: 'Financial Advisor',
                      other: 'Other',
                    };
                    const typeLabel = typeLabels[insurance.contactType] || insurance.contactType || 'Insurance';
                    
                    return (
                      <div
                        key={index}
                        className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-gray-200/30"
                      >
                        <h3 className="text-sm sm:text-base font-semibold text-[#2C2A29] mb-2">
                          {typeLabel}
                        </h3>
                        {insurance.companyName && (
                          <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 mb-1.5 font-medium">{insurance.companyName}</p>
                        )}
                        <div className="space-y-1 text-xs sm:text-sm text-[#2C2A29] opacity-70">
                          {insurance.policyNumber && (
                            <p className="break-all">
                              <span className="font-medium">Policy #:</span> {insurance.policyNumber}
                            </p>
                          )}
                          {insurance.accountNumber && (
                            <p className="break-all">
                              <span className="font-medium">Account #:</span> {insurance.accountNumber}
                            </p>
                          )}
                          {insurance.contactName && (
                            <p>
                              <span className="font-medium">Contact:</span> {insurance.contactName}
                            </p>
                          )}
                          {insurance.contactPhone && (
                            <p>
                              <span className="font-medium">Phone:</span>{' '}
                              <a href={`tel:${insurance.contactPhone}`} className="text-[#93B0C8] hover:text-[#A5B99A]">
                                {insurance.contactPhone}
                              </a>
                            </p>
                          )}
                          {insurance.contactEmail && (
                            <p className="break-all">
                              <span className="font-medium">Email:</span>{' '}
                              <a href={`mailto:${insurance.contactEmail}`} className="text-[#93B0C8] hover:text-[#A5B99A] break-all">
                                {insurance.contactEmail}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <p className="text-xs sm:text-sm text-[#2C2A29] opacity-60 mb-2">No insurance information available</p>
                  <Link
                    href="/dashboard/insurance-financial"
                    className="text-xs sm:text-sm text-[#93B0C8] hover:text-[#A5B99A] active:text-[#A5B99A] transition-colors touch-target inline-block py-1"
                  >
                    Add insurance information →
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Important Documents */}
          {(emphasizedSections.includes('documents') || data.documents.length > 0) && (
            <section
              className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border ${
                emphasizedSections.includes('documents')
                  ? 'border-[#A5B99A] shadow-lg'
                  : 'border-gray-200/50'
              } transition-all duration-300`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="p-1.5 sm:p-2 bg-[#A5B99A]/10 rounded-lg sm:rounded-xl flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A]" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2C2A29] leading-tight">Important Documents</h2>
              </div>
              {data.documents.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {data.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-gray-200/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-[#2C2A29] mb-1 capitalize">
                            {doc.documentType}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-1.5 sm:mb-2 break-words">{doc.fileName}</p>
                          {doc.note && (
                            <p className="text-xs sm:text-sm text-[#2C2A29] opacity-60 italic break-words">{doc.note}</p>
                          )}
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 sm:ml-4 p-2 sm:p-2.5 text-[#93B0C8] hover:bg-[#93B0C8]/10 active:bg-[#93B0C8]/20 rounded-lg transition-colors touch-target flex-shrink-0"
                          aria-label={`Open ${doc.documentType} document`}
                        >
                          <FileCheck className="w-5 h-5 sm:w-6 sm:h-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <p className="text-xs sm:text-sm text-[#2C2A29] opacity-60 mb-2">No documents available</p>
                  <Link
                    href="/dashboard/documents"
                    className="text-xs sm:text-sm text-[#93B0C8] hover:text-[#A5B99A] active:text-[#A5B99A] transition-colors touch-target inline-block py-1"
                  >
                    Upload documents →
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Critical Instructions */}
          {(emphasizedSections.includes('instructions') || data.criticalInstructions.length > 0) && (
            <section
              className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border ${
                emphasizedSections.includes('instructions')
                  ? 'border-[#A5B99A] shadow-lg'
                  : 'border-gray-200/50'
              } transition-all duration-300`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="p-1.5 sm:p-2 bg-[#93B0C8]/10 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Info className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8]" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2C2A29] leading-tight">Critical Instructions</h2>
              </div>
              {data.criticalInstructions.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {data.criticalInstructions.map((instruction, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 bg-[#FAF9F7] rounded-lg sm:rounded-xl border border-gray-200/30"
                    >
                      <h3 className="text-sm sm:text-base font-semibold text-[#2C2A29] mb-2">{instruction.type}</h3>
                      <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed break-words">
                        {instruction.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <p className="text-xs sm:text-sm text-[#2C2A29] opacity-60 mb-2">No critical instructions available</p>
                  <p className="text-xs text-[#2C2A29] opacity-50 px-2">
                    Instructions will appear here when you add emergency contacts or medical notes
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-4 sm:mt-6 lg:mt-8 p-3 sm:p-4 bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-200/30">
          <p className="text-xs sm:text-sm text-[#2C2A29] opacity-60 text-center leading-relaxed px-1">
            This is a read-only view. To update information, visit the respective sections in your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

