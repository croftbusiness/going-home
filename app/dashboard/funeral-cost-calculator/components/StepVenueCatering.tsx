'use client';

import { CalculatorData } from '../hooks/useCalculator';
import { DollarSign } from 'lucide-react';

interface StepVenueCateringProps {
  data: CalculatorData;
  setData: (data: CalculatorData) => void;
  calculateTotal: () => number;
}

export default function StepVenueCatering({ data, setData }: StepVenueCateringProps) {
  const updateField = (field: string, value: any) => {
    setData({
      ...data,
      venueAndCatering: {
        ...data.venueAndCatering,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#2C2A29] mb-2">Venue & Catering</h2>
        <p className="text-[#2C2A29] opacity-70">Ceremony and reception venue costs</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Ceremony Venue Fee
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.venueAndCatering.ceremonyVenueFee || ''}
              onChange={(e) => updateField('ceremonyVenueFee', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Reception Venue Fee
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.venueAndCatering.receptionVenueFee || ''}
              onChange={(e) => updateField('receptionVenueFee', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Catering
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.venueAndCatering.catering || ''}
              onChange={(e) => updateField('catering', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

