'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home as HomeIcon, Save } from 'lucide-react';

interface Household {
  petCareInstructions?: string;
  homeAccessCodes?: string;
  vehicleLocations?: string;
  monthlyBills?: Array<{ name: string; amount: string; dueDate: string; accountNumber?: string }>;
  serviceCancellationInstructions?: string;
  utilityAccounts?: string;
  homeMaintenanceNotes?: string;
}

export default function HouseholdPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Household>({
    petCareInstructions: '',
    homeAccessCodes: '',
    vehicleLocations: '',
    monthlyBills: [],
    serviceCancellationInstructions: '',
    utilityAccounts: '',
    homeMaintenanceNotes: '',
  });
  const [newBill, setNewBill] = useState({ name: '', amount: '', dueDate: '', accountNumber: '' });

  useEffect(() => {
    loadHousehold();
  }, []);

  const loadHousehold = async () => {
    try {
      const response = await fetch('/api/user/household');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load data');
      }

      const data = await response.json();
      if (data.household) {
        setFormData({
          petCareInstructions: data.household.petCareInstructions || '',
          homeAccessCodes: data.household.homeAccessCodes || '',
          vehicleLocations: data.household.vehicleLocations || '',
          monthlyBills: data.household.monthlyBills || [],
          serviceCancellationInstructions: data.household.serviceCancellationInstructions || '',
          utilityAccounts: data.household.utilityAccounts || '',
          homeMaintenanceNotes: data.household.homeMaintenanceNotes || '',
        });
      }
    } catch (error) {
      setError('Failed to load household information');
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
      const response = await fetch('/api/user/household', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save data');

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      setError('Failed to save household information');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addBill = () => {
    if (newBill.name.trim()) {
      setFormData({
        ...formData,
        monthlyBills: [...(formData.monthlyBills || []), { ...newBill }],
      });
      setNewBill({ name: '', amount: '', dueDate: '', accountNumber: '' });
    }
  };

  const removeBill = (index: number) => {
    setFormData({
      ...formData,
      monthlyBills: formData.monthlyBills?.filter((_, i) => i !== index) || [],
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
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl">
              <HomeIcon className="w-6 h-6 text-[#A5B99A]" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-[#2C2A29]">Household Information</h1>
              <p className="text-[#2C2A29] opacity-70 mt-1">
                Practical information to help loved ones manage your household
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">
              Information saved successfully!
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 space-y-8">
          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Pet Care Instructions
            </label>
            <textarea
              name="petCareInstructions"
              value={formData.petCareInstructions}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Instructions for caring for your pets..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Home Access Codes
            </label>
            <textarea
              name="homeAccessCodes"
              value={formData.homeAccessCodes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent font-mono"
              placeholder="Alarm codes, door codes, safe combinations, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Vehicle Locations
            </label>
            <textarea
              name="vehicleLocations"
              value={formData.vehicleLocations}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Where vehicles are parked, keys location, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Monthly Bills
            </label>
            <div className="space-y-3 mb-3">
              {formData.monthlyBills?.map((bill, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-[#2C2A29]">{bill.name}</p>
                    <p className="text-sm text-[#2C2A29] opacity-70">
                      ${bill.amount} - Due: {bill.dueDate}
                      {bill.accountNumber && ` - Account: ${bill.accountNumber}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBill(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={newBill.name}
                onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                placeholder="Bill name"
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              />
              <input
                type="text"
                value={newBill.amount}
                onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                placeholder="Amount"
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              />
              <input
                type="text"
                value={newBill.dueDate}
                onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                placeholder="Due date"
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              />
              <button
                type="button"
                onClick={addBill}
                className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Service Cancellation Instructions
            </label>
            <textarea
              name="serviceCancellationInstructions"
              value={formData.serviceCancellationInstructions}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="How to cancel subscriptions, services, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Utility Accounts
            </label>
            <textarea
              name="utilityAccounts"
              value={formData.utilityAccounts}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Electric, water, gas, internet account information..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Home Maintenance Notes
            </label>
            <textarea
              name="homeMaintenanceNotes"
              value={formData.homeMaintenanceNotes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Maintenance schedules, contractor contacts, etc."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Information'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

