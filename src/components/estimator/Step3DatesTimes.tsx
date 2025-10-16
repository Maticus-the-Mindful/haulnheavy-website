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
      dateType: '' as '' | 'before' | 'between' | 'on' | 'after',
      specificDate: new Date(),
      dateRange: {
        start: new Date(),
        end: new Date()
      },
      timeType: '' as '' | 'before' | 'between' | 'at' | 'after',
      specificTime: '',
      timeRange: {
        start: '',
        end: ''
      }
    },
    delivery: {
      dateType: '' as '' | 'before' | 'between' | 'on' | 'after',
      specificDate: new Date(),
      dateRange: {
        start: new Date(),
        end: new Date()
      },
      timeType: '' as '' | 'before' | 'between' | 'at' | 'after',
      specificTime: '',
      timeRange: {
        start: '',
        end: ''
      }
    },
    contactInfo: {
      isContactAtPickup: null as boolean | null,
      pickupContactName: '',
      pickupContactPhone: '',
      isContactAtDropoff: null as boolean | null,
      dropoffContactName: '',
      dropoffContactPhone: ''
    }
  });

  const [activeCalendar, setActiveCalendar] = useState<'pickup' | 'delivery' | null>(null);
  const [activeDateField, setActiveDateField] = useState<'date' | 'range' | null>(null);
  const [activeRangeField, setActiveRangeField] = useState<'start' | 'end' | null>(null);

  const dateTypeOptions = [
    { value: '', label: 'Select Option' },
    { value: 'before', label: 'Before' },
    { value: 'between', label: 'Between' },
    { value: 'on', label: 'On' },
    { value: 'after', label: 'After' }
  ];

  const timeTypeOptions = [
    { value: '', label: 'Select Time' },
    { value: 'before', label: 'Before' },
    { value: 'between', label: 'Between' },
    { value: 'at', label: 'At' },
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
        ...(activeDateField === 'date' 
          ? { specificDate: date }
          : {
              dateRange: {
                ...prev[location].dateRange,
                [activeRangeField === 'start' ? 'start' : 'end']: date
              }
            }
        )
      }
    }));
    setActiveCalendar(null);
    setActiveDateField(null);
    setActiveRangeField(null);
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

  const handleContactChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
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

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Pick Up Section */}
            <div className="space-y-6">
              {/* Pick Up Date */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Pick Up Date:
                </label>
                <select
                  value={formData.pickup.dateType}
                  onChange={(e) => handleDateTypeChange('pickup', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                >
                  {dateTypeOptions.map(option => (
                    <option key={option.value} value={option.value} className="text-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {/* Conditional date fields based on selection */}
                {(formData.pickup.dateType === 'on' || formData.pickup.dateType === 'before' || formData.pickup.dateType === 'after') && (
                  <div className="relative">
                    <input
                      type="text"
                      value={formatDate(formData.pickup.specificDate)}
                      readOnly
                      onClick={() => {
                        setActiveCalendar('pickup');
                        setActiveDateField('date');
                      }}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer text-gray-900"
                      placeholder="Date"
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

                {formData.pickup.dateType === 'between' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={formatDate(formData.pickup.dateRange.start)}
                        readOnly
                        onClick={() => {
                          console.log('Pickup start date clicked');
                          setActiveCalendar('pickup');
                          setActiveDateField('range');
                          setActiveRangeField('start');
                        }}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer text-gray-900"
                        placeholder="From"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={formatDate(formData.pickup.dateRange.end)}
                        readOnly
                        onClick={() => {
                          console.log('Pickup end date clicked');
                          setActiveCalendar('pickup');
                          setActiveDateField('range');
                          setActiveRangeField('end');
                        }}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer text-gray-900"
                        placeholder="To"
                      />
                    </div>
                    {activeCalendar === 'pickup' && activeDateField === 'range' && (
                      <>
                        {console.log('Rendering pickup calendar:', { activeCalendar, activeDateField, activeRangeField })}
                        <CalendarWidget
                          isOpen={true}
                          selectedDate={activeRangeField === 'start' ? formData.pickup.dateRange.start : formData.pickup.dateRange.end}
                          onDateSelect={(date) => handleDateSelect('pickup', date)}
                          onClose={() => {
                            setActiveCalendar(null);
                            setActiveDateField(null);
                            setActiveRangeField(null);
                          }}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Pick Up Time */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Pick Up Time:
                </label>
                <select
                  value={formData.pickup.timeType}
                  onChange={(e) => handleTimeTypeChange('pickup', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                >
                  {timeTypeOptions.map(option => (
                    <option key={option.value} value={option.value} className="text-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {/* Conditional time fields based on selection */}
                {(formData.pickup.timeType === 'at' || formData.pickup.timeType === 'before' || formData.pickup.timeType === 'after') && (
                  <div>
                    <select
                      value={formData.pickup.specificTime}
                      onChange={(e) => handleTimeChange('pickup', 'specificTime', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                    >
                      <option value="" className="text-gray-900">Select Time</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time} className="text-gray-900">
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.pickup.timeType === 'between' && (
                  <div className="space-y-3">
                    <select
                      value={formData.pickup.timeRange.start}
                      onChange={(e) => handleTimeChange('pickup', 'start', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                    >
                      <option value="" className="text-gray-900">From</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time} className="text-gray-900">
                          {time}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData.pickup.timeRange.end}
                      onChange={(e) => handleTimeChange('pickup', 'end', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                    >
                      <option value="" className="text-gray-900">To</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time} className="text-gray-900">
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Section */}
            <div className="space-y-6">
              {/* Delivery Date */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Delivery Date:
                </label>
                <select
                  value={formData.delivery.dateType}
                  onChange={(e) => handleDateTypeChange('delivery', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                >
                  {dateTypeOptions.map(option => (
                    <option key={option.value} value={option.value} className="text-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {/* Conditional date fields based on selection */}
                {(formData.delivery.dateType === 'on' || formData.delivery.dateType === 'before' || formData.delivery.dateType === 'after') && (
                  <div className="relative">
                    <input
                      type="text"
                      value={formatDate(formData.delivery.specificDate)}
                      readOnly
                      onClick={() => {
                        setActiveCalendar('delivery');
                        setActiveDateField('date');
                      }}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer text-gray-900"
                      placeholder="Date"
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

                {formData.delivery.dateType === 'between' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={formatDate(formData.delivery.dateRange.start)}
                        readOnly
                        onClick={() => {
                          console.log('Delivery start date clicked');
                          setActiveCalendar('delivery');
                          setActiveDateField('range');
                          setActiveRangeField('start');
                        }}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer text-gray-900"
                        placeholder="From"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={formatDate(formData.delivery.dateRange.end)}
                        readOnly
                        onClick={() => {
                          setActiveCalendar('delivery');
                          setActiveDateField('range');
                          setActiveRangeField('end');
                        }}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer text-gray-900"
                        placeholder="To"
                      />
                    </div>
                    {activeCalendar === 'delivery' && activeDateField === 'range' && (
                      <>
                        {console.log('Rendering delivery calendar:', { activeCalendar, activeDateField, activeRangeField })}
                        <CalendarWidget
                          isOpen={true}
                          selectedDate={activeRangeField === 'start' ? formData.delivery.dateRange.start : formData.delivery.dateRange.end}
                          onDateSelect={(date) => handleDateSelect('delivery', date)}
                          onClose={() => {
                            setActiveCalendar(null);
                            setActiveDateField(null);
                            setActiveRangeField(null);
                          }}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Time */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Delivery Time:
                </label>
                <select
                  value={formData.delivery.timeType}
                  onChange={(e) => handleTimeTypeChange('delivery', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                >
                  {timeTypeOptions.map(option => (
                    <option key={option.value} value={option.value} className="text-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {/* Conditional time fields based on selection */}
                {(formData.delivery.timeType === 'at' || formData.delivery.timeType === 'before' || formData.delivery.timeType === 'after') && (
                  <div>
                    <select
                      value={formData.delivery.specificTime}
                      onChange={(e) => handleTimeChange('delivery', 'specificTime', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                    >
                      <option value="" className="text-gray-900">Select Time</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time} className="text-gray-900">
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.delivery.timeType === 'between' && (
                  <div className="space-y-3">
                    <select
                      value={formData.delivery.timeRange.start}
                      onChange={(e) => handleTimeChange('delivery', 'start', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                    >
                      <option value="" className="text-gray-900">From</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time} className="text-gray-900">
                          {time}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData.delivery.timeRange.end}
                      onChange={(e) => handleTimeChange('delivery', 'end', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                    >
                      <option value="" className="text-gray-900">To</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time} className="text-gray-900">
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pickup Contact */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-700">Pickup Contact</h4>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Are you the point of contact at the pickup location?
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="isContactAtPickup"
                        checked={formData.contactInfo.isContactAtPickup === true}
                        onChange={() => handleContactChange('isContactAtPickup', true)}
                        className="text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="isContactAtPickup"
                        checked={formData.contactInfo.isContactAtPickup === false}
                        onChange={() => handleContactChange('isContactAtPickup', false)}
                        className="text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                {/* Conditional fields for pickup contact */}
                {formData.contactInfo.isContactAtPickup === false && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo.pickupContactName}
                        onChange={(e) => handleContactChange('pickupContactName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.contactInfo.pickupContactPhone}
                        onChange={(e) => handleContactChange('pickupContactPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dropoff Contact */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-700">Dropoff Contact</h4>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Are you the point of contact at the drop off location?
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="isContactAtDropoff"
                        checked={formData.contactInfo.isContactAtDropoff === true}
                        onChange={() => handleContactChange('isContactAtDropoff', true)}
                        className="text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="isContactAtDropoff"
                        checked={formData.contactInfo.isContactAtDropoff === false}
                        onChange={() => handleContactChange('isContactAtDropoff', false)}
                        className="text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                {/* Conditional fields for dropoff contact */}
                {formData.contactInfo.isContactAtDropoff === false && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo.dropoffContactName}
                        onChange={(e) => handleContactChange('dropoffContactName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.contactInfo.dropoffContactPhone}
                        onChange={(e) => handleContactChange('dropoffContactPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                        placeholder="(555) 123-4567"
                      />
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
