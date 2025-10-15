'use client';

import { useState } from 'react';
import { X, ChevronDown, CheckCircle } from 'lucide-react';

interface Step2LocationsProps {
  equipmentData: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onClose: () => void;
}

export default function Step2Locations({ equipmentData, onNext, onBack, onClose }: Step2LocationsProps) {
  const [formData, setFormData] = useState({
    pickup: {
      address: '',
      addressType: '' as '' | 'business' | 'residential' | 'port',
      isVerified: false
    },
    dropoff: {
      address: '',
      addressType: '' as '' | 'business' | 'residential' | 'port',
      isVerified: false
    },
    isLoadDrivable: null as boolean | null,
    doYouOwnLoad: null as boolean | null
  });

  const handleAddressChange = (location: 'pickup' | 'dropoff', address: string) => {
    setFormData(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        address,
        isVerified: false // Reset verification when address changes
      }
    }));
  };

  const handleAddressTypeChange = (location: 'pickup' | 'dropoff', type: 'business' | 'residential' | 'port') => {
    setFormData(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        addressType: type
      }
    }));
  };

  const handleVerifyAddress = (location: 'pickup' | 'dropoff') => {
    // Simulate address verification
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        [location]: {
          ...prev[location],
          isVerified: true
        }
      }));
    }, 1000);
  };

  const handleRadioChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    const combinedData = {
      equipment: equipmentData,
      locations: {
        pickup: formData.pickup,
        dropoff: formData.dropoff
      },
      characteristics: {
        isLoadDrivable: formData.isLoadDrivable,
        doYouOwnLoad: formData.doYouOwnLoad
      }
    };
    onNext(combinedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ backgroundColor: '#fcd001' }}>
          <h2 className="text-2xl font-bold text-gray-900">Locations</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Question */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Where is your load located, and where is it going?
            </h3>
          </div>

          {/* Pickup Location */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Pick Up Location <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.pickup.address}
                onChange={(e) => handleAddressChange('pickup', e.target.value)}
                placeholder="Enter City, State or Zip"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <select
                value={formData.pickup.addressType}
                onChange={(e) => handleAddressTypeChange('pickup', e.target.value as any)}
                className="px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
              >
                <option value="" className="text-gray-500">Select Type</option>
                <option value="business" className="text-gray-900">Business</option>
                <option value="residential" className="text-gray-900">Residential</option>
                <option value="port" className="text-gray-900">Port</option>
              </select>
            </div>
            {formData.pickup.isVerified ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Address Verified</span>
              </div>
            ) : (
              <button
                onClick={() => handleVerifyAddress('pickup')}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-1 px-3 rounded text-sm transition-colors"
              >
                VERIFY
              </button>
            )}
          </div>

          {/* Dropoff Location */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Drop Off Location <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.dropoff.address}
                onChange={(e) => handleAddressChange('dropoff', e.target.value)}
                placeholder="Enter City, State or Zip"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <select
                value={formData.dropoff.addressType}
                onChange={(e) => handleAddressTypeChange('dropoff', e.target.value as any)}
                className="px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
              >
                <option value="" className="text-gray-500">Select Type</option>
                <option value="business" className="text-gray-900">Business</option>
                <option value="residential" className="text-gray-900">Residential</option>
                <option value="port" className="text-gray-900">Port</option>
              </select>
            </div>
            {formData.dropoff.isVerified ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Address Verified</span>
              </div>
            ) : (
              <button
                onClick={() => handleVerifyAddress('dropoff')}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-1 px-3 rounded text-sm transition-colors"
              >
                VERIFY
              </button>
            )}
          </div>

          {/* Load Characteristics Questions */}
          <div className="space-y-6 pt-4">
            {/* Is this load drivable? */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Is this load drivable? <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="isLoadDrivable"
                    checked={formData.isLoadDrivable === true}
                    onChange={() => handleRadioChange('isLoadDrivable', true)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="isLoadDrivable"
                    checked={formData.isLoadDrivable === false}
                    onChange={() => handleRadioChange('isLoadDrivable', false)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Do you already own this load? */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Do you already own this load? <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="doYouOwnLoad"
                    checked={formData.doYouOwnLoad === true}
                    onChange={() => handleRadioChange('doYouOwnLoad', true)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="doYouOwnLoad"
                    checked={formData.doYouOwnLoad === false}
                    onChange={() => handleRadioChange('doYouOwnLoad', false)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
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
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg transition-colors uppercase tracking-wide"
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
