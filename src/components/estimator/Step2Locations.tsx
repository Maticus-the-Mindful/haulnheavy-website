'use client';

import { useState } from 'react';
import { X, ChevronDown, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';

interface Step2LocationsProps {
  equipmentData: any;
  existingData?: any; // Existing locations data from previous visits
  onNext: (data: any) => void;
  onBack: () => void;
  onClose: () => void;
}

export default function Step2Locations({ equipmentData, existingData, onNext, onBack, onClose }: Step2LocationsProps) {
  const [formData, setFormData] = useState({
    pickup: {
      address: existingData?.pickup?.address || '',
      addressType: (existingData?.pickup?.addressType || '') as '' | 'business' | 'residential' | 'port',
      isVerified: existingData?.pickup?.isVerified || false,
      verificationStatus: (existingData?.pickup?.verificationStatus || 'none') as 'none' | 'verifying' | 'verified' | 'error',
      verifiedAddress: existingData?.pickup?.verifiedAddress || '',
      error: existingData?.pickup?.error || '',
      suggestions: existingData?.pickup?.suggestions || [] as Array<{display_name: string, place_id: string}>
    },
    dropoff: {
      address: existingData?.dropoff?.address || '',
      addressType: (existingData?.dropoff?.addressType || '') as '' | 'business' | 'residential' | 'port',
      isVerified: existingData?.dropoff?.isVerified || false,
      verificationStatus: (existingData?.dropoff?.verificationStatus || 'none') as 'none' | 'verifying' | 'verified' | 'error',
      verifiedAddress: existingData?.dropoff?.verifiedAddress || '',
      error: existingData?.dropoff?.error || '',
      suggestions: existingData?.dropoff?.suggestions || [] as Array<{display_name: string, place_id: string}>
    },
    isLoadDrivable: existingData?.isLoadDrivable !== undefined ? existingData.isLoadDrivable : null as boolean | null,
    doYouOwnLoad: existingData?.doYouOwnLoad !== undefined ? existingData.doYouOwnLoad : null as boolean | null
  });

  const handleAddressChange = (location: 'pickup' | 'dropoff', address: string) => {
    setFormData(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        address,
        isVerified: false,
        verificationStatus: 'none',
        verifiedAddress: '',
        error: '',
        suggestions: []
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

  const handleSuggestionSelect = (location: 'pickup' | 'dropoff', suggestion: {display_name: string, place_id: string}) => {
    setFormData(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        address: suggestion.display_name,
        isVerified: true,
        verificationStatus: 'verified',
        verifiedAddress: suggestion.display_name,
        error: '',
        suggestions: []
      }
    }));
  };

  const handleAddressSelect = (location: 'pickup' | 'dropoff', suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        address: suggestion.address,
        isVerified: true,
        verificationStatus: 'verified',
        verifiedAddress: suggestion.address,
        error: '',
        suggestions: []
      }
    }));
  };

  const handleVerifyAddress = async (location: 'pickup' | 'dropoff') => {
    const address = formData[location].address.trim();
    
    if (!address) {
      setFormData(prev => ({
        ...prev,
        [location]: {
          ...prev[location],
          verificationStatus: 'error',
          error: 'Please enter an address to verify'
        }
      }));
      return;
    }

    // Set verifying status
    setFormData(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        verificationStatus: 'verifying',
        error: ''
      }
    }));

    try {
      // Use Nominatim (OpenStreetMap) geocoding API - get multiple results for suggestions
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=us&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Network error');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const verifiedAddress = result.display_name;
        
        // If we have multiple results, show suggestions
        if (data.length > 1) {
          const suggestions = data.slice(1, 4).map((item: any) => ({
            display_name: item.display_name,
            place_id: item.place_id
          }));
          
          setFormData(prev => ({
            ...prev,
            [location]: {
              ...prev[location],
              verificationStatus: 'verified',
              isVerified: true,
              verifiedAddress,
              error: '',
              suggestions: suggestions
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [location]: {
              ...prev[location],
              verificationStatus: 'verified',
              isVerified: true,
              verifiedAddress,
              error: '',
              suggestions: []
            }
          }));
        }
      } else {
        // Try a more flexible search for suggestions
        const flexibleResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address.split(',')[0])}&limit=3&countrycodes=us&addressdetails=1`
        );
        
        if (flexibleResponse.ok) {
          const flexibleData = await flexibleResponse.json();
          
          if (flexibleData && flexibleData.length > 0) {
            const suggestions = flexibleData.map((item: any) => ({
              display_name: item.display_name,
              place_id: item.place_id
            }));
            
            setFormData(prev => ({
              ...prev,
              [location]: {
                ...prev[location],
                verificationStatus: 'error',
                error: 'Address not found exactly, but here are some suggestions:',
                suggestions: suggestions
              }
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              [location]: {
                ...prev[location],
                verificationStatus: 'error',
                error: 'Address not found. Please check and try again.',
                suggestions: []
              }
            }));
          }
        } else {
          setFormData(prev => ({
            ...prev,
            [location]: {
              ...prev[location],
              verificationStatus: 'error',
              error: 'Address not found. Please check and try again.',
              suggestions: []
            }
          }));
        }
      }
    } catch (error) {
      console.error('Address verification error:', error);
      setFormData(prev => ({
        ...prev,
        [location]: {
          ...prev[location],
          verificationStatus: 'error',
          error: 'Unable to verify address. Please check your internet connection.'
        }
      }));
    }
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
            <div className="flex flex-col sm:flex-row gap-2">
              <AddressAutocomplete
                value={formData.pickup.address}
                onChange={(address) => handleAddressChange('pickup', address)}
                onSelect={(suggestion) => handleAddressSelect('pickup', suggestion)}
                placeholder="Enter pickup address..."
                country="us"
                showVerified={formData.pickup.isVerified}
                verified={formData.pickup.isVerified}
                className="flex-1 min-w-0"
              />
              <select
                value={formData.pickup.addressType}
                onChange={(e) => handleAddressTypeChange('pickup', e.target.value as any)}
                className="w-full sm:w-48 px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900 flex-shrink-0"
              >
                <option value="" className="text-gray-500">Select Type</option>
                <option value="business" className="text-gray-900">Business</option>
                <option value="residential" className="text-gray-900">Residential</option>
                <option value="port" className="text-gray-900">Port</option>
              </select>
            </div>
            {formData.pickup.verificationStatus === 'verifying' ? (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Verifying address...</span>
              </div>
            ) : formData.pickup.verificationStatus === 'verified' ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Address Verified</span>
                </div>
                <div className="text-xs text-gray-600 bg-green-50 p-2 rounded">
                  {formData.pickup.verifiedAddress}
                </div>
              </div>
            ) : formData.pickup.verificationStatus === 'error' ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Verification Failed</span>
                </div>
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {formData.pickup.error}
                </div>
                {formData.pickup.suggestions && formData.pickup.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Did you mean:</p>
                    <div className="space-y-1">
                      {formData.pickup.suggestions.map((suggestion: {display_name: string, place_id: string}, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionSelect('pickup', suggestion)}
                          className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 border border-blue-200 rounded hover:border-blue-300 transition-colors"
                        >
                          {suggestion.display_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleVerifyAddress('pickup')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-1 px-3 rounded text-sm transition-colors"
                >
                  TRY AGAIN
                </button>
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
            <div className="flex flex-col sm:flex-row gap-2">
              <AddressAutocomplete
                value={formData.dropoff.address}
                onChange={(address) => handleAddressChange('dropoff', address)}
                onSelect={(suggestion) => handleAddressSelect('dropoff', suggestion)}
                placeholder="Enter delivery address..."
                country="us"
                showVerified={formData.dropoff.isVerified}
                verified={formData.dropoff.isVerified}
                className="flex-1 min-w-0"
              />
              <select
                value={formData.dropoff.addressType}
                onChange={(e) => handleAddressTypeChange('dropoff', e.target.value as any)}
                className="w-full sm:w-48 px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900 flex-shrink-0"
              >
                <option value="" className="text-gray-500">Select Type</option>
                <option value="business" className="text-gray-900">Business</option>
                <option value="residential" className="text-gray-900">Residential</option>
                <option value="port" className="text-gray-900">Port</option>
              </select>
            </div>
            {formData.dropoff.verificationStatus === 'verifying' ? (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Verifying address...</span>
              </div>
            ) : formData.dropoff.verificationStatus === 'verified' ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Address Verified</span>
                </div>
                <div className="text-xs text-gray-600 bg-green-50 p-2 rounded">
                  {formData.dropoff.verifiedAddress}
                </div>
              </div>
            ) : formData.dropoff.verificationStatus === 'error' ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Verification Failed</span>
                </div>
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {formData.dropoff.error}
                </div>
                {formData.dropoff.suggestions && formData.dropoff.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Did you mean:</p>
                    <div className="space-y-1">
                      {formData.dropoff.suggestions.map((suggestion: {display_name: string, place_id: string}, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionSelect('dropoff', suggestion)}
                          className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 border border-blue-200 rounded hover:border-blue-300 transition-colors"
                        >
                          {suggestion.display_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleVerifyAddress('dropoff')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-1 px-3 rounded text-sm transition-colors"
                >
                  TRY AGAIN
                </button>
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
