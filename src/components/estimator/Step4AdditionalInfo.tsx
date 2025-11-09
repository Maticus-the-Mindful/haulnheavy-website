'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface Step4AdditionalInfoProps {
  equipmentData: any;
  locationsData: any;
  schedulingData: any;
  existingData?: any; // Existing additional info data from previous visits
  onNext: (data: any) => void;
  onBack: () => void;
  onClose: () => void;
}

export default function Step4AdditionalInfo({ equipmentData, locationsData, schedulingData, existingData, onNext, onBack, onClose }: Step4AdditionalInfoProps) {
  const [formData, setFormData] = useState({
    loadingMethod: (existingData?.loadingMethod || 'DRIVE ON') as string,
    unloadingMethod: (existingData?.unloadingMethod || 'DRIVE OFF') as string,
    rampsNeeded: existingData?.rampsNeeded !== undefined ? existingData.rampsNeeded : null as boolean | null,
    targetBudget: existingData?.targetBudget || undefined as number | undefined,
    itemValue: existingData?.itemValue || undefined as number | undefined
  });

  const loadingOptions = [
    { value: 'DRIVE ON', description: 'must be able to drive on trailer ramp under own power' },
    { value: 'FORKLIFT', description: 'forklift must be rated to carry weight of load' },
    { value: 'DOCK', description: 'standard height dock available' },
    { value: 'CRANE', description: 'crane is available at the location for loading' },
    { value: 'ROLL ON / ROLL OFF', description: 'you must have method to push item on / pull item off trailer' }
  ];
  
  const unloadingOptions = [
    { value: 'DRIVE OFF', description: 'must be able to drive on trailer ramp under own power' },
    { value: 'FORKLIFT', description: 'forklift must be rated to carry weight of load' },
    { value: 'DOCK', description: 'standard height dock available' },
    { value: 'CRANE', description: 'crane is available at the location for loading' },
    { value: 'ROLL ON / ROLL OFF', description: 'you must have method to push item on / pull item off trailer' }
  ];

  const handleRadioChange = (type: 'loading' | 'unloading', value: string) => {
    const field = type === 'loading' ? 'loadingMethod' : 'unloadingMethod';
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRampsChange = (value: boolean) => {
    setFormData(prev => ({
      ...prev,
      rampsNeeded: value
    }));
  };

  const handleTextChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberChange = (field: string, value: string) => {
    // Remove all non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleanValue.split('.');
    const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue;
    
    const numValue = formattedValue === '' ? undefined : parseFloat(formattedValue);
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point
    if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right, down, up
        (e.keyCode >= 35 && e.keyCode <= 40)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '';
    return value.toLocaleString();
  };

  const handleNext = () => {
    const additionalInfoData = {
      additionalInfo: formData
    };
    onNext(additionalInfoData);
  };

  // Tooltip component - works on both mobile and desktop with better positioning
  const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onClick={() => setIsVisible(!isVisible)}
          className="cursor-pointer"
        >
          {children}
        </div>
        {isVisible && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 max-w-[calc(100vw-2rem)] bg-black text-white text-sm px-4 py-3 rounded-lg shadow-lg z-50">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white w-full min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 border-b" style={{ backgroundColor: '#fcd001' }}>
          <h2 className="text-2xl font-bold text-gray-900">Additional Info</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Loading Methods */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">
                How will your item(s) be loaded at pick up?
              </label>
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span className="text-red-500">*</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {loadingOptions.map(option => (
                <Tooltip key={option.value} content={`${option.value} - ${option.description}`}>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="radio"
                        name="loadingMethod"
                        value={option.value}
                        checked={formData.loadingMethod === option.value}
                        onChange={() => handleRadioChange('loading', option.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        formData.loadingMethod === option.value
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'bg-white border-gray-300'
                      }`}>
                        {formData.loadingMethod === option.value && (
                          <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{option.value}</span>
                  </label>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Unloading Methods */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">
                How will your item(s) be unloaded at delivery?
              </label>
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span className="text-red-500">*</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {unloadingOptions.map(option => (
                <Tooltip key={option.value} content={`${option.value} - ${option.description}`}>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="radio"
                        name="unloadingMethod"
                        value={option.value}
                        checked={formData.unloadingMethod === option.value}
                        onChange={() => handleRadioChange('unloading', option.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        formData.unloadingMethod === option.value
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'bg-white border-gray-300'
                      }`}>
                        {formData.unloadingMethod === option.value && (
                          <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{option.value}</span>
                  </label>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Ramps Required */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">
                Are ramps needed?
              </label>
              <span className="text-red-500">*</span>
            </div>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="rampsNeeded"
                  checked={formData.rampsNeeded === true}
                  onChange={() => handleRampsChange(true)}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="rampsNeeded"
                  checked={formData.rampsNeeded === false}
                  onChange={() => handleRampsChange(false)}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Target Budget */}
            <div className="space-y-2">
              <Tooltip content="Please indicate the maximum amount you are willing to spend on shipping your item(s).">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Target Budget
                  </label>
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                </div>
              </Tooltip>
              <div className="relative">
                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-300 focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500">
                  <span className="px-3 py-2 text-gray-600 border-r border-gray-300">$</span>
                  <input
                    type="text"
                    value={formatCurrency(formData.targetBudget)}
                    onChange={(e) => handleNumberChange('targetBudget', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                    className="flex-1 px-3 py-2 bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                  <div className="hidden sm:flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleNumberChange('targetBudget', String((formData.targetBudget || 0) + 100))}
                      className="px-2 py-1 text-gray-400 hover:text-gray-600 border-b border-gray-300"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumberChange('targetBudget', String(Math.max(0, (formData.targetBudget || 0) - 100)))}
                      className="px-2 py-1 text-gray-400 hover:text-gray-600"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="px-3 py-2 text-gray-600 border-l border-gray-300">USD</span>
                </div>
              </div>
            </div>

            {/* Value of Item(s) */}
            <div className="space-y-2">
              <Tooltip content="This value will be used to help the bidder determine the type of insurance that is needed.">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Value of Item(s)
                  </label>
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                </div>
              </Tooltip>
              <div className="relative">
                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-300 focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500">
                  <span className="px-3 py-2 text-gray-600 border-r border-gray-300">$</span>
                  <input
                    type="text"
                    value={formatCurrency(formData.itemValue)}
                    onChange={(e) => handleNumberChange('itemValue', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                    className="flex-1 px-3 py-2 bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                  <div className="hidden sm:flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleNumberChange('itemValue', String((formData.itemValue || 0) + 1000))}
                      className="px-2 py-1 text-gray-400 hover:text-gray-600 border-b border-gray-300"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumberChange('itemValue', String(Math.max(0, (formData.itemValue || 0) - 1000)))}
                      className="px-2 py-1 text-gray-400 hover:text-gray-600"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="px-3 py-2 text-gray-600 border-l border-gray-300">USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              onClick={onBack}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg transition-colors uppercase tracking-wide"
            >
              Go Back
            </button>
            <button
              onClick={handleNext}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors uppercase tracking-wide"
            >
              Next Step
            </button>
          </div>
        </div>
    </div>
  );
}
