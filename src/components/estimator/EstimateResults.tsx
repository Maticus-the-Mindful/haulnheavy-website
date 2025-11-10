'use client';

import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { EstimateResult } from '@/types/estimator';

interface EstimateResultsProps {
  estimate: EstimateResult;
  estimateData: any; // The full estimate data including form inputs
  completeData?: any; // Complete estimate data with images and metadata
  contactInfo: any; // Contact information from Step5
  onClose: () => void;
  onNewEstimate: () => void;
  onBack?: () => void;
}

export default function EstimateResults({ estimate, estimateData, completeData, contactInfo, onClose, onNewEstimate, onBack }: EstimateResultsProps) {
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [sharingType] = useState<'email'>('email');
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  const handleSendEstimate = async () => {
    setIsSending(true);
    setEmailError('');

    try {
      const estimateDataToSend = completeData || estimateData;
      
      // Debug logging
      console.log('=== FRONTEND DEBUG ===');
      console.log('completeData:', completeData);
      console.log('estimateData:', estimateData);
      console.log('estimateDataToSend:', estimateDataToSend);
      console.log('contactInfo.email:', contactInfo.email);
      console.log('senderName:', `${contactInfo.firstName} ${contactInfo.lastName}`);
      console.log('sharingType:', sharingType);
      console.log('======================');
      
      // Ensure we have estimate data
      if (!estimateDataToSend) {
        throw new Error('No estimate data available. Please go back and complete the estimate first.');
      }
      
      // Ensure we have the complete estimate data with result
      const finalEstimateData = {
        ...estimateDataToSend,
        estimateResult: estimate // Add the estimate result to the data
      };
      
      const requestData = {
        estimateData: finalEstimateData,
        recipientEmail: contactInfo.email,
        senderName: `${contactInfo.firstName} ${contactInfo.lastName}`,
        senderEmail: contactInfo.email,
        message: `Company: ${contactInfo.company}\nPhone: ${contactInfo.phone}`,
        shareType: sharingType || 'email'
      };
      
      console.log('Request data:', requestData);
      
      const response = await fetch('/api/send-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setEmailSent(true);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email send error:', error);
      setEmailError(error instanceof Error ? error.message : 'Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };


  return (
    <div className="bg-white w-full min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 border-b" style={{ backgroundColor: '#fcd001' }}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Estimate</h2>
            <p className="text-gray-600">Hauln&apos; Heavy Transport Services</p>
          </div>
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

          {/* Send Estimate Section */}
          {!emailSent ? (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Contact Information</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Name:</strong> {contactInfo.firstName} {contactInfo.lastName}</p>
                  {contactInfo.company && <p><strong>Company:</strong> {contactInfo.company}</p>}
                  <p><strong>Email:</strong> {contactInfo.email}</p>
                  <p><strong>Phone:</strong> {contactInfo.phone}</p>
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
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Estimate Sent!</h3>
              <p className="text-gray-600">
                Your estimate has been sent to <strong>{contactInfo.email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                We&apos;ve also sent the details to our team. Someone will contact you shortly.
              </p>
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
  );
}
