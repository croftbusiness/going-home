'use client';

import { CalculatorData } from '../hooks/useCalculator';
import { DollarSign } from 'lucide-react';

interface StepLegalAdminProps {
  data: CalculatorData;
  setData: (data: CalculatorData) => void;
  calculateTotal: () => number;
}

export default function StepLegalAdmin({ data, setData }: StepLegalAdminProps) {
  const updateField = (field: string, value: any) => {
    setData({
      ...data,
      legalAndAdmin: {
        ...data.legalAndAdmin,
        [field]: value,
      },
    });
  };

  const deathCertificatesTotal = (data.legalAndAdmin.deathCertificatesQuantity || 0) * (data.legalAndAdmin.deathCertificatesCostPerCopy || 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#2C2A29] mb-2">Legal & Administrative</h2>
        <p className="text-[#2C2A29] opacity-70">Legal documents and administrative fees</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Death Certificates (Quantity)
            </label>
            <input
              type="number"
              min="0"
              value={data.legalAndAdmin.deathCertificatesQuantity || ''}
              onChange={(e) => updateField('deathCertificatesQuantity', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Cost Per Copy
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={data.legalAndAdmin.deathCertificatesCostPerCopy || ''}
                onChange={(e) => updateField('deathCertificatesCostPerCopy', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {deathCertificatesTotal > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-[#2C2A29]">
              Death Certificates Total: <span className="font-semibold">${deathCertificatesTotal.toFixed(2)}</span>
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Required Permits
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.legalAndAdmin.requiredPermits || ''}
              onChange={(e) => updateField('requiredPermits', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Notary/Courier Fees
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={data.legalAndAdmin.notaryCourierFees || ''}
              onChange={(e) => updateField('notaryCourierFees', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

