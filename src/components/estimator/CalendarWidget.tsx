'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarWidgetProps {
  isOpen: boolean;
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  minDate?: Date; // Minimum selectable date
  maxDate?: Date; // Maximum selectable date
}

export default function CalendarWidget({ isOpen, selectedDate, onDateSelect, onClose, minDate, maxDate }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  if (!isOpen) return null;

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setFullYear(prev.getFullYear() - 1);
      } else {
        newDate.setFullYear(prev.getFullYear() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is in the past
    if (date < today) return false;
    
    // Check if date is before minDate
    if (minDate) {
      const minDateCopy = new Date(minDate);
      minDateCopy.setHours(0, 0, 0, 0);
      if (date < minDateCopy) return false;
    }
    
    // Check if date is after maxDate
    if (maxDate) {
      const maxDateCopy = new Date(maxDate);
      maxDateCopy.setHours(0, 0, 0, 0);
      if (date > maxDateCopy) return false;
    }
    
    return true;
  };

  const isDateSelected = (date: Date) => {
    return selectedDate && 
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    if (isDateSelectable(date)) {
      onDateSelect(date);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push(
        <div key={`prev-${day}`} className="text-gray-300 text-center py-2">
          {day}
        </div>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelectable = isDateSelectable(date);
      const isSelected = isDateSelected(date);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={!isSelectable}
          className={`
            text-center py-2 rounded-full transition-colors
            ${!isSelectable 
              ? 'text-gray-300 cursor-not-allowed' 
              : isSelected
                ? 'bg-yellow-500 text-black font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          {day}
        </button>
      );
    }
    
    // Next month's leading days
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="text-gray-300 text-center py-2">
          {day}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateYear('prev')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
            <ChevronLeft className="w-4 h-4 -ml-2" />
          </button>
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        
        <div className="font-semibold text-gray-900">
          {monthNames[month]} {year}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateYear('next')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
            <ChevronRight className="w-4 h-4 -ml-2" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      {/* Today Button */}
      <div className="mt-4 text-center">
        <button
          onClick={goToToday}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Today
        </button>
      </div>
    </div>
  );
}
