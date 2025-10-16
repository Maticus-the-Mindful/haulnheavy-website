'use client';

import { useState } from 'react';
import { X, Download, Share2, Mail, CheckCircle } from 'lucide-react';
import { EstimateResult } from '@/types/estimator';

interface EstimateResultsProps {
  estimate: EstimateResult;
  estimateData: any; // The full estimate data including form inputs
  completeData?: any; // Complete estimate data with images and metadata
  onClose: () => void;
  onNewEstimate: () => void;
  onBack?: () => void;
}

export default function EstimateResults({ estimate, estimateData, completeData, onClose, onNewEstimate, onBack }: EstimateResultsProps) {
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [sharingType, setSharingType] = useState<'email' | 'pdf' | 'share' | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfoSubmitted, setContactInfoSubmitted] = useState(false);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  const handleSendEstimate = async () => {
    if (!contactInfo.firstName.trim()) {
      setEmailError('Please enter your first name');
      return;
    }

    if (!contactInfo.lastName.trim()) {
      setEmailError('Please enter your last name');
      return;
    }

    if (!contactInfo.email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!contactInfo.email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!contactInfo.phone.trim()) {
      setEmailError('Please enter your phone number');
      return;
    }

    setIsSending(true);
    setEmailError('');

    try {
      const estimateDataToSend = completeData || estimateData;
      
      const response = await fetch('/api/send-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estimateData: estimateDataToSend,
          recipientEmail: contactInfo.email,
          senderName: `${contactInfo.firstName} ${contactInfo.lastName}`,
          senderEmail: contactInfo.email,
          message: `Company: ${contactInfo.company}\nPhone: ${contactInfo.phone}`,
          shareType: sharingType || 'email'
        }),
      });

      if (response.ok) {
        setEmailSent(true);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      setEmailError('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ backgroundColor: '#fcd001' }}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Estimate</h2>
            <p className="text-gray-600">Hauln&apos; Heavy Transport Services</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Total Estimate Highlight */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">Total Estimated Cost</p>
              <p className="text-4xl font-bold text-yellow-600">
                {formatCurrency(estimate.totalEstimate)}
              </p>
              <p className="text-sm text-gray-500 mt-2">*Estimate valid for 7 days</p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Base Transport Cost</span>
                <span className="font-medium text-gray-900">{formatCurrency(estimate.baseCost)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Fuel Surcharge</span>
                <span className="font-medium text-gray-900">{formatCurrency(estimate.fuelSurcharge)}</span>
              </div>
              
              {estimate.oversizeFee > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Oversize Load Fee</span>
                  <span className="font-medium text-gray-900">{formatCurrency(estimate.oversizeFee)}</span>
                </div>
              )}
              
              {estimate.hazmatFee > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Hazmat Fee</span>
                  <span className="font-medium text-gray-900">{formatCurrency(estimate.hazmatFee)}</span>
                </div>
              )}
              
              {estimate.additionalFees > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Additional Fees</span>
                  <span className="font-medium text-gray-900">{formatCurrency(estimate.additionalFees)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total Estimate</span>
                <span className="text-lg font-bold text-yellow-600">
                  {formatCurrency(estimate.totalEstimate)}
                </span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border-2" style={{ borderColor: '#fcd001' }}>
            <h4 className="font-semibold text-gray-900 mb-2">Important Disclaimer</h4>
            <p className="text-sm text-gray-600">{estimate.disclaimer}</p>
          </div>

          {/* Contact Information Section */}
          {!emailSent ? (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Get Your Estimate by Email</h3>
              <div className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactInfo.firstName}
                      onChange={(e) => handleContactInfoChange('firstName', e.target.value)}
                      placeholder="John"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactInfo.lastName}
                      onChange={(e) => handleContactInfoChange('lastName', e.target.value)}
                      placeholder="Smith"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => handleContactInfoChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                {/* Company and Phone Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={contactInfo.company}
                      onChange={(e) => handleContactInfoChange('company', e.target.value)}
                      placeholder="Your Company"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {emailError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{emailError}</p>
                  </div>
                )}

                <button
                  onClick={handleSendEstimate}
                  disabled={isSending}
                  className="w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors uppercase tracking-wide"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Estimate by Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Estimate Sent!</h3>
              <p className="text-gray-600">
                Your estimate has been sent to <strong>{contactInfo.email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                We've also sent the details to our team. Someone will contact you shortly.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!emailSent && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  // Check if contact info is complete
                  if (!contactInfo.firstName.trim() || !contactInfo.lastName.trim() || !contactInfo.email.trim() || !contactInfo.phone.trim()) {
                    setEmailError('Please fill in all required contact information above before downloading PDF');
                    return;
                  }
                  setSharingType('pdf');
                  handleSendEstimate();
                }}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              
              <button
                onClick={() => {
                  // Check if contact info is complete
                  if (!contactInfo.firstName.trim() || !contactInfo.lastName.trim() || !contactInfo.email.trim() || !contactInfo.phone.trim()) {
                    setEmailError('Please fill in all required contact information above before sharing');
                    return;
                  }
                  setSharingType('share');
                  handleSendEstimate();
                }}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Estimate</span>
              </button>
            </div>
          )}


          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Edit
                </button>
              )}
              
              <button
                onClick={onNewEstimate}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors uppercase tracking-wide"
              >
                New Estimate
              </button>
              
              <button
                onClick={onClose}
                className="border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
