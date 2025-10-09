'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import CalendarWidget from './CalendarWidget';

interface Step3DatesTimesProps {
  equipmentData: any;
  locationsData: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onClose: () => void;
}

export default function Step3DatesTimes({ equipmentData, locationsData, onNext, onBack, onClose }: Step3DatesTimesProps) {
  const [formData, setFormData] = useState({
    pickup: {
      dateType: 'on' as 'before' | 'between' | 'on' | 'after',
      specificDate: new Date(2025, 9, 17), // Oct 17, 2025
      dateRange: {
        start: new Date(),
        end: new Date()
      },
      timeType: 'between' as 'before' | 'between' | 'on' | 'after',
      specificTime: '02:00 PM',
      timeRange: {
        start: '02:00 PM',
        end: '03:00 PM'
      }
    },
    delivery: {
      dateType: 'on' as 'before' | 'between' | 'on' | 'after',
      specificDate: new Date(2025, 9, 28), // Oct 28, 2025
      dateRange: {
        start: new Date(),
        end: new Date()
      },
      timeType: 'between' as 'before' | 'between' | 'on' | 'after',
      specificTime: '03:00 PM',
      timeRange: {
        start: '03:00 PM',
        end: '05:00 PM'
      }
    }
  });

  const [activeCalendar, setActiveCalendar] = useState<'pickup' | 'delivery' | null>(null);
  const [activeDateField, setActiveDateField] = useState<'date' | 'range' | null>(null);

  const dateTypeOptions = [
    { value: 'before', label: 'Before' },
    { value: 'between', label: 'Between' },
    { value: 'on', label: 'On' },
    { value: 'after', label: 'After' }
  ];

  const timeTypeOptions = [
    { value: 'before', label: 'Before' },
    { value: 'between', label: 'Between' },
    { value: 'on', label: 'On' },
    { value: 'after', label: 'After' }
  ];

  const timeOptions = [
    '12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM',
    '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'
  ];

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateTypeChange = (location: 'pickup' | 'delivery', type: string) => {
    setFormData(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        dateType: type as any
      }
    }));
  };

  const handleTimeTypeChange = (location: 'pickup' | 'delivery', type: string) => {
    setFormData(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        timeType: type as any
      }
    }));
  };

  const handleDateSelect = (location: 'pickup' | 'delivery', date: Date) => {
    setFormData(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        specificDate: date
      }
    }));
    setActiveCalendar(null);
  };

  const handleTimeChange = (location: 'pickup' | 'delivery', field: 'specificTime' | 'start' | 'end', time: string) => {
    setFormData(prev => ({
      ...prev,
      [location]: {
        ...prev[location],
        ...(field === 'specificTime' 
          ? { specificTime: time }
          : {
              timeRange: {
                ...prev[location].timeRange,
                [field]: time
              }
            }
        )
      }
    }));
  };

  const handleNext = () => {
    const schedulingData = {
      scheduling: formData
    };
    onNext(schedulingData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ backgroundColor: '#fcd001' }}>
          <h2 className="text-2xl font-bold text-gray-900">Dates & Times</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Main Title */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Pick Up and Delivery Dates
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Pick Up Section */}
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-gray-700">Pick Up</h4>
              
              {/* Pick Up Date */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Pick Up Date:
                </label>
                <div className="flex space-x-2">
                  <select
                    value={formData.pickup.dateType}
                    onChange={(e) => handleDateTypeChange('pickup', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  >
                    {dateTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.pickup.dateType === 'on' && (
                  <div className="relative">
                    <input
                      type="text"
                      value={formatDate(formData.pickup.specificDate)}
                      readOnly
                      onClick={() => {
                        setActiveCalendar('pickup');
                        setActiveDateField('date');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer"
                      placeholder="Select Date"
                    />
                    {activeCalendar === 'pickup' && activeDateField === 'date' && (
                      <CalendarWidget
                        isOpen={true}
                        selectedDate={formData.pickup.specificDate}
                        onDateSelect={(date) => handleDateSelect('pickup', date)}
                        onClose={() => setActiveCalendar(null)}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Pick Up Time */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Pick Up Time:
                </label>
                <div className="flex space-x-2">
                  <select
                    value={formData.pickup.timeType}
                    onChange={(e) => handleTimeTypeChange('pickup', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  >
                    {timeTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.pickup.timeType === 'between' && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Pick Up Between:</label>
                    <div className="flex space-x-2">
                      <select
                        value={formData.pickup.timeRange.start}
                        onChange={(e) => handleTimeChange('pickup', 'start', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <select
                        value={formData.pickup.timeRange.end}
                        onChange={(e) => handleTimeChange('pickup', 'end', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Section */}
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-gray-700">Delivery</h4>
              
              {/* Delivery Date */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Delivery Date:
                </label>
                <div className="flex space-x-2">
                  <select
                    value={formData.delivery.dateType}
                    onChange={(e) => handleDateTypeChange('delivery', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  >
                    {dateTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.delivery.dateType === 'on' && (
                  <div className="relative">
                    <input
                      type="text"
                      value={formatDate(formData.delivery.specificDate)}
                      readOnly
                      onClick={() => {
                        setActiveCalendar('delivery');
                        setActiveDateField('date');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer"
                      placeholder="Select Date"
                    />
                    {activeCalendar === 'delivery' && activeDateField === 'date' && (
                      <CalendarWidget
                        isOpen={true}
                        selectedDate={formData.delivery.specificDate}
                        onDateSelect={(date) => handleDateSelect('delivery', date)}
                        onClose={() => setActiveCalendar(null)}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Time */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Delivery Time:
                </label>
                <div className="flex space-x-2">
                  <select
                    value={formData.delivery.timeType}
                    onChange={(e) => handleTimeTypeChange('delivery', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  >
                    {timeTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.delivery.timeType === 'between' && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Drop Off Between:</label>
                    <div className="flex space-x-2">
                      <select
                        value={formData.delivery.timeRange.start}
                        onChange={(e) => handleTimeChange('delivery', 'start', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <select
                        value={formData.delivery.timeRange.end}
                        onChange={(e) => handleTimeChange('delivery', 'end', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
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
