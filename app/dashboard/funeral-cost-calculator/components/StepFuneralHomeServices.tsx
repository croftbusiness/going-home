'use client';

import { CalculatorData } from '../hooks/useCalculator';
import { DollarSign } from 'lucide-react';

interface StepFuneralHomeServicesProps {
  data: CalculatorData;
  setData: (data: CalculatorData) => void;
  calculateTotal: () => number;
}

export default function StepFuneralHomeServices({ data, setData }: StepFuneralHomeServicesProps) {
  const updateField = (field: string, value: any) => {
    setData({
      ...data,
      funeralHomeServices: {
        ...data.funeralHomeServices,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#2C2A29] mb-2">Funeral Home Services</h2>
        <p className="text-[#2C2A29] opacity-70">Enter costs for basic funeral home services</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Basic Service Fee
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.funeralHomeServices.basicServiceFee || ''}
              onChange={(e) => updateField('basicServiceFee', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Transportation of Remains
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.funeralHomeServices.transportationOfRemains || ''}
              onChange={(e) => updateField('transportationOfRemains', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="embalming"
            checked={data.funeralHomeServices.embalming?.enabled || false}
            onChange={(e) => updateField('embalming', { ...data.funeralHomeServices.embalming, enabled: e.target.checked })}
            className="w-5 h-5 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A]"
          />
          <label htmlFor="embalming" className="flex-1 text-sm font-medium text-[#2C2A29]">
            Embalming
          </label>
          {data.funeralHomeServices.embalming?.enabled && (
            <div className="relative w-48">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={data.funeralHomeServices.embalming?.cost || ''}
                onChange={(e) => updateField('embalming', { ...data.funeralHomeServices.embalming, enabled: true, cost: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="bodyPreparation"
            checked={data.funeralHomeServices.bodyPreparation?.enabled || false}
            onChange={(e) => updateField('bodyPreparation', { ...data.funeralHomeServices.bodyPreparation, enabled: e.target.checked })}
            className="w-5 h-5 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A]"
          />
          <label htmlFor="bodyPreparation" className="flex-1 text-sm font-medium text-[#2C2A29]">
            Body Preparation
          </label>
          {data.funeralHomeServices.bodyPreparation?.enabled && (
            <div className="relative w-48">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={data.funeralHomeServices.bodyPreparation?.cost || ''}
                onChange={(e) => updateField('bodyPreparation', { ...data.funeralHomeServices.bodyPreparation, enabled: true, cost: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Facility Usage for Visitation
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.funeralHomeServices.facilityUsageVisitation || ''}
              onChange={(e) => updateField('facilityUsageVisitation', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Facility Usage for Ceremony
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.funeralHomeServices.facilityUsageCeremony || ''}
              onChange={(e) => updateField('facilityUsageCeremony', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

