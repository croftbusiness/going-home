'use client';

import { CalculatorData } from '../hooks/useCalculator';
import { Box, Flame } from 'lucide-react';

interface StepFuneralTypeProps {
  data: CalculatorData;
  setData: (data: CalculatorData) => void;
  calculateTotal: () => number;
}

export default function StepFuneralType({ data, setData }: StepFuneralTypeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#2C2A29] mb-2">Choose Funeral Type</h2>
        <p className="text-[#2C2A29] opacity-70">Select whether you prefer burial or cremation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={() => setData({ ...data, burialOrCremation: 'burial' })}
          className={`p-6 rounded-xl border-2 transition-all ${
            data.burialOrCremation === 'burial'
              ? 'border-[#A5B99A] bg-[#A5B99A] bg-opacity-10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${data.burialOrCremation === 'burial' ? 'bg-[#A5B99A]' : 'bg-gray-100'}`}>
              <Box className={`w-6 h-6 ${data.burialOrCremation === 'burial' ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-[#2C2A29]">Burial</h3>
              <p className="text-sm text-[#2C2A29] opacity-70">Traditional ground burial</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setData({ ...data, burialOrCremation: 'cremation' })}
          className={`p-6 rounded-xl border-2 transition-all ${
            data.burialOrCremation === 'cremation'
              ? 'border-[#93B0C8] bg-[#93B0C8] bg-opacity-10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${data.burialOrCremation === 'cremation' ? 'bg-[#93B0C8]' : 'bg-gray-100'}`}>
              <Flame className={`w-6 h-6 ${data.burialOrCremation === 'cremation' ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-[#2C2A29]">Cremation</h3>
              <p className="text-sm text-[#2C2A29] opacity-70">Cremation services</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

