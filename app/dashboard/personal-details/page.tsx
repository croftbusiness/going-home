'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface PersonalDetails {
  fullName: string;
  preferredName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<PersonalDetails>({
    fullName: '',
    preferredName: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  });

  useEffect(() => {
    loadPersonalDetails();
  }, []);

  const loadPersonalDetails = async () => {
    try {
      const response = await fetch('/api/user/personal-details');
      if (!response.ok) throw new Error('Failed to load data');
      
      const data = await response.json();
      if (data.personalDetails) {
        setFormData(data.personalDetails);
      }
    } catch (error) {
      console.error('Error loading personal details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const response = await fetch('/api/user/personal-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save personal details');
      }

      setSuccess(true);
      // Redirect to dashboard after showing success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-[#2C2A29] hover:text-[#93B0C8] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-semibold text-[#2C2A29]">
                Personal Details
              </h1>
              <p className="mt-1 text-[#2C2A29] opacity-70">
                Your identifying information
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Success Message */}
          {success && (
            <div className="bg-[#EBD9B5] border border-[#D4C49F] text-[#2C2A29] px-4 py-3 rounded-md">
              Personal details saved successfully!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-medium text-[#2C2A29] mb-6">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                  placeholder="John Michael Doe"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="preferredName" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Preferred Name (Optional)
                </label>
                <input
                  type="text"
                  id="preferredName"
                  name="preferredName"
                  value={formData.preferredName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                  placeholder="Mike"
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Primary Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-medium text-[#2C2A29] mb-6">
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                  placeholder="Knoxville"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                  placeholder="TN"
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  required
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                  placeholder="37920"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-medium text-[#2C2A29] mb-6">
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="emergencyContactName" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  required
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  required
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                  placeholder="+1 (555) 987-6543"
                />
              </div>

              <div>
                <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Relationship *
                </label>
                <input
                  type="text"
                  id="emergencyContactRelationship"
                  name="emergencyContactRelationship"
                  required
                  value={formData.emergencyContactRelationship}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-[#2C2A29]"
                  placeholder="Spouse, Child, Sibling, etc."
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-[#2C2A29] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#A5B99A] hover:bg-[#95A98A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A5B99A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
