'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calculator, ChevronRight, ChevronLeft, Save, CheckCircle2, Sparkles, Edit3 } from 'lucide-react';
import { useCalculator } from './hooks/useCalculator';
import { CalculatorData } from './hooks/useCalculator';
import StepFuneralType from './components/StepFuneralType';
import StepFuneralHomeServices from './components/StepFuneralHomeServices';
import StepBurialOrCremation from './components/StepBurialOrCremation';
import StepServiceAddons from './components/StepServiceAddons';
import StepVenueCatering from './components/StepVenueCatering';
import StepTransportation from './components/StepTransportation';
import StepLegalAdmin from './components/StepLegalAdmin';
import StepSummary from './components/StepSummary';
import QuestionnaireMode from './components/QuestionnaireMode';

const STEPS = [
  { id: 'type', label: 'Type', component: StepFuneralType },
  { id: 'funeral-home', label: 'Services', component: StepFuneralHomeServices },
  { id: 'burial-cremation', label: 'Burial/Cremation', component: StepBurialOrCremation },
  { id: 'addons', label: 'Add-ons', component: StepServiceAddons },
  { id: 'venue', label: 'Venue', component: StepVenueCatering },
  { id: 'transportation', label: 'Transport', component: StepTransportation },
  { id: 'legal', label: 'Legal', component: StepLegalAdmin },
  { id: 'summary', label: 'Summary', component: StepSummary },
];

type Mode = 'select' | 'questionnaire' | 'manual';

export default function FuneralCostCalculatorPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('select');
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

  const handleQuestionnaireComplete = (estimatedData: CalculatorData) => {
    setData(estimatedData);
    setMode('manual');
    setCurrentStep(STEPS.length - 1); // Go to summary
  };

  const handleSwitchToManual = () => {
    setMode('manual');
    setCurrentStep(0);
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
      <header className="bg-[#FCFAF7] border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/dashboard/funeral-planning"
              className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="p-2 sm:p-3 bg-[#93B0C8] bg-opacity-10 rounded-xl flex-shrink-0">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#2C2A29]">
                Funeral Cost Calculator
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-0.5">
                Estimate and plan your funeral expenses
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Mode Selection */}
        {mode === 'select' && (
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#2C2A29] mb-4">
                Choose Your Method
              </h2>
              <p className="text-[#2C2A29] opacity-70 mb-6 text-sm sm:text-base">
                Get started with a quick estimate or enter costs manually
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('questionnaire')}
                  className="p-6 rounded-xl border-2 border-[#93B0C8] bg-[#93B0C8] bg-opacity-10 hover:bg-opacity-20 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Sparkles className="w-6 h-6 text-[#93B0C8] group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-[#2C2A29]">Quick Estimate</h3>
                  </div>
                  <p className="text-sm text-[#2C2A29] opacity-70">
                    Answer a few questions to get an estimated cost based on your preferences. Perfect if you're just getting started.
                  </p>
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className="p-6 rounded-xl border-2 border-[#A5B99A] bg-[#A5B99A] bg-opacity-10 hover:bg-opacity-20 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Edit3 className="w-6 h-6 text-[#A5B99A] group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-[#2C2A29]">Manual Entry</h3>
                  </div>
                  <p className="text-sm text-[#2C2A29] opacity-70">
                    Enter specific costs for each item. Best if you already have quotes or know your preferences.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questionnaire Mode */}
        {mode === 'questionnaire' && (
          <div className="mb-6">
            <button
              onClick={() => setMode('select')}
              className="mb-4 text-sm text-[#93B0C8] hover:text-[#A5B99A] flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to selection</span>
            </button>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <QuestionnaireMode onComplete={handleQuestionnaireComplete} />
            </div>
          </div>
        )}

        {/* Manual Mode */}
        {mode === 'manual' && (
          <>
            {/* Progress Steps - Mobile Optimized */}
            <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
              <div className="hidden sm:flex items-center justify-between mb-4">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-base transition-colors ${
                          index < currentStep
                            ? 'bg-[#A5B99A] text-white'
                            : index === currentStep
                            ? 'bg-[#93B0C8] text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {index < currentStep ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`text-xs mt-1 sm:mt-2 text-center hidden md:block ${index === currentStep ? 'font-medium text-[#2C2A29]' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`flex-1 h-1 mx-1 sm:mx-2 ${index < currentStep ? 'bg-[#A5B99A]' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              {/* Mobile Progress Bar */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#2C2A29]">
                    Step {currentStep + 1} of {STEPS.length}
                  </span>
                  <span className="text-xs text-[#2C2A29] opacity-70">
                    {STEPS[currentStep].label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 flex items-center space-x-2 text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Calculation saved successfully!</span>
              </div>
            )}

            {/* Switch to Manual Button (if in questionnaire mode) */}
            {mode === 'manual' && currentStep === STEPS.length - 1 && (
              <div className="mb-4 sm:mb-6">
                <button
                  onClick={handleSwitchToManual}
                  className="text-sm text-[#93B0C8] hover:text-[#A5B99A] flex items-center space-x-1"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit individual costs</span>
                </button>
              </div>
            )}

            {/* Current Step Component */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
              <CurrentStepComponent
                data={data}
                setData={setData}
                calculateTotal={calculateTotal}
              />
            </div>

            {/* Navigation Buttons - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-4 sm:px-6 py-2.5 sm:py-3 min-h-[48px] bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base order-2 sm:order-1"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-3 order-1 sm:order-2 flex-1 sm:flex-initial justify-center sm:justify-end">
                {currentStep === STEPS.length - 1 ? (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 min-h-[48px] bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base font-medium w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{saving ? 'Saving...' : 'Save Calculation'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 min-h-[48px] bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base font-medium w-full sm:w-auto"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Total Cost Display - Mobile Optimized */}
            {currentStep > 0 && (
              <div className="mt-4 sm:mt-6 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] rounded-xl p-4 sm:p-6 text-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm opacity-90">Estimated Total Cost</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

