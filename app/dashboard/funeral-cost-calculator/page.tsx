'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calculator, ChevronRight, ChevronLeft, Save, CheckCircle2 } from 'lucide-react';
import { useCalculator } from './hooks/useCalculator';
import StepFuneralType from './components/StepFuneralType';
import StepFuneralHomeServices from './components/StepFuneralHomeServices';
import StepBurialOrCremation from './components/StepBurialOrCremation';
import StepServiceAddons from './components/StepServiceAddons';
import StepVenueCatering from './components/StepVenueCatering';
import StepTransportation from './components/StepTransportation';
import StepLegalAdmin from './components/StepLegalAdmin';
import StepSummary from './components/StepSummary';

const STEPS = [
  { id: 'type', label: 'Funeral Type', component: StepFuneralType },
  { id: 'funeral-home', label: 'Funeral Home Services', component: StepFuneralHomeServices },
  { id: 'burial-cremation', label: 'Burial/Cremation', component: StepBurialOrCremation },
  { id: 'addons', label: 'Service Add-ons', component: StepServiceAddons },
  { id: 'venue', label: 'Venue & Catering', component: StepVenueCatering },
  { id: 'transportation', label: 'Transportation', component: StepTransportation },
  { id: 'legal', label: 'Legal & Admin', component: StepLegalAdmin },
  { id: 'summary', label: 'Summary', component: StepSummary },
];

export default function FuneralCostCalculatorPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { data, setData, loading, saving, calculateTotal, saveCalculation } = useCalculator();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSave = async () => {
    const saved = await saveCalculation();
    if (saved) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError('Failed to save calculation');
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-[#2C2A29]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <header className="bg-[#FCFAF7] border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/dashboard/funeral-planning"
              className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="p-3 bg-[#93B0C8] bg-opacity-10 rounded-xl">
              <Calculator className="w-6 h-6 text-[#93B0C8]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">
                Funeral Cost Calculator
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Estimate and plan your funeral expenses
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Progress Steps */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      index < currentStep
                        ? 'bg-[#A5B99A] text-white'
                        : index === currentStep
                        ? 'bg-[#93B0C8] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center ${index === currentStep ? 'font-medium text-[#2C2A29]' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${index < currentStep ? 'bg-[#A5B99A]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Calculation saved successfully!</span>
          </div>
        )}

        {/* Current Step Component */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <CurrentStepComponent
            data={data}
            setData={setData}
            calculateTotal={calculateTotal}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentStep === STEPS.length - 1 ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Calculation'}</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Total Cost Display */}
        {currentStep > 0 && (
          <div className="mt-6 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Estimated Total Cost</p>
                <p className="text-3xl font-bold mt-1">${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

