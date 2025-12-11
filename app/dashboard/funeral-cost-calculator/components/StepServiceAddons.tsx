'use client';

import { CalculatorData } from '../hooks/useCalculator';
import { DollarSign } from 'lucide-react';

interface StepServiceAddonsProps {
  data: CalculatorData;
  setData: (data: CalculatorData) => void;
  calculateTotal: () => number;
}

export default function StepServiceAddons({ data, setData }: StepServiceAddonsProps) {
  const updateField = (field: string, value: any) => {
    setData({
      ...data,
      serviceAddons: {
        ...data.serviceAddons,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#2C2A29] mb-2">Service Add-ons</h2>
        <p className="text-sm sm:text-base text-[#2C2A29] opacity-70">Optional services and enhancements</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Flowers
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.serviceAddons.flowers || ''}
              onChange={(e) => updateField('flowers', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Printed Materials (Programs/Cards)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.serviceAddons.printedMaterials || ''}
              onChange={(e) => updateField('printedMaterials', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Obituary Publication Fee
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.serviceAddons.obituaryPublicationFee || ''}
              onChange={(e) => updateField('obituaryPublicationFee', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Memorial Video/Photo Montage
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.serviceAddons.memorialVideoPhotoMontage || ''}
              onChange={(e) => updateField('memorialVideoPhotoMontage', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Musician/Singer Cost
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.serviceAddons.musicianSingerCost || ''}
              onChange={(e) => updateField('musicianSingerCost', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Officiant Honorarium
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.serviceAddons.officiantHonorarium || ''}
              onChange={(e) => updateField('officiantHonorarium', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

