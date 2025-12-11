'use client';

import { CalculatorData } from '../hooks/useCalculator';
import { DollarSign } from 'lucide-react';

interface StepTransportationProps {
  data: CalculatorData;
  setData: (data: CalculatorData) => void;
  calculateTotal: () => number;
}

export default function StepTransportation({ data, setData }: StepTransportationProps) {
  const updateField = (field: string, value: any) => {
    setData({
      ...data,
      transportation: {
        ...data.transportation,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#2C2A29] mb-2">Transportation</h2>
        <p className="text-[#2C2A29] opacity-70">Transportation costs for the service</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Limousine(s)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.transportation.limousines || ''}
              onChange={(e) => updateField('limousines', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Family Vehicle Transport
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.transportation.familyVehicleTransport || ''}
              onChange={(e) => updateField('familyVehicleTransport', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Mileage Fees
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.transportation.mileageFees || ''}
              onChange={(e) => updateField('mileageFees', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

