'use client';

import { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';

interface Step4AdditionalInfoProps {
  equipmentData: any;
  locationsData: any;
  schedulingData: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onClose: () => void;
}

export default function Step4AdditionalInfo({ equipmentData, locationsData, schedulingData, onNext, onBack, onClose }: Step4AdditionalInfoProps) {
  const [formData, setFormData] = useState({
    loadingMethods: ['DRIVE ON'] as string[],
    unloadingMethods: ['DRIVE OFF'] as string[],
    rampsNeeded: false,
    handlingInstructions: '',
    targetBudget: undefined as number | undefined,
    itemValue: undefined as number | undefined
  });

  const loadingOptions = ['DRIVE ON', 'FORKLIFT', 'DOCK', 'OTHER'];
  const unloadingOptions = ['DRIVE OFF', 'FORKLIFT', 'DOCK', 'OTHER'];

  const handleCheckboxChange = (type: 'loading' | 'unloading', value: string) => {
    const field = type === 'loading' ? 'loadingMethods' : 'unloadingMethods';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleRadioChange = (value: boolean) => {
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
    const numValue = value === '' ? undefined : parseFloat(value.replace(/[^0-9.]/g, ''));
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ backgroundColor: '#fcd001' }}>
          <h2 className="text-2xl font-bold text-gray-900">Additional Info</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Loading Methods */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">
                How will your item(s) be loaded at pick up?
              </label>
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span className="text-red-500">*</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {loadingOptions.map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.loadingMethods.includes(option)}
                    onChange={() => handleCheckboxChange('loading', option)}
                    className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Unloading Methods */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">
                How will your item(s) be unloaded at delivery?
              </label>
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span className="text-red-500">*</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {unloadingOptions.map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.unloadingMethods.includes(option)}
                    onChange={() => handleCheckboxChange('unloading', option)}
                    className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ramps Required */}
          <div className="space-y-4">
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
                  onChange={() => handleRadioChange(true)}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="rampsNeeded"
                  checked={formData.rampsNeeded === false}
                  onChange={() => handleRadioChange(false)}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Load Details/Handling Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Load Details/Handling Instructions
            </h3>
            <textarea
              value={formData.handlingInstructions}
              onChange={(e) => handleTextChange('handlingInstructions', e.target.value)}
              placeholder='Please enter information about the Load that may be helpful for the carrier to know prior to pick up. Example: "The equipment is at the end of a long driveway, and requires backing in."'
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
            />
          </div>

          {/* Financial Information */}
          <div className="space-y-6">
            {/* Target Budget */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-semibold text-gray-700">
                  Target Budget
                </label>
                <HelpCircle className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">$</span>
                <input
                  type="text"
                  value={formatCurrency(formData.targetBudget)}
                  onChange={(e) => handleNumberChange('targetBudget', e.target.value)}
                  placeholder="0"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            {/* Value of Item(s) */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-semibold text-gray-700">
                  Value of Item(s)
                </label>
                <HelpCircle className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">$</span>
                <input
                  type="text"
                  value={formatCurrency(formData.itemValue)}
                  onChange={(e) => handleNumberChange('itemValue', e.target.value)}
                  placeholder="0"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <span className="text-gray-600 ml-2">USD</span>
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
    </div>
  );
}
