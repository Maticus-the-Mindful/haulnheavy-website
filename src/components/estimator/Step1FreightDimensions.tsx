'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import ImageUploadSection from './ImageUploadSection';

interface Step1FreightDimensionsProps {
  existingData?: any; // Existing freight data from previous visits
  onNext: (data: any) => void;
  onClose: () => void;
  onBack?: () => void;
}

export default function Step1FreightDimensions({ existingData, onNext, onClose, onBack }: Step1FreightDimensionsProps) {
  const [formData, setFormData] = useState({
    shippingItem: existingData?.shippingItem || '',
    quantity: existingData?.quantity || 1,
    length: {
      feet: existingData?.length?.feet || '',
      inches: existingData?.length?.inches || ''
    },
    width: {
      feet: existingData?.width?.feet || '',
      inches: existingData?.width?.inches || ''
    },
    height: {
      feet: existingData?.height?.feet || '',
      inches: existingData?.height?.inches || ''
    },
    weight: existingData?.weight || 0,
    hasHazmatPlacards: existingData?.hasHazmatPlacards !== undefined ? existingData.hasHazmatPlacards : null as boolean | null,
    transportationMethod: existingData?.transportationMethod !== undefined ? existingData.transportationMethod : 'hauled' as 'hauled' | 'towed' | 'driven',
    handlingInstructions: existingData?.handlingInstructions || '',
    images: existingData?.images || [] as File[]
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDimensionChange = (dimension: string, unit: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [dimension]: {
        ...prev[dimension as keyof typeof prev] as any,
        [unit]: value
      }
    }));
  };

  const handleNext = () => {
    // Temporarily disable validation for testing - keep asterisks for visual indication
    // if (!formData.shippingItem.trim()) {
    //   alert('Please enter what you are shipping');
    //   return;
    // }

    // if (!formData.length.feet && !formData.length.inches) {
    //   alert('Please enter length dimensions');
    //   return;
    // }

    // if (!formData.width.feet && !formData.width.inches) {
    //   alert('Please enter width dimensions');
    //   return;
    // }

    // if (!formData.height.feet && !formData.height.inches) {
    //   alert('Please enter height dimensions');
    //   return;
    // }

    // if (formData.weight <= 0) {
    //   alert('Please enter a valid weight');
    //   return;
    // }

    const dataToSubmit = {
      type: 'freight',
      shippingItem: formData.shippingItem,
      quantity: formData.quantity,
      dimensions: {
        length: {
          feet: parseInt(formData.length.feet) || 0,
          inches: parseInt(formData.length.inches) || 0
        },
        width: {
          feet: parseInt(formData.width.feet) || 0,
          inches: parseInt(formData.width.inches) || 0
        },
        height: {
          feet: parseInt(formData.height.feet) || 0,
          inches: parseInt(formData.height.inches) || 0
        }
      },
      weight: formData.weight,
      hasHazmatPlacards: formData.hasHazmatPlacards,
      transportationMethod: formData.transportationMethod,
      handlingInstructions: formData.handlingInstructions
    };

    onNext(dataToSubmit);
  };

  // Tooltip component
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
      {/* Header - Sticky */}
      <div className="p-6 border-b sticky top-0 z-10" style={{ backgroundColor: '#fcd001' }}>
          <h2 className="text-2xl font-bold text-gray-900">Freight Details</h2>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* What are you shipping? */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you shipping? <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.shippingItem}
              onChange={(e) => handleInputChange('shippingItem', e.target.value)}
              placeholder="Shipping item"
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              min="1"
              className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Load Dimensions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Load Dimensions</h3>
            
            {/* Dimensions Diagram */}
            <div className="mb-6 flex justify-center">
              <img
                src="/dimensions-image_oversized-freight.png"
                alt="Dimensions diagram"
                className="max-w-full h-auto"
              />
            </div>

            {/* Length (A) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length (A) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={formData.length.feet}
                  onChange={(e) => handleDimensionChange('length', 'feet', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-20 px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                />
                <span className="text-gray-600">ft</span>
                <input
                  type="number"
                  value={formData.length.inches}
                  onChange={(e) => handleDimensionChange('length', 'inches', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="11"
                  className="w-20 px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                />
                <span className="text-gray-600">in</span>
              </div>
            </div>

            {/* Width (B) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width (B) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={formData.width.feet}
                  onChange={(e) => handleDimensionChange('width', 'feet', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-20 px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                />
                <span className="text-gray-600">ft</span>
                <input
                  type="number"
                  value={formData.width.inches}
                  onChange={(e) => handleDimensionChange('width', 'inches', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="11"
                  className="w-20 px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                />
                <span className="text-gray-600">in</span>
              </div>
            </div>

            {/* Height (C) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (C) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={formData.height.feet}
                  onChange={(e) => handleDimensionChange('height', 'feet', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-20 px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                />
                <span className="text-gray-600">ft</span>
                <input
                  type="number"
                  value={formData.height.inches}
                  onChange={(e) => handleDimensionChange('height', 'inches', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="11"
                  className="w-20 px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                />
                <span className="text-gray-600">in</span>
              </div>
            </div>

            {/* Weight */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                />
                <span className="text-gray-600">lbs</span>
              </div>
            </div>
          </div>

          {/* Hazmat Placards */}
          <div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">
                Does this item have Hazmat Placards?
              </label>
              <Tooltip content="Hazmat placards indicate that the load may contain hazardous materials.">
                <HelpCircle className="w-4 h-4 text-blue-500" />
              </Tooltip>
            </div>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasHazmatPlacards"
                  checked={formData.hasHazmatPlacards === true}
                  onChange={() => handleInputChange('hasHazmatPlacards', true)}
                  className="mr-2 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-gray-700">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasHazmatPlacards"
                  checked={formData.hasHazmatPlacards === false}
                  onChange={() => handleInputChange('hasHazmatPlacards', false)}
                  className="mr-2 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Load Details/Handling Instructions */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Load Details/Handling Instructions
            </h3>
            <textarea
              value={formData.handlingInstructions}
              onChange={(e) => handleInputChange('handlingInstructions', e.target.value)}
              placeholder='Please enter information about the Load that may be helpful for the carrier to know prior to pick up. Example: "The equipment is at the end of a long driveway, and requires backing in."'
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Image Upload Section */}
          <ImageUploadSection
            images={formData.images}
            onImagesChange={(images) => handleInputChange('images', images)}
          />

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
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
