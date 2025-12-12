'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, Stethoscope, Users, Scale, FileText, Heart, Pill, AlertTriangle, Droplet, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface MedicalInfo {
  conditions: string[];
  medications: Array<{ name: string; dosage?: string; frequency?: string }>;
  allergies: string[];
  bloodType?: string;
  organDonor?: boolean;
  dnrStatus?: boolean;
  advanceDirective?: string;
  otherNotes?: string;
}

interface MedicalContact {
  id?: string;
  name: string;
  specialty?: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface LegalContact {
  id?: string;
  name: string;
  type: 'lawyer' | 'estate_attorney' | 'financial_advisor' | 'other';
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface MedicalContactsData {
  medicalInfo: MedicalInfo;
  medicalContacts: MedicalContact[];
  legalContacts: LegalContact[];
  legalNotes?: string;
}

type Tab = 'medical' | 'contacts' | 'legal' | 'documents';

// Common medical conditions
const COMMON_CONDITIONS = [
  'Diabetes', 'Hypertension', 'High Blood Pressure', 'Heart Disease', 'Asthma', 
  'COPD', 'Arthritis', 'Osteoporosis', 'Depression', 'Anxiety', 'Epilepsy',
  'Migraines', 'Thyroid Disorder', 'Kidney Disease', 'Liver Disease', 'Cancer',
  'Stroke', 'Alzheimer\'s', 'Dementia', 'Parkinson\'s', 'Multiple Sclerosis',
  'Lupus', 'Fibromyalgia', 'Sleep Apnea', 'Other'
];

// Common allergies
const COMMON_ALLERGIES = [
  'Penicillin', 'Amoxicillin', 'Aspirin', 'Ibuprofen', 'Codeine', 'Morphine',
  'Latex', 'Peanuts', 'Tree Nuts', 'Shellfish', 'Eggs', 'Milk', 'Soy', 'Wheat',
  'Dust Mites', 'Pollen', 'Mold', 'Pet Dander', 'Bee Stings', 'Other'
];

// Medication frequency options
const MEDICATION_FREQUENCY = [
  'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
  'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'As needed',
  'Weekly', 'Monthly', 'Other'
];

// Medical specialties
const MEDICAL_SPECIALTIES = [
  'Primary Care', 'Family Medicine', 'Internal Medicine', 'Cardiology',
  'Dermatology', 'Endocrinology', 'Gastroenterology', 'Hematology',
  'Infectious Disease', 'Nephrology', 'Neurology', 'Oncology',
  'Ophthalmology', 'Orthopedics', 'Otolaryngology', 'Pediatrics',
  'Psychiatry', 'Pulmonology', 'Rheumatology', 'Urology', 'Other'
];

export default function MedicalContactsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('medical');
  const [expandedSections, setExpandedSections] = useState<Set<Tab>>(new Set(['medical'])); // Mobile accordion state
  const [formData, setFormData] = useState<MedicalContactsData>({
    medicalInfo: {
      conditions: [],
      medications: [],
      allergies: [],
      bloodType: '',
      organDonor: false,
      dnrStatus: false,
      advanceDirective: '',
      otherNotes: '',
    },
    medicalContacts: [],
    legalContacts: [],
    legalNotes: '',
  });

  useEffect(() => {
    loadMedicalContacts();
  }, []);

  const loadMedicalContacts = async () => {
    try {
      const response = await fetch('/api/user/medical-contacts');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load data');
      }

      const data = await response.json();
      if (data.medicalContacts) {
        // Parse existing data or use defaults
        const existing = data.medicalContacts;
        
        // Try to parse medical_notes as JSON for expanded data
        let parsedMedicalInfo: MedicalInfo = {
          conditions: [],
          medications: [],
          allergies: [],
          bloodType: '',
          organDonor: false,
          dnrStatus: false,
          advanceDirective: '',
          otherNotes: existing.medicalNotes || '',
        };

        try {
          if (existing.medicalNotes) {
            const parsed = JSON.parse(existing.medicalNotes);
            if (parsed.conditions || parsed.medications || parsed.allergies) {
              parsedMedicalInfo = { ...parsedMedicalInfo, ...parsed };
            }
          }
        } catch (e) {
          // If not JSON, treat as plain text in otherNotes
          parsedMedicalInfo.otherNotes = existing.medicalNotes || '';
        }

        // Convert old physician data to new contact format
        const medicalContacts: MedicalContact[] = [];
        if (existing.physicianName) {
          medicalContacts.push({
            name: existing.physicianName,
            phone: existing.physicianPhone || '',
            specialty: 'Primary Care',
          });
        }

        // Convert old lawyer data to new contact format
        const legalContacts: LegalContact[] = [];
        if (existing.lawyerName) {
          legalContacts.push({
            name: existing.lawyerName,
            phone: existing.lawyerPhone || '',
            type: 'lawyer',
          });
        }

        setFormData({
          medicalInfo: parsedMedicalInfo,
          medicalContacts,
          legalContacts,
          legalNotes: '',
        });
      }
    } catch (error) {
      setError('Failed to load medical contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // Convert to API format
      const apiData = {
        physicianName: formData.medicalContacts[0]?.name || '',
        physicianPhone: formData.medicalContacts[0]?.phone || '',
        lawyerName: formData.legalContacts[0]?.name || '',
        lawyerPhone: formData.legalContacts[0]?.phone || '',
        medicalNotes: JSON.stringify({
          ...formData.medicalInfo,
          medicalContacts: formData.medicalContacts,
          legalContacts: formData.legalContacts,
          legalNotes: formData.legalNotes,
        }),
      };

      const response = await fetch('/api/user/medical-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError('Failed to save medical contacts');
    } finally {
      setSaving(false);
    }
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        conditions: [...prev.medicalInfo.conditions, ''],
      },
    }));
  };

  const updateCondition = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        conditions: prev.medicalInfo.conditions.map((c, i) => i === index ? value : c),
      },
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        conditions: prev.medicalInfo.conditions.filter((_, i) => i !== index),
      },
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        medications: [...prev.medicalInfo.medications, { name: '', dosage: '', frequency: '' }],
      },
    }));
  };

  const updateMedication = (index: number, field: 'name' | 'dosage' | 'frequency', value: string) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        medications: prev.medicalInfo.medications.map((m, i) => 
          i === index ? { ...m, [field]: value } : m
        ),
      },
    }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        medications: prev.medicalInfo.medications.filter((_, i) => i !== index),
      },
    }));
  };

  const addAllergy = () => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        allergies: [...prev.medicalInfo.allergies, ''],
      },
    }));
  };

  const updateAllergy = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        allergies: prev.medicalInfo.allergies.map((a, i) => i === index ? value : a),
      },
    }));
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        allergies: prev.medicalInfo.allergies.filter((_, i) => i !== index),
      },
    }));
  };

  const addMedicalContact = () => {
    setFormData(prev => ({
      ...prev,
      medicalContacts: [...prev.medicalContacts, { name: '', phone: '', specialty: '' }],
    }));
  };

  const updateMedicalContact = (index: number, field: keyof MedicalContact, value: string) => {
    setFormData(prev => ({
      ...prev,
      medicalContacts: prev.medicalContacts.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  const removeMedicalContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalContacts: prev.medicalContacts.filter((_, i) => i !== index),
    }));
  };

  const addLegalContact = () => {
    setFormData(prev => ({
      ...prev,
      legalContacts: [...prev.legalContacts, { name: '', phone: '', type: 'lawyer' as const }],
    }));
  };

  const updateLegalContact = (index: number, field: keyof LegalContact, value: string) => {
    setFormData(prev => ({
      ...prev,
      legalContacts: prev.legalContacts.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  const removeLegalContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      legalContacts: prev.legalContacts.filter((_, i) => i !== index),
    }));
  };

  const tabs: Array<{ id: Tab; label: string; icon: any }> = [
    { id: 'medical', label: 'Medical Info', icon: Heart },
    { id: 'contacts', label: 'Medical Contacts', icon: Stethoscope },
    { id: 'legal', label: 'Legal Contacts', icon: Scale },
    { id: 'documents', label: 'Notes', icon: FileText },
  ];

  const toggleSection = (tabId: Tab) => {
    setExpandedSections(prev => {
      const newSet = new Set<Tab>();
      // If clicking the same section that's open, close it. Otherwise, open the new one (only one open at a time)
      if (!prev.has(tabId)) {
        newSet.add(tabId);
      }
      return newSet;
    });
    // Also update activeTab for desktop consistency
    setActiveTab(tabId);
  };

  // Render functions for mobile accordion
  const renderMedicalInfoContent = () => (
    <div className="space-y-4">
      {/* Conditions */}
      <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200/30">
        <div className="flex items-center space-x-2 mb-3">
          <ClipboardList className="w-5 h-5 text-[#A5B99A]" />
          <h3 className="text-base font-semibold text-[#2C2A29]">Medical Conditions</h3>
        </div>
        <div className="space-y-3">
          {formData.medicalInfo.conditions.map((condition, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 flex gap-2">
                <select
                  value={condition && !COMMON_CONDITIONS.includes(condition) ? 'Other' : condition}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      updateCondition(index, '');
                    } else {
                      updateCondition(index, e.target.value);
                    }
                  }}
                  className="flex-1 px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
                >
                  <option value="">Select condition</option>
                  {COMMON_CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
                {condition && !COMMON_CONDITIONS.includes(condition) && (
                  <input
                    type="text"
                    value={condition}
                    onChange={(e) => updateCondition(index, e.target.value)}
                    placeholder="Enter condition"
                    className="flex-1 px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
                  />
                )}
              </div>
              {(condition && COMMON_CONDITIONS.includes(condition) && condition !== 'Other') || (condition && !COMMON_CONDITIONS.includes(condition)) ? (
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  className="p-3 text-[#2C2A29] opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            onClick={addCondition}
            className="w-full px-4 py-3 bg-[#A5B99A]/10 text-[#A5B99A] rounded-lg hover:bg-[#A5B99A]/20 flex items-center justify-center space-x-2 min-h-[44px] font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Condition</span>
          </button>
        </div>
      </div>

      {/* Medications */}
      <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200/30">
        <div className="flex items-center space-x-2 mb-3">
          <Pill className="w-5 h-5 text-[#93B0C8]" />
          <h3 className="text-base font-semibold text-[#2C2A29]">Medications</h3>
        </div>
        <div className="space-y-3">
          {formData.medicalInfo.medications.map((medication, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#2C2A29] opacity-70">Medication {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  className="p-2 text-[#2C2A29] opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={medication.name}
                onChange={(e) => updateMedication(index, 'name', e.target.value)}
                placeholder="Medication name"
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
              />
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={medication.dosage}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  placeholder="Dosage (e.g., 10mg)"
                  className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
                />
                <select
                  value={medication.frequency}
                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
                >
                  <option value="">Select frequency</option>
                  {MEDICATION_FREQUENCY.map((freq) => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addMedication}
            className="w-full px-4 py-3 bg-[#93B0C8]/10 text-[#93B0C8] rounded-lg hover:bg-[#93B0C8]/20 flex items-center justify-center space-x-2 min-h-[44px] font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Medication</span>
          </button>
        </div>
      </div>

      {/* Allergies */}
      <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200/30">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-[#EBD9B5]" />
          <h3 className="text-base font-semibold text-[#2C2A29]">Allergies</h3>
        </div>
        <div className="space-y-3">
          {formData.medicalInfo.allergies.map((allergy, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 flex gap-2">
                <select
                  value={allergy && !COMMON_ALLERGIES.includes(allergy) ? 'Other' : allergy}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      updateAllergy(index, '');
                    } else {
                      updateAllergy(index, e.target.value);
                    }
                  }}
                  className="flex-1 px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
                >
                  <option value="">Select allergy</option>
                  {COMMON_ALLERGIES.map((all) => (
                    <option key={all} value={all}>{all}</option>
                  ))}
                </select>
                {allergy && !COMMON_ALLERGIES.includes(allergy) && (
                  <input
                    type="text"
                    value={allergy}
                    onChange={(e) => updateAllergy(index, e.target.value)}
                    placeholder="Enter allergy"
                    className="flex-1 px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
                  />
                )}
              </div>
              {(allergy && COMMON_ALLERGIES.includes(allergy) && allergy !== 'Other') || (allergy && !COMMON_ALLERGIES.includes(allergy)) ? (
                <button
                  type="button"
                  onClick={() => removeAllergy(index)}
                  className="p-3 text-[#2C2A29] opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            onClick={addAllergy}
            className="w-full px-4 py-3 bg-[#EBD9B5]/20 text-[#2C2A29] rounded-lg hover:bg-[#EBD9B5]/30 flex items-center justify-center space-x-2 min-h-[44px] font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Allergy</span>
          </button>
        </div>
      </div>

      {/* Blood Type & Organ Donor */}
      <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200/30">
        <div className="flex items-center space-x-2 mb-3">
          <Droplet className="w-5 h-5 text-[#A5B99A]" />
          <h3 className="text-base font-semibold text-[#2C2A29]">Blood Type & Organ Donor</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">Blood Type</label>
            <select
              value={formData.medicalInfo.bloodType}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                medicalInfo: { ...prev.medicalInfo, bloodType: e.target.value },
              }))}
              className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
            >
              <option value="">Select blood type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="organDonorMobile"
              checked={formData.medicalInfo.organDonor}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                medicalInfo: { ...prev.medicalInfo, organDonor: e.target.checked },
              }))}
              className="w-5 h-5 mt-0.5 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] flex-shrink-0"
            />
            <label htmlFor="organDonorMobile" className="text-sm text-[#2C2A29] leading-relaxed cursor-pointer">
              I am an organ donor
            </label>
          </div>
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="dnrStatusMobile"
              checked={formData.medicalInfo.dnrStatus}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                medicalInfo: { ...prev.medicalInfo, dnrStatus: e.target.checked },
              }))}
              className="w-5 h-5 mt-0.5 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] flex-shrink-0"
            />
            <label htmlFor="dnrStatusMobile" className="text-sm text-[#2C2A29] leading-relaxed cursor-pointer">
              Do Not Resuscitate (DNR) order in place
            </label>
          </div>
        </div>
      </div>

      {/* Advance Directive */}
      <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200/30">
        <h3 className="text-base font-semibold text-[#2C2A29] mb-3">Advance Directive / Living Will</h3>
        <textarea
          value={formData.medicalInfo.advanceDirective}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            medicalInfo: { ...prev.medicalInfo, advanceDirective: e.target.value },
          }))}
          placeholder="Details about your advance directive or living will..."
          rows={4}
          className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm resize-none min-h-[100px]"
        />
      </div>

      {/* Other Medical Notes */}
      <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200/30">
        <h3 className="text-base font-semibold text-[#2C2A29] mb-3">Additional Medical Notes</h3>
        <textarea
          value={formData.medicalInfo.otherNotes}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            medicalInfo: { ...prev.medicalInfo, otherNotes: e.target.value },
          }))}
          placeholder="Any other important medical information..."
          rows={4}
          className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm resize-none min-h-[100px]"
        />
      </div>
    </div>
  );

  const renderMedicalContactsContent = () => (
    <div className="space-y-4">
      <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-[#93B0C8]" />
            <h3 className="text-base font-semibold text-[#2C2A29]">Medical Contacts</h3>
          </div>
          <button
            type="button"
            onClick={addMedicalContact}
            className="px-4 py-2 bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] flex items-center space-x-2 min-h-[44px] font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add</span>
          </button>
        </div>
        <div className="space-y-3">
          {formData.medicalContacts.map((contact, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#2C2A29] opacity-70">Contact {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeMedicalContact(index)}
                  className="p-2 text-[#2C2A29] opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => updateMedicalContact(index, 'name', e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
              />
              <select
                value={contact.specialty || ''}
                onChange={(e) => updateMedicalContact(index, 'specialty', e.target.value)}
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
              >
                <option value="">Select specialty</option>
                {MEDICAL_SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => updateMedicalContact(index, 'phone', e.target.value)}
                placeholder="Phone"
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
              />
              <input
                type="email"
                value={contact.email}
                onChange={(e) => updateMedicalContact(index, 'email', e.target.value)}
                placeholder="Email (optional)"
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
              />
              <input
                type="text"
                value={contact.address}
                onChange={(e) => updateMedicalContact(index, 'address', e.target.value)}
                placeholder="Address (optional)"
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
              />
              <textarea
                value={contact.notes}
                onChange={(e) => updateMedicalContact(index, 'notes', e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm resize-none min-h-[80px]"
              />
            </div>
          ))}
          {formData.medicalContacts.length === 0 && (
            <div className="text-center py-6 text-[#2C2A29] opacity-60">
              <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No medical contacts added yet</p>
              <button
                type="button"
                onClick={addMedicalContact}
                className="mt-3 px-4 py-2 bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] min-h-[44px] font-medium"
              >
                Add First Contact
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLegalContactsContent = () => (
    <div className="space-y-4">
      <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#A5B99A]" />
            <h3 className="text-base font-semibold text-[#2C2A29]">Legal Contacts</h3>
          </div>
          <button
            type="button"
            onClick={addLegalContact}
            className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] flex items-center space-x-2 min-h-[44px] font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add</span>
          </button>
        </div>
        <div className="space-y-3">
          {formData.legalContacts.map((contact, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#2C2A29] opacity-70">Contact {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeLegalContact(index)}
                  className="p-2 text-[#2C2A29] opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <select
                value={contact.type}
                onChange={(e) => updateLegalContact(index, 'type', e.target.value)}
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
              >
                <option value="lawyer">Lawyer</option>
                <option value="estate_attorney">Estate Attorney</option>
                <option value="financial_advisor">Financial Advisor</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => updateLegalContact(index, 'name', e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
              />
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => updateLegalContact(index, 'phone', e.target.value)}
                placeholder="Phone"
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
              />
              <input
                type="email"
                value={contact.email}
                onChange={(e) => updateLegalContact(index, 'email', e.target.value)}
                placeholder="Email (optional)"
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
              />
              <input
                type="text"
                value={contact.address}
                onChange={(e) => updateLegalContact(index, 'address', e.target.value)}
                placeholder="Address (optional)"
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm min-h-[44px]"
              />
              <textarea
                value={contact.notes}
                onChange={(e) => updateLegalContact(index, 'notes', e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm resize-none min-h-[80px]"
              />
            </div>
          ))}
          {formData.legalContacts.length === 0 && (
            <div className="text-center py-6 text-[#2C2A29] opacity-60">
              <Scale className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No legal contacts added yet</p>
              <button
                type="button"
                onClick={addLegalContact}
                className="mt-3 px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] min-h-[44px] font-medium"
              >
                Add First Contact
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDocumentsContent = () => (
    <div className="space-y-4">
      <div className="bg-[#FAF9F7] rounded-lg p-4 border border-gray-200/30">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="w-5 h-5 text-[#93B0C8]" />
          <h3 className="text-base font-semibold text-[#2C2A29]">Legal Notes</h3>
        </div>
        <p className="text-xs text-[#2C2A29] opacity-70 mb-3">
          Additional legal information, document locations, or important notes
        </p>
        <textarea
          value={formData.legalNotes}
          onChange={(e) => setFormData(prev => ({ ...prev, legalNotes: e.target.value }))}
          placeholder="Legal notes, document locations, or other important information..."
          rows={8}
          className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] text-sm resize-none min-h-[200px]"
        />
        <p className="mt-3 text-xs text-[#2C2A29] opacity-60 break-words">
          Note: To upload legal documents, visit the{' '}
          <Link href="/dashboard/documents" className="text-[#93B0C8] hover:text-[#A5B99A] underline">
            Important Documents
          </Link>{' '}
          section.
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A5B99A]"></div>
          <p className="text-[#2C2A29] opacity-60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7] pb-20 sm:pb-8 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-[#FAF9F7] rounded-lg transition-colors flex-shrink-0 touch-target min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#2C2A29] leading-tight break-words">
                Medical & Legal Information
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-0.5 hidden sm:block">
                Comprehensive medical and legal details
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs - Desktop Only */}
      <div className="hidden sm:block bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-[73px] z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 min-w-max pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-3.5 
                    rounded-t-lg transition-all duration-200 touch-target whitespace-nowrap min-h-[44px]
                    ${isActive 
                      ? 'bg-white border-t-2 border-l border-r border-[#A5B99A] text-[#A5B99A] font-medium shadow-sm' 
                      : 'text-[#2C2A29] opacity-70 hover:opacity-100 hover:bg-white/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pb-20 sm:pb-0">
          {/* Mobile Accordion View */}
          <div className="sm:hidden space-y-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isExpanded = expandedSections.has(tab.id);
              return (
                <div key={tab.id} className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection(tab.id)}
                    className="w-full flex items-center justify-between p-4 touch-target min-h-[44px]"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-lg">
                        <Icon className={`w-5 h-5 ${isExpanded ? 'text-[#A5B99A]' : 'text-[#2C2A29] opacity-70'}`} />
                      </div>
                      <span className={`text-base font-semibold ${isExpanded ? 'text-[#A5B99A]' : 'text-[#2C2A29]'}`}>
                        {tab.label}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#A5B99A]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#2C2A29] opacity-50" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200/50 pt-4">
                      {tab.id === 'medical' && renderMedicalInfoContent()}
                      {tab.id === 'contacts' && renderMedicalContactsContent()}
                      {tab.id === 'legal' && renderLegalContactsContent()}
                      {tab.id === 'documents' && renderDocumentsContent()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Tab View */}
          <div className="hidden sm:block">
          {/* Medical Information Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Conditions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                  <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A] flex-shrink-0" />
                  <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Medical Conditions</h2>
                </div>
                <div className="space-y-3">
                  {formData.medicalInfo.conditions.map((condition, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 flex flex-col sm:flex-row gap-2">
                        <select
                          value={condition && !COMMON_CONDITIONS.includes(condition) ? 'Other' : condition}
                          onChange={(e) => {
                            if (e.target.value === 'Other') {
                              updateCondition(index, '');
                            } else {
                              updateCondition(index, e.target.value);
                            }
                          }}
                          className="flex-1 px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                        >
                          <option value="">Select condition</option>
                          {COMMON_CONDITIONS.map((cond) => (
                            <option key={cond} value={cond}>{cond}</option>
                          ))}
                        </select>
                        {condition && !COMMON_CONDITIONS.includes(condition) && (
                          <input
                            type="text"
                            value={condition}
                            onChange={(e) => updateCondition(index, e.target.value)}
                            placeholder="Enter condition"
                            className="flex-1 px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                          />
                        )}
                      </div>
                      {(condition && COMMON_CONDITIONS.includes(condition) && condition !== 'Other') || (condition && !COMMON_CONDITIONS.includes(condition)) ? (
                        <button
                          type="button"
                          onClick={() => removeCondition(index)}
                          className="p-3 text-[#2C2A29] opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-lg transition-colors touch-target min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                          aria-label="Remove condition"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCondition}
                    className="w-full sm:w-auto px-4 py-3 bg-[#A5B99A]/10 text-[#A5B99A] rounded-lg hover:bg-[#A5B99A]/20 transition-colors flex items-center justify-center space-x-2 touch-target min-h-[44px] font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Add Condition</span>
                  </button>
                </div>
              </div>

              {/* Medications */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                  <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8] flex-shrink-0" />
                  <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Medications</h2>
                </div>
                <div className="space-y-4">
                  {formData.medicalInfo.medications.map((medication, index) => (
                    <div key={index} className="p-4 bg-[#FAF9F7] rounded-lg border border-gray-200/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-[#2C2A29] opacity-70">Medication {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="p-2 text-[#2C2A29] opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-lg transition-colors touch-target min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Remove medication"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        placeholder="Medication name"
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          placeholder="Dosage (e.g., 10mg)"
                          className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                        />
                        <select
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                        >
                          <option value="">Select frequency</option>
                          {MEDICATION_FREQUENCY.map((freq) => (
                            <option key={freq} value={freq}>{freq}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMedication}
                    className="w-full sm:w-auto px-4 py-3 bg-[#93B0C8]/10 text-[#93B0C8] rounded-lg hover:bg-[#93B0C8]/20 transition-colors flex items-center justify-center space-x-2 touch-target min-h-[44px] font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Add Medication</span>
                  </button>
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-[#EBD9B5] flex-shrink-0" />
                  <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Allergies</h2>
                </div>
                <div className="space-y-3">
                  {formData.medicalInfo.allergies.map((allergy, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 flex flex-col sm:flex-row gap-2">
                        <select
                          value={allergy && !COMMON_ALLERGIES.includes(allergy) ? 'Other' : allergy}
                          onChange={(e) => {
                            if (e.target.value === 'Other') {
                              updateAllergy(index, '');
                            } else {
                              updateAllergy(index, e.target.value);
                            }
                          }}
                          className="flex-1 px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                        >
                          <option value="">Select allergy</option>
                          {COMMON_ALLERGIES.map((all) => (
                            <option key={all} value={all}>{all}</option>
                          ))}
                        </select>
                        {allergy && !COMMON_ALLERGIES.includes(allergy) && (
                          <input
                            type="text"
                            value={allergy}
                            onChange={(e) => updateAllergy(index, e.target.value)}
                            placeholder="Enter allergy"
                            className="flex-1 px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                          />
                        )}
                      </div>
                      {(allergy && COMMON_ALLERGIES.includes(allergy) && allergy !== 'Other') || (allergy && !COMMON_ALLERGIES.includes(allergy)) ? (
                        <button
                          type="button"
                          onClick={() => removeAllergy(index)}
                          className="p-3 text-[#2C2A29] opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-lg transition-colors touch-target min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                          aria-label="Remove allergy"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="w-full sm:w-auto px-4 py-3 bg-[#EBD9B5]/20 text-[#2C2A29] rounded-lg hover:bg-[#EBD9B5]/30 transition-colors flex items-center justify-center space-x-2 touch-target min-h-[44px] font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Add Allergy</span>
                  </button>
                </div>
              </div>

              {/* Blood Type & Organ Donor */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                  <Droplet className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A] flex-shrink-0" />
                  <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Blood Type & Organ Donor</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2C2A29] mb-2">Blood Type</label>
                    <select
                      value={formData.medicalInfo.bloodType}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, bloodType: e.target.value },
                      }))}
                      className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="organDonor"
                      checked={formData.medicalInfo.organDonor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, organDonor: e.target.checked },
                      }))}
                      className="w-5 h-5 mt-0.5 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] touch-target flex-shrink-0"
                    />
                    <label htmlFor="organDonor" className="text-sm sm:text-base text-[#2C2A29] leading-relaxed cursor-pointer">
                      I am an organ donor
                    </label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="dnrStatus"
                      checked={formData.medicalInfo.dnrStatus}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, dnrStatus: e.target.checked },
                      }))}
                      className="w-5 h-5 mt-0.5 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] touch-target flex-shrink-0"
                    />
                    <label htmlFor="dnrStatus" className="text-sm sm:text-base text-[#2C2A29] leading-relaxed cursor-pointer">
                      Do Not Resuscitate (DNR) order in place
                    </label>
                  </div>
                </div>
              </div>

              {/* Advance Directive */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
                <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29] mb-4">Advance Directive / Living Will</h2>
                <textarea
                  value={formData.medicalInfo.advanceDirective}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    medicalInfo: { ...prev.medicalInfo, advanceDirective: e.target.value },
                  }))}
                  placeholder="Details about your advance directive or living will..."
                  rows={4}
                  className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base resize-none min-h-[100px]"
                />
              </div>

              {/* Other Medical Notes */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
                <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29] mb-4">Additional Medical Notes</h2>
                <textarea
                  value={formData.medicalInfo.otherNotes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    medicalInfo: { ...prev.medicalInfo, otherNotes: e.target.value },
                  }))}
                  placeholder="Any other important medical information..."
                  rows={4}
                  className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base resize-none min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* Medical Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8] flex-shrink-0" />
                    <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Medical Contacts</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addMedicalContact}
                    className="w-full sm:w-auto px-4 py-3 bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors flex items-center justify-center space-x-2 touch-target min-h-[44px] font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Add Contact</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.medicalContacts.map((contact, index) => (
                    <div key={index} className="p-4 bg-[#FAF9F7] rounded-lg border border-gray-200/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-[#2C2A29] opacity-70">Contact {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeMedicalContact(index)}
                          className="p-2 text-[#2C2A29] opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-lg transition-colors touch-target min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Remove contact"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateMedicalContact(index, 'name', e.target.value)}
                        placeholder="Name"
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                      />
                      <select
                        value={contact.specialty || ''}
                        onChange={(e) => updateMedicalContact(index, 'specialty', e.target.value)}
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                      >
                        <option value="">Select specialty</option>
                        {MEDICAL_SPECIALTIES.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => updateMedicalContact(index, 'phone', e.target.value)}
                        placeholder="Phone"
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                      />
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateMedicalContact(index, 'email', e.target.value)}
                        placeholder="Email (optional)"
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                      />
                      <input
                        type="text"
                        value={contact.address}
                        onChange={(e) => updateMedicalContact(index, 'address', e.target.value)}
                        placeholder="Address (optional)"
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                      />
                      <textarea
                        value={contact.notes}
                        onChange={(e) => updateMedicalContact(index, 'notes', e.target.value)}
                        placeholder="Notes (optional)"
                        rows={2}
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base resize-none min-h-[80px]"
                      />
                    </div>
                  ))}
                  {formData.medicalContacts.length === 0 && (
                    <div className="text-center py-8 text-[#2C2A29] opacity-60">
                      <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm sm:text-base">No medical contacts added yet</p>
                      <button
                        type="button"
                        onClick={addMedicalContact}
                        className="mt-4 px-4 py-3 bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors touch-target min-h-[44px] font-medium"
                      >
                        Add First Contact
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Legal Contacts Tab */}
          {activeTab === 'legal' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A] flex-shrink-0" />
                    <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Legal Contacts</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addLegalContact}
                    className="w-full sm:w-auto px-4 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center justify-center space-x-2 touch-target min-h-[44px] font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Add Contact</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.legalContacts.map((contact, index) => (
                    <div key={index} className="p-4 bg-[#FAF9F7] rounded-lg border border-gray-200/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-[#2C2A29] opacity-70">Contact {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeLegalContact(index)}
                          className="p-2 text-[#2C2A29] opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-lg transition-colors touch-target min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Remove contact"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <select
                        value={contact.type}
                        onChange={(e) => updateLegalContact(index, 'type', e.target.value)}
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                      >
                        <option value="lawyer">Lawyer</option>
                        <option value="estate_attorney">Estate Attorney</option>
                        <option value="financial_advisor">Financial Advisor</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateLegalContact(index, 'name', e.target.value)}
                        placeholder="Name"
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                      />
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => updateLegalContact(index, 'phone', e.target.value)}
                        placeholder="Phone"
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                      />
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateLegalContact(index, 'email', e.target.value)}
                        placeholder="Email (optional)"
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                      />
                      <input
                        type="text"
                        value={contact.address}
                        onChange={(e) => updateLegalContact(index, 'address', e.target.value)}
                        placeholder="Address (optional)"
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base min-h-[44px] touch-target"
                      />
                      <textarea
                        value={contact.notes}
                        onChange={(e) => updateLegalContact(index, 'notes', e.target.value)}
                        placeholder="Notes (optional)"
                        rows={2}
                        className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base resize-none min-h-[80px]"
                      />
                    </div>
                  ))}
                  {formData.legalContacts.length === 0 && (
                    <div className="text-center py-8 text-[#2C2A29] opacity-60">
                      <Scale className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm sm:text-base">No legal contacts added yet</p>
                      <button
                        type="button"
                        onClick={addLegalContact}
                        className="mt-4 px-4 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target min-h-[44px] font-medium"
                      >
                        Add First Contact
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Documents/Notes Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8] flex-shrink-0" />
                  <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Legal Notes</h2>
                </div>
                <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-4">
                  Additional legal information, document locations, or important notes
                </p>
                <textarea
                  value={formData.legalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, legalNotes: e.target.value }))}
                  placeholder="Legal notes, document locations, or other important information..."
                  rows={8}
                  className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base resize-none min-h-[200px]"
                />
                <p className="mt-3 text-xs sm:text-sm text-[#2C2A29] opacity-60 break-words">
                  Note: To upload legal documents, visit the{' '}
                  <Link href="/dashboard/documents" className="text-[#93B0C8] hover:text-[#A5B99A] underline">
                    Important Documents
                  </Link>{' '}
                  section.
                </p>
              </div>
            </div>
          )}
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-[#EBD9B5]/30 border border-[#EBD9B5] text-[#2C2A29] px-4 py-3 rounded-lg text-sm sm:text-base">
              Medical and legal information saved successfully
            </div>
          )}

          {/* Submit Button - Sticky on Mobile */}
          <div className="fixed sm:sticky bottom-0 left-0 right-0 sm:left-auto sm:right-auto bg-white/95 backdrop-blur-sm border-t border-gray-200/50 shadow-lg sm:shadow-none -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 z-10">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors text-center text-sm sm:text-base font-medium touch-target min-h-[44px] flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base font-medium touch-target min-h-[44px]"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
