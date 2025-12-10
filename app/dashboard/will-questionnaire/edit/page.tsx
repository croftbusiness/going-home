'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';
import Link from 'next/link';
import { getWillQuestionnaire, updateWillQuestionnaire } from '@/lib/api/willQuestionnaire';

const TOTAL_STEPS = 8;

export default function WillQuestionnaireEditPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullLegalName: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      maritalStatus: '',
      children: [],
    },
    executor: {
      primaryName: '',
      primaryRelationship: '',
      primaryAddress: '',
      primaryPhone: '',
      primaryEmail: '',
      backupName: '',
      backupRelationship: '',
      backupAddress: '',
      backupPhone: '',
      backupEmail: '',
    },
    guardians: {
      primaryGuardianName: '',
      primaryGuardianRelationship: '',
      primaryGuardianAddress: '',
      primaryGuardianPhone: '',
      backupGuardianName: '',
      backupGuardianRelationship: '',
      backupGuardianAddress: '',
      backupGuardianPhone: '',
    },
    bequests: {
      specificGifts: [] as Array<{ item: string; recipient: string }>,
      residualEstate: '',
      charitableGiving: '',
    },
    digitalAssets: {
      socialMediaAccounts: '',
      emailAccounts: '',
      instructions: '',
    },
    notes: '',
  });

  useEffect(() => {
    loadQuestionnaire();
  }, []);

  const loadQuestionnaire = async () => {
    try {
      const data = await getWillQuestionnaire();
      if (data) {
        setQuestionnaire(data);
        setFormData({
          personalInfo: data.personalInfo || formData.personalInfo,
          executor: data.executor || formData.executor,
          guardians: data.guardians || formData.guardians,
          bequests: data.bequests || formData.bequests,
          digitalAssets: data.digitalAssets || formData.digitalAssets,
          notes: data.notes || '',
        });
      }
    } catch (err) {
      console.error('Error loading questionnaire:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        id: questionnaire?.id,
        personalInfo: formData.personalInfo,
        executor: formData.executor,
        guardians: formData.guardians,
        bequests: formData.bequests,
        digitalAssets: formData.digitalAssets,
        notes: formData.notes,
      };

      const saved = await updateWillQuestionnaire(questionnaire?.id || '', dataToSave);
      setQuestionnaire(saved);
      
      // Show success message briefly
      setTimeout(() => {
        router.push('/dashboard/will-questionnaire');
      }, 1000);
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: string, field: string, value: any) => {
    setFormData((prev) => {
      // Handle notes separately since it's a string, not an object
      if (section === 'notes') {
        return { ...prev, notes: value };
      }
      
      // Handle each object section explicitly (fixed TypeScript spread type error)
      if (section === 'personalInfo') {
        return {
          ...prev,
          personalInfo: { ...prev.personalInfo, [field]: value },
        };
      }
      if (section === 'executor') {
        return {
          ...prev,
          executor: { ...prev.executor, [field]: value },
        };
      }
      if (section === 'guardians') {
        return {
          ...prev,
          guardians: { ...prev.guardians, [field]: value },
        };
      }
      if (section === 'bequests') {
        return {
          ...prev,
          bequests: { ...prev.bequests, [field]: value },
        };
      }
      if (section === 'digitalAssets') {
        return {
          ...prev,
          digitalAssets: { ...prev.digitalAssets, [field]: value },
        };
      }
      
      return prev;
    });
  };

  const addSpecificGift = () => {
    setFormData((prev) => ({
      ...prev,
      bequests: {
        ...prev.bequests,
        specificGifts: [...prev.bequests.specificGifts, { item: '', recipient: '' }],
      },
    }));
  };

  const removeSpecificGift = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      bequests: {
        ...prev.bequests,
        specificGifts: prev.bequests.specificGifts.filter((_, i) => i !== index),
      },
    }));
  };

  const updateSpecificGift = (index: number, field: 'item' | 'recipient', value: string) => {
    setFormData((prev) => ({
      ...prev,
      bequests: {
        ...prev.bequests,
        specificGifts: prev.bequests.specificGifts.map((gift, i) =>
          i === index ? { ...gift, [field]: value } : gift
        ),
      },
    }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/will-questionnaire"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Will Questionnaire</h1>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-md">
          <p className="text-sm text-amber-800">
            <strong>Legal Disclaimer:</strong> Going Home does not provide legal advice or create legally binding documents. 
            This questionnaire is for informational and planning purposes only.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.fullLegalName}
                    onChange={(e) => handleChange('personalInfo', 'fullLegalName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => handleChange('personalInfo', 'dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.address}
                    onChange={(e) => handleChange('personalInfo', 'address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.city}
                    onChange={(e) => handleChange('personalInfo', 'city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.state}
                    onChange={(e) => handleChange('personalInfo', 'state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.zipCode}
                    onChange={(e) => handleChange('personalInfo', 'zipCode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marital Status
                  </label>
                  <select
                    value={formData.personalInfo.maritalStatus}
                    onChange={(e) => handleChange('personalInfo', 'maritalStatus', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="domestic_partnership">Domestic Partnership</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Executor */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Executor</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Executor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={formData.executor.primaryName}
                        onChange={(e) => handleChange('executor', 'primaryName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                      <input
                        type="text"
                        value={formData.executor.primaryRelationship}
                        onChange={(e) => handleChange('executor', 'primaryRelationship', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={formData.executor.primaryAddress}
                        onChange={(e) => handleChange('executor', 'primaryAddress', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.executor.primaryPhone}
                        onChange={(e) => handleChange('executor', 'primaryPhone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.executor.primaryEmail}
                        onChange={(e) => handleChange('executor', 'primaryEmail', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Backup Executor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={formData.executor.backupName}
                        onChange={(e) => handleChange('executor', 'backupName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                      <input
                        type="text"
                        value={formData.executor.backupRelationship}
                        onChange={(e) => handleChange('executor', 'backupRelationship', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={formData.executor.backupAddress}
                        onChange={(e) => handleChange('executor', 'backupAddress', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.executor.backupPhone}
                        onChange={(e) => handleChange('executor', 'backupPhone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.executor.backupEmail}
                        onChange={(e) => handleChange('executor', 'backupEmail', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Guardianship */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Guardianship</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Guardian</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={formData.guardians.primaryGuardianName}
                        onChange={(e) => handleChange('guardians', 'primaryGuardianName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                      <input
                        type="text"
                        value={formData.guardians.primaryGuardianRelationship}
                        onChange={(e) => handleChange('guardians', 'primaryGuardianRelationship', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={formData.guardians.primaryGuardianAddress}
                        onChange={(e) => handleChange('guardians', 'primaryGuardianAddress', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.guardians.primaryGuardianPhone}
                        onChange={(e) => handleChange('guardians', 'primaryGuardianPhone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Backup Guardian</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={formData.guardians.backupGuardianName}
                        onChange={(e) => handleChange('guardians', 'backupGuardianName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                      <input
                        type="text"
                        value={formData.guardians.backupGuardianRelationship}
                        onChange={(e) => handleChange('guardians', 'backupGuardianRelationship', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={formData.guardians.backupGuardianAddress}
                        onChange={(e) => handleChange('guardians', 'backupGuardianAddress', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.guardians.backupGuardianPhone}
                        onChange={(e) => handleChange('guardians', 'backupGuardianPhone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Bequests */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Bequests</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Specific Gifts</h3>
                    <button
                      type="button"
                      onClick={addSpecificGift}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      + Add Gift
                    </button>
                  </div>
                  {formData.bequests.specificGifts.map((gift, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        placeholder="Item/Property"
                        value={gift.item}
                        onChange={(e) => updateSpecificGift(index, 'item', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Recipient"
                        value={gift.recipient}
                        onChange={(e) => updateSpecificGift(index, 'recipient', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecificGift(index)}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Residual Estate Distribution
                  </label>
                  <textarea
                    value={formData.bequests.residualEstate}
                    onChange={(e) => handleChange('bequests', 'residualEstate', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe how your remaining estate should be distributed..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Charitable Giving
                  </label>
                  <textarea
                    value={formData.bequests.charitableGiving}
                    onChange={(e) => handleChange('bequests', 'charitableGiving', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="List any charitable organizations or causes you'd like to support..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Digital Assets */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Digital Assets</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Media Accounts
                  </label>
                  <textarea
                    value={formData.digitalAssets.socialMediaAccounts}
                    onChange={(e) => handleChange('digitalAssets', 'socialMediaAccounts', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="List your social media accounts and usernames..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Accounts
                  </label>
                  <textarea
                    value={formData.digitalAssets.emailAccounts}
                    onChange={(e) => handleChange('digitalAssets', 'emailAccounts', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="List your email accounts..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={formData.digitalAssets.instructions}
                    onChange={(e) => handleChange('digitalAssets', 'instructions', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Any specific instructions for managing your digital assets..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Additional Notes */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Additional Notes</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Any additional information or special instructions
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter any additional notes or instructions for your attorney..."
                />
              </div>
            </div>
          )}

          {/* Step 7: Review */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review Your Answers</h2>
              <div className="space-y-6">
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-sm text-gray-600">{formData.personalInfo.fullLegalName || 'Not provided'}</p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Executor</h3>
                  <p className="text-sm text-gray-600">{formData.executor.primaryName || 'Not provided'}</p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Guardianship</h3>
                  <p className="text-sm text-gray-600">{formData.guardians.primaryGuardianName || 'Not provided'}</p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Bequests</h3>
                  <p className="text-sm text-gray-600">
                    {formData.bequests.specificGifts.length} specific gift(s) listed
                  </p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Digital Assets</h3>
                  <p className="text-sm text-gray-600">{formData.digitalAssets.instructions ? 'Instructions provided' : 'Not provided'}</p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
                  <p className="text-sm text-gray-600">{formData.notes || 'None'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Export */}
          {currentStep === 8 && (
            <div className="space-y-6 text-center">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questionnaire Complete!</h2>
              <p className="text-gray-600 mb-8">
                Your answers have been saved. You can now download the PDF to share with your attorney.
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Saving...' : 'Save & Finish'}
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
            {currentStep < TOTAL_STEPS && (
              <button
                onClick={nextStep}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
            {currentStep === TOTAL_STEPS && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

