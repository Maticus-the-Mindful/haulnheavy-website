'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Phone, MessageSquare, Info } from 'lucide-react';
import { PopupButton } from 'react-calendly';
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
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [smsError, setSmsError] = useState('');
  const [sharingType] = useState<'email'>('email');
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [showSmsTooltip, setShowSmsTooltip] = useState(false);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  const handleSendEstimate = async () => {
    setIsSendingEmail(true);
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
      setIsSendingEmail(false);
    }
  };

  const handleSendSMS = async () => {
    setIsSendingSMS(true);
    setSmsError('');

    try {
      const estimateDataToSend = completeData || estimateData;

      if (!estimateDataToSend) {
        throw new Error('No estimate data available.');
      }

      const finalEstimateData = {
        ...estimateDataToSend,
        estimateResult: estimate
      };

      const requestData = {
        estimateData: finalEstimateData,
        recipientPhone: contactInfo.phone,
        recipientName: `${contactInfo.firstName} ${contactInfo.lastName}`
      };

      const response = await fetch('/api/send-estimate-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setSmsSent(true);
      } else {
        const errorData = await response.json();
        console.error('SMS API Error:', errorData);
        throw new Error(errorData.error || 'Failed to send text message');
      }
    } catch (error) {
      console.error('SMS send error:', error);
      setSmsError(error instanceof Error ? error.message : 'Failed to send text message. Please try again.');
    } finally {
      setIsSendingSMS(false);
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
              <p className="text-lg text-gray-600 mb-2">Estimated Cost</p>
              <p className="text-4xl font-bold text-yellow-600">
                {formatCurrency(estimate.totalEstimate)}
              </p>
              <p className="text-sm text-gray-500 mt-2">*Additional fees may apply</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border-2" style={{ borderColor: '#fcd001' }}>
            <h4 className="font-semibold text-gray-900 mb-2">Important Disclaimer</h4>
            <p className="text-sm text-gray-600">{estimate.disclaimer}</p>
          </div>

          {/* Contact Information and Action Section */}
          {!emailSent && !smsSent ? (
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

              {/* Next Steps Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  To lock in an exact quote, pick what works best for you below
                </h3>
                <div className="space-y-3 max-w-xs mx-auto">
                  {/* Call Now Button */}
                  <a
                    href="tel:8555520961"
                    className="w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors uppercase tracking-wide"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Now</span>
                  </a>

                  {/* Schedule a Call Button */}
                  <PopupButton
                    url="https://calendly.com/evan-price-1/haul-n-heavy-quote"
                    rootElement={document.body}
                    text="Schedule a Call"
                    className="w-full flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors uppercase tracking-wide"
                    prefill={{
                      name: `${contactInfo.firstName} ${contactInfo.lastName}`,
                      email: contactInfo.email
                    }}
                  />

                  {/* Send Estimate by Text Button */}
                  <button
                    onClick={handleSendSMS}
                    disabled={isSendingSMS || !smsOptIn}
                    className={`w-full flex items-center justify-center space-x-2 text-white font-semibold py-3 px-4 rounded-lg transition-colors uppercase tracking-wide ${
                      smsOptIn
                        ? 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSendingSMS ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>Text Estimate</span>
                      </>
                    )}
                  </button>

                  {/* Send Estimate by Email Button */}
                  <button
                    onClick={handleSendEstimate}
                    disabled={isSendingEmail}
                    className="w-full flex items-center justify-center space-x-2 bg-orange-700 hover:bg-orange-800 disabled:bg-orange-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors uppercase tracking-wide"
                  >
                    {isSendingEmail ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Email Estimate</span>
                      </>
                    )}
                  </button>
                </div>

                {/* SMS Opt-in Checkbox */}
                <div className="mt-4 max-w-md mx-auto">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="smsOptIn"
                      checked={smsOptIn}
                      onChange={(e) => setSmsOptIn(e.target.checked)}
                      className="mt-1 h-4 w-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <div className="flex-1">
                      <label htmlFor="smsOptIn" className="text-xs text-gray-600 leading-tight cursor-pointer">
                        Yes, send my freight estimate via SMS to the phone number provided. I agree to receive automated text messages from Hauln Heavy regarding my freight quote, shipment updates, and related notifications. Message and data rates may apply. Message frequency varies based on your requests. Reply STOP to cancel, HELP for assistance.
                      </label>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowSmsTooltip(!showSmsTooltip)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {showSmsTooltip && (
                            <div className="absolute bottom-6 left-0 w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                              By checking, I consent to receive automated SMS messages from Hauln Heavy about my quotes and shipments. Msg &amp; data rates apply. Reply STOP to cancel. Not required to use service.
                              <div className="absolute bottom-0 left-2 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                            </div>
                          )}
                        </div>
                        <a
                          href="https://www.haulnheavy.com/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Terms
                        </a>
                        <span className="text-gray-400">|</span>
                        <a
                          href="https://www.haulnheavy.com/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Privacy Policy
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {smsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{smsError}</p>
                </div>
              )}

              {emailError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{emailError}</p>
                </div>
              )}
            </div>
          ) : smsSent ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">Estimate Sent!</h3>
              <p className="text-gray-600">
                Your estimate has been sent via text to <strong>{contactInfo.phone}</strong>
              </p>
              <p className="text-sm text-gray-500">
                We&apos;ve also sent the details to our team. Someone will contact you shortly.
              </p>
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
