'use client';

import { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';
import ImageUploadSection from './ImageUploadSection';
import { 
  loadEquipmentData,
  getModelsByManufacturer,
  getModelById,
  validateYear,
  type ManufacturerData,
  type ModelData
} from '@/lib/equipment-data';

interface Step1EquipmentDetailsProps {
  category?: 'equipment' | 'freight';
  onNext: (data: any) => void;
  onClose: () => void;
  onBack?: () => void;
  onSwitchToFreight?: () => void;
}

export default function Step1EquipmentDetails({ category = 'equipment', onNext, onClose, onBack, onSwitchToFreight }: Step1EquipmentDetailsProps) {
  
  // Form data state
  const [formData, setFormData] = useState({
    year: '',
    make: category === 'equipment' ? '' : '',
    model: category === 'equipment' ? '' : '',
    customModel: '',
    type: category === 'equipment' ? 'Grain Carts' : 'General Freight',
    quantity: 1,
    dimensions: {
      length: { feet: category === 'equipment' ? 0 : 0, inches: 0 },
      width: { feet: category === 'equipment' ? 0 : 0, inches: 0 },
      height: { feet: category === 'equipment' ? 0 : 0, inches: 0 }
    },
    weight: category === 'equipment' ? 0 : 0,
    hasHazmatPlacards: null as boolean | null,
    transportationMethod: null as 'hauled' | 'towed' | 'driven' | null,
    images: [] as File[]
  });

  // Equipment data state
  const [availableManufacturers, setAvailableManufacturers] = useState<ManufacturerData[]>([]);
  const [availableModels, setAvailableModels] = useState<ModelData[]>([]);
  const [allModels, setAllModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Load all manufacturers on mount
  useEffect(() => {
    loadAllManufacturers();
  }, []);

  // Load models when manufacturer changes
  useEffect(() => {
    if (formData.make) {
      loadModelsByMake(formData.make);
    } else {
      setAvailableModels([]);
    }
  }, [formData.make]);


  const loadAllManufacturers = async () => {
    try {
      setLoading(true);
      console.log('Loading manufacturers from Supabase...');
      
      const manufacturers = await getAllManufacturers();
      console.log('Loaded manufacturers:', manufacturers.length);
      setAvailableManufacturers(manufacturers);
    } catch (err) {
      setError('Failed to load manufacturers');
      console.error('Error loading manufacturers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadModelsByMake = async (manufacturerId: string) => {
    try {
      setLoading(true);
      console.log('Loading models for:', manufacturerId);
      
      const models = await getModelsByManufacturer(manufacturerId);
      console.log('Loaded models:', models.length);
      setAvailableModels(models);
    } catch (err) {
      setError('Failed to load models');
      console.error('Error loading models:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  // Handle make change - reset model
  const handleMakeChange = (makeId: string) => {
    setFormData(prev => ({
      ...prev,
      make: makeId,
      model: '',
      dimensions: {
        length: { feet: 0, inches: 0 },
        width: { feet: 0, inches: 0 },
        height: { feet: 0, inches: 0 }
      },
      weight: 0
    }));
  };

  // Handle model change - auto-populate dimensions and weight
  const handleModelChange = (modelId: string) => {
    if (!formData.make) return;
    
    const selectedModel = availableModels.find(model => model.model_id === modelId);
    
    if (selectedModel && 
        selectedModel.typical_weight_lbs !== undefined && 
        selectedModel.typical_length_ft !== undefined && 
        selectedModel.typical_width_ft !== undefined && 
        selectedModel.typical_height_ft !== undefined) {
      // Convert decimal feet to feet and inches
      const convertToFeetAndInches = (decimalFeet: number) => ({
        feet: Math.floor(decimalFeet),
        inches: Math.round((decimalFeet % 1) * 12)
      });
      
      setFormData(prev => ({
        ...prev,
        model: modelId,
        dimensions: {
          length: convertToFeetAndInches(selectedModel.typical_length_ft!),
          width: convertToFeetAndInches(selectedModel.typical_width_ft!),
          height: convertToFeetAndInches(selectedModel.typical_height_ft!)
        },
        weight: selectedModel.typical_weight_lbs!
      }));
      
      // Show year range info if available
      if (selectedModel.year_range) {
        console.log(`Model ${selectedModel.name} year range: ${selectedModel.year_range}`);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        model: modelId
      }));
    }
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

  const handleRadioChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    // Use custom model name if custom is selected
    const finalModel = formData.model === 'custom' ? formData.customModel : formData.model;
    
    const dataToSubmit = {
      ...formData,
      model: finalModel,
      type: 'equipment' // Ensure type is set correctly
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
          className="cursor-help"
        >
          {children}
        </div>
        {isVisible && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-black text-white text-sm rounded-lg shadow-lg z-10 w-80 max-w-none">
            <div className="relative">
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
              {content}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Sticky */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg" style={{ backgroundColor: '#fcd001' }}>
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

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Equipment/Freight Identification */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {category === 'equipment' 
                ? 'What are you shipping? Please enter the make and model of equipment:'
                : 'What are you shipping? Please provide details about your freight:'
              }
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 127 }, (_, i) => 2026 - i).map(year => (
                    <option key={year} value={year.toString()} className="text-gray-900">{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <select
                  value={formData.make}
                  onChange={(e) => handleMakeChange(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  disabled={loading}
                >
                  <option value="">Select Make</option>
                  {availableManufacturers.length > 0 ? (
                    availableManufacturers.map(make => (
                      <option key={make.manufacturer_id} value={make.manufacturer_id} className="text-gray-900">
                        {make.name}
                      </option>
                    ))
                  ) : (
                    <option disabled className="text-gray-500">Loading manufacturers...</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <select
                  value={formData.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  disabled={!formData.make || loading}
                >
                  <option value="">Select Model</option>
                  {availableModels.map(model => (
                    <option key={model.model_id} value={model.model_id} className="text-gray-900">
                      {model.name}
                    </option>
                  ))}
                  <option value="custom" className="text-gray-900">Custom Model</option>
                </select>
              </div>
            </div>
            
            {/* Custom Model Input - shown when "Custom Model" is selected */}
            {formData.model === 'custom' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Model Name</label>
                <input
                  type="text"
                  value={formData.customModel}
                  onChange={(e) => handleInputChange('customModel', e.target.value)}
                  placeholder="Enter model name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <p className="text-sm text-gray-600 mt-2">
              Can&apos;t find it in the list? Post it under{' '}
              <button 
                onClick={onSwitchToFreight}
                className="text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Freight
              </button>
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

          {/* Hazmat Placards Question */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                Does this item have Hazmat Placards?
              </label>
              <Tooltip content="Hazmat placards indicate that the load may contain hazardous materials.">
                <HelpCircle className="w-4 h-4 text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="hasHazmatPlacards"
                  checked={formData.hasHazmatPlacards === true}
                  onChange={() => handleRadioChange('hasHazmatPlacards', true)}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="hasHazmatPlacards"
                  checked={formData.hasHazmatPlacards === false}
                  onChange={() => handleRadioChange('hasHazmatPlacards', false)}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Transportation Method Question */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                How do you want your item transported?
              </label>
              <Tooltip content="Hauled: The load will be put on a trailer and pulled behind a semi. Towed/Power Only: The truck and driver will transport the load by pulling it behind the truck. This is typically used for trailers. Driven Away: A driver will drive the load to its destination. This is typically used for RVs and Trucks.">
                <HelpCircle className="w-4 h-4 text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="transportationMethod"
                  checked={formData.transportationMethod === 'hauled'}
                  onChange={() => handleRadioChange('transportationMethod', 'hauled')}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">Hauled</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="transportationMethod"
                  checked={formData.transportationMethod === 'towed'}
                  onChange={() => handleRadioChange('transportationMethod', 'towed')}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">Towed/Power Only</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="transportationMethod"
                  checked={formData.transportationMethod === 'driven'}
                  onChange={() => handleRadioChange('transportationMethod', 'driven')}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">Driven Away</span>
              </label>
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
