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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#2C2A29] mb-2">Choose Funeral Type</h2>
        <p className="text-sm sm:text-base text-[#2C2A29] opacity-70">Select whether you prefer burial or cremation</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <button
          type="button"
          onClick={() => setData({ ...data, burialOrCremation: 'burial' })}
          className={`p-4 sm:p-6 rounded-xl border-2 transition-all min-h-[100px] touch-target ${
            data.burialOrCremation === 'burial'
              ? 'border-[#A5B99A] bg-[#A5B99A] bg-opacity-10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${data.burialOrCremation === 'burial' ? 'bg-[#A5B99A]' : 'bg-gray-100'}`}>
              <Box className={`w-5 h-5 sm:w-6 sm:h-6 ${data.burialOrCremation === 'burial' ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Burial</h3>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70">Traditional ground burial</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setData({ ...data, burialOrCremation: 'cremation' })}
          className={`p-4 sm:p-6 rounded-xl border-2 transition-all min-h-[100px] touch-target ${
            data.burialOrCremation === 'cremation'
              ? 'border-[#93B0C8] bg-[#93B0C8] bg-opacity-10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${data.burialOrCremation === 'cremation' ? 'bg-[#93B0C8]' : 'bg-gray-100'}`}>
              <Flame className={`w-5 h-5 sm:w-6 sm:h-6 ${data.burialOrCremation === 'cremation' ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Cremation</h3>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70">Cremation services</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

