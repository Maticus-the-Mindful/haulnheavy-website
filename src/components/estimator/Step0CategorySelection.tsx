'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { CategoryType } from '@/types/estimator';

interface Step0CategorySelectionProps {
  onNext: (category: CategoryType) => void;
  onClose: () => void;
}

export default function Step0CategorySelection({ onNext, onClose }: Step0CategorySelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);

  const categories = [
    {
      id: 'equipment' as CategoryType,
      name: 'Equipment & Machinery',
      icon: (
        <img 
          src="/tractor-icon-01.png" 
          alt="Tractor" 
          className="w-16 h-16 mx-auto mb-4"
        />
      ),
      description: 'Heavy equipment, tractors, machinery, and construction vehicles'
    },
    {
      id: 'freight' as CategoryType,
      name: 'Freight',
      icon: (
        <img 
          src="/truck-icon-01.png" 
          alt="Truck" 
          className="w-16 h-16 mx-auto mb-4"
        />
      ),
      description: 'General cargo, pallets, crates, and packaged goods'
    }
  ];

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
  };

  const handleNext = () => {
    if (selectedCategory) {
      onNext(selectedCategory);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ backgroundColor: '#fcd001' }}>
          <h2 className="text-2xl font-bold text-gray-900">Category</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          {/* Category Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`
                  cursor-pointer transition-all duration-200 border-2 rounded-lg p-6 text-center
                  ${selectedCategory === category.id
                    ? 'border-yellow-500 bg-yellow-50 shadow-lg transform scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                <div className="text-gray-800">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleNext}
              disabled={!selectedCategory}
              className={`
                px-8 py-3 rounded-lg font-semibold text-lg transition-colors
                ${selectedCategory
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
