'use client';

import { useState } from 'react';
import { Upload, Info } from 'lucide-react';

interface Step4LoadCharacteristicsProps {
  equipmentData: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function Step4LoadCharacteristics({ equipmentData, onNext, onBack }: Step4LoadCharacteristicsProps) {
  const [formData, setFormData] = useState({
    hasHazmat: false,
    hasDuals: false,
    hasFrontWeights: false,
    hasAttachments: false,
    transportMethod: 'hauled' as 'hauled' | 'towed' | 'driven',
    willDisassemble: false,
    photos: [] as File[]
  });

  const handleRadioChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const handleNext = () => {
    const combinedData = {
      characteristics: formData
    };
    onNext(combinedData);
  };

  return (
    <div className="bg-white h-full w-full flex flex-col">
        <div className="p-6 space-y-6">
          {/* Weight Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <label className="text-sm font-medium text-gray-700">Weight *</label>
              <input
                type="text"
                value={equipmentData.weight.toLocaleString()}
                readOnly
                className="w-24 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-md">lbs</span>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={true}
                  className="mt-1 text-yellow-500 focus:ring-yellow-500"
                  readOnly
                />
                <span className="text-sm text-red-600">
                  I acknowledge that based on the dimensions entered, this load may be considered an oversized load for permitting.
                </span>
              </label>
              
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={true}
                  className="mt-1 text-yellow-500 focus:ring-yellow-500"
                  readOnly
                />
                <span className="text-sm text-red-600">
                  Please check the box to confirm the dimensions are correct.
                </span>
              </label>
            </div>
          </div>

          {/* Load Characteristics Questions */}
          <div className="space-y-6">
            {/* Hazmat Question */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Does this Item have Hazmat Placards?
                </label>
                <Info className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasHazmat"
                    checked={formData.hasHazmat === true}
                    onChange={() => handleRadioChange('hasHazmat', true)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasHazmat"
                    checked={formData.hasHazmat === false}
                    onChange={() => handleRadioChange('hasHazmat', false)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Duals Question */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Does this tractor have duals, triples or other wheel configurations that would require additional space on the trailer?
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasDuals"
                    checked={formData.hasDuals === true}
                    onChange={() => handleRadioChange('hasDuals', true)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasDuals"
                    checked={formData.hasDuals === false}
                    onChange={() => handleRadioChange('hasDuals', false)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Front Weights Question */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Does this tractor have front weights?
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasFrontWeights"
                    checked={formData.hasFrontWeights === true}
                    onChange={() => handleRadioChange('hasFrontWeights', true)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasFrontWeights"
                    checked={formData.hasFrontWeights === false}
                    onChange={() => handleRadioChange('hasFrontWeights', false)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Attachments Question */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Does this tractor have any additional attachments, like a loader, bucket or forks?
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasAttachments"
                    checked={formData.hasAttachments === true}
                    onChange={() => handleRadioChange('hasAttachments', true)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="hasAttachments"
                    checked={formData.hasAttachments === false}
                    onChange={() => handleRadioChange('hasAttachments', false)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Transportation Method */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <label className="text-sm font-medium text-gray-700">
                  How do you want your item transported?
                </label>
                <Info className="w-4 h-4 text-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="transportMethod"
                    checked={formData.transportMethod === 'hauled'}
                    onChange={() => handleRadioChange('transportMethod', 'hauled')}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Hauled</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="transportMethod"
                    checked={formData.transportMethod === 'towed'}
                    onChange={() => handleRadioChange('transportMethod', 'towed')}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Towed/Power Only</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="transportMethod"
                    checked={formData.transportMethod === 'driven'}
                    onChange={() => handleRadioChange('transportMethod', 'driven')}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Driven Away</span>
                </label>
              </div>
            </div>

            {/* Disassembly Question */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Will this item be disassembled at the pickup location?
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="willDisassemble"
                    checked={formData.willDisassemble === true}
                    onChange={() => handleRadioChange('willDisassemble', true)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="willDisassemble"
                    checked={formData.willDisassemble === false}
                    onChange={() => handleRadioChange('willDisassemble', false)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pictures of your load</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-blue-500" />
                  <span className="text-sm text-gray-600">Upload</span>
                </label>
              </div>
              {formData.photos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Uploaded files:</p>
                  <ul className="space-y-1">
                    {formData.photos.map((file, index) => (
                      <li key={index} className="text-sm text-gray-500">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

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
  );
}
