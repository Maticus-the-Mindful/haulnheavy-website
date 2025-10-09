'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import ImageUploadSection from './ImageUploadSection';

interface Step1EquipmentDetailsProps {
  category?: 'equipment' | 'freight';
  onNext: (data: any) => void;
  onClose: () => void;
  onBack?: () => void;
}

export default function Step1EquipmentDetails({ category = 'equipment', onNext, onClose, onBack }: Step1EquipmentDetailsProps) {
  const [formData, setFormData] = useState({
    year: category === 'equipment' ? '2019' : '',
    make: category === 'equipment' ? 'JOHN DEERE' : '',
    model: category === 'equipment' ? '310' : '',
    type: category === 'equipment' ? 'Grain Carts' : 'General Freight',
    quantity: 1,
    dimensions: {
      length: { feet: category === 'equipment' ? 11 : 0, inches: category === 'equipment' ? 8 : 0 },
      width: { feet: category === 'equipment' ? 10 : 0, inches: category === 'equipment' ? 7 : 0 },
      height: { feet: category === 'equipment' ? 9 : 0, inches: 0 }
    },
    weight: category === 'equipment' ? 4619 : 0,
    images: [] as File[]
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDimensionChange = (dimension: string, unit: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: {
          ...prev.dimensions[dimension as keyof typeof prev.dimensions],
          [unit]: value
        }
      }
    }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ backgroundColor: '#fcd001' }}>
          <h2 className="text-2xl font-semibold text-gray-900">
            {category === 'equipment' ? 'Equipment Details' : 'Freight Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Equipment/Freight Identification */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {category === 'equipment' 
                ? 'What are you shipping? Please enter the make and model of equipment:'
                : 'What are you shipping? Please provide details about your freight:'
              }
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 127 }, (_, i) => 2026 - i).map(year => (
                    <option key={year} value={year.toString()} className="text-gray-900">{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Can't find it in the list? Post it under{' '}
              <a href="#" className="text-blue-600 hover:underline">Freight</a>
            </p>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          {/* Load Dimensions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Load Dimensions</h3>
            <p className="text-sm text-gray-600 mb-4">
              These are base model specs. It is your responsibility to provide & confirm exact specs as the bids directly reflect your accurate information. Include additional attachments, weights, duals and misc. items in overall dimensions and weight.
            </p>
            
            {/* Visual Diagram */}
            <div className="flex justify-center mb-6">
              <img 
                src="/dimensions-image.png" 
                alt="Load Dimensions Diagram" 
                className="max-w-full h-auto"
              />
            </div>

            {/* Dimension Inputs */}
            <div className="space-y-4">
              {/* Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length (A) <span className="text-red-500">*</span>
                </label>
                 <div className="flex items-center space-x-2">
                   <input
                     type="number"
                     value={formData.dimensions.length.feet}
                     onChange={(e) => handleDimensionChange('length', 'feet', parseInt(e.target.value) || 0)}
                     className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     min="0"
                   />
                   <span className="text-sm text-gray-600">ft</span>
                   <input
                     type="number"
                     value={formData.dimensions.length.inches}
                     onChange={(e) => handleDimensionChange('length', 'inches', parseInt(e.target.value) || 0)}
                     className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     min="0"
                     max="11"
                   />
                   <span className="text-sm text-gray-600">In</span>
                 </div>
              </div>

              {/* Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (B) <span className="text-red-500">*</span>
                </label>
                 <div className="flex items-center space-x-2">
                   <input
                     type="number"
                     value={formData.dimensions.width.feet}
                     onChange={(e) => handleDimensionChange('width', 'feet', parseInt(e.target.value) || 0)}
                     className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     min="0"
                   />
                   <span className="text-sm text-gray-600">ft</span>
                   <input
                     type="number"
                     value={formData.dimensions.width.inches}
                     onChange={(e) => handleDimensionChange('width', 'inches', parseInt(e.target.value) || 0)}
                     className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     min="0"
                     max="11"
                   />
                   <span className="text-sm text-gray-600">In</span>
                 </div>
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (C) <span className="text-red-500">*</span>
                </label>
                 <div className="flex items-center space-x-2">
                   <input
                     type="number"
                     value={formData.dimensions.height.feet}
                     onChange={(e) => handleDimensionChange('height', 'feet', parseInt(e.target.value) || 0)}
                     className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     min="0"
                   />
                   <span className="text-sm text-gray-600">ft</span>
                   <input
                     type="number"
                     value={formData.dimensions.height.inches}
                     onChange={(e) => handleDimensionChange('height', 'inches', parseInt(e.target.value) || 0)}
                     className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     min="0"
                     max="11"
                   />
                   <span className="text-sm text-gray-600">In</span>
                 </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight <span className="text-red-500">*</span>
                </label>
                 <div className="flex items-center space-x-2">
                   <input
                     type="number"
                     value={formData.weight}
                     onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 0)}
                     className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     min="0"
                   />
                   <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-md">lbs</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <ImageUploadSection
            images={formData.images}
            onImagesChange={(images) => handleInputChange('images', images)}
          />

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
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
