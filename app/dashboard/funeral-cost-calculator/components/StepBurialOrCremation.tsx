'use client';

import { CalculatorData } from '../hooks/useCalculator';
import { DollarSign } from 'lucide-react';

interface StepBurialOrCremationProps {
  data: CalculatorData;
  setData: (data: CalculatorData) => void;
  calculateTotal: () => number;
}

const CASKET_TYPES = [
  { value: 'wood-standard', label: 'Standard Wood' },
  { value: 'wood-premium', label: 'Premium Wood' },
  { value: 'metal-standard', label: 'Standard Metal' },
  { value: 'metal-premium', label: 'Premium Metal' },
  { value: 'custom', label: 'Custom' },
];

const VAULT_TYPES = [
  { value: 'concrete-vault', label: 'Concrete Vault' },
  { value: 'metal-vault', label: 'Metal Vault' },
  { value: 'liner', label: 'Burial Liner' },
];

const URN_TYPES = [
  { value: 'standard', label: 'Standard Urn' },
  { value: 'premium', label: 'Premium Urn' },
  { value: 'biodegradable', label: 'Biodegradable Urn' },
  { value: 'custom', label: 'Custom Urn' },
];

export default function StepBurialOrCremation({ data, setData }: StepBurialOrCremationProps) {
  const updateBurialField = (field: string, value: any) => {
    setData({
      ...data,
      burialCosts: {
        ...data.burialCosts,
        [field]: value,
      },
    });
  };

  const updateCremationField = (field: string, value: any) => {
    setData({
      ...data,
      cremationCosts: {
        ...data.cremationCosts,
        [field]: value,
      },
    });
  };

  if (data.burialOrCremation === 'burial') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#2C2A29] mb-2">Burial Costs</h2>
          <p className="text-[#2C2A29] opacity-70">Enter costs for burial-related expenses</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Casket Type
            </label>
            <select
              value={data.burialCosts.casketType || ''}
              onChange={(e) => updateBurialField('casketType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            >
              <option value="">Select casket type</option>
              {CASKET_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Casket Cost
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={data.burialCosts.casketCost || ''}
                onChange={(e) => updateBurialField('casketCost', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Vault or Liner
            </label>
            <select
              value={data.burialCosts.vaultOrLiner || ''}
              onChange={(e) => updateBurialField('vaultOrLiner', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            >
              <option value="">Select vault or liner</option>
              {VAULT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Vault/Liner Cost
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={data.burialCosts.vaultOrLinerCost || ''}
                onChange={(e) => updateBurialField('vaultOrLinerCost', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Gravesite Cost
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={data.burialCosts.gravesiteCost || ''}
                onChange={(e) => updateBurialField('gravesiteCost', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Opening & Closing Fee
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={data.burialCosts.openingClosingFee || ''}
                onChange={(e) => updateBurialField('openingClosingFee', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Headstone Cost
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={data.burialCosts.headstoneCost || ''}
                onChange={(e) => updateBurialField('headstoneCost', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Engraving Cost
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={data.burialCosts.engravingCost || ''}
                onChange={(e) => updateBurialField('engravingCost', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (data.burialOrCremation === 'cremation') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#2C2A29] mb-2">Cremation Costs</h2>
          <p className="text-[#2C2A29] opacity-70">Enter costs for cremation-related expenses</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Cremation Fee
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={data.cremationCosts.cremationFee || ''}
                onChange={(e) => updateCremationField('cremationFee', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Urn Type
            </label>
            <select
              value={data.cremationCosts.urnType || ''}
              onChange={(e) => updateCremationField('urnType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            >
              <option value="">Select urn type</option>
              {URN_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Urn Cost
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={data.cremationCosts.urnCost || ''}
                onChange={(e) => updateCremationField('urnCost', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="keepsakeUrns"
              checked={data.cremationCosts.keepsakeUrnsJewelry?.enabled || false}
              onChange={(e) => updateCremationField('keepsakeUrnsJewelry', { ...data.cremationCosts.keepsakeUrnsJewelry, enabled: e.target.checked })}
              className="w-5 h-5 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A]"
            />
            <label htmlFor="keepsakeUrns" className="flex-1 text-sm font-medium text-[#2C2A29]">
              Keepsake Urns/Jewelry
            </label>
            {data.cremationCosts.keepsakeUrnsJewelry?.enabled && (
              <div className="relative w-48">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={data.cremationCosts.keepsakeUrnsJewelry?.cost || ''}
                  onChange={(e) => updateCremationField('keepsakeUrnsJewelry', { ...data.cremationCosts.keepsakeUrnsJewelry, enabled: true, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Scattering Permit/Location Fees
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={data.cremationCosts.scatteringPermitFees || ''}
                onChange={(e) => updateCremationField('scatteringPermitFees', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-[#2C2A29] opacity-70">Please select burial or cremation in the first step.</p>
    </div>
  );
}

