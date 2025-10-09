'use client';

import { useState, useEffect } from 'react';
import Step0CategorySelection from './Step0CategorySelection';
import Step1EquipmentDetails from './Step1EquipmentDetails';
import Step1FreightDimensions from './Step1FreightDimensions';
import Step2Locations from './Step2Locations';
import Step3DatesTimes from './Step3DatesTimes';
import Step4AdditionalInfo from './Step4AdditionalInfo';
import EstimateResults from './EstimateResults';
import { EstimateData, EstimateResult, CategoryType } from '@/types/estimator';

interface EstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EstimatorModal({ isOpen, onClose }: EstimatorModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<EstimateData | null>(null);
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);

  // Reset all form state when modal is opened fresh
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setFormData(null);
      setEstimateResult(null);
    }
  }, [isOpen]);

  // Reset all form state when modal is closed
  const handleClose = () => {
    setCurrentStep(0);
    setFormData(null);
    setEstimateResult(null);
    onClose();
  };

  const handleStep0Next = (category: CategoryType) => {
    setFormData(prev => ({
      ...prev,
      category,
      equipment: {} as any,
      locations: {} as any,
      characteristics: {} as any
    }));
    setCurrentStep(1);
  };

  const handleStep1Next = (step1Data: any) => {
    setFormData(prev => ({
      ...prev,
      ...(step1Data.type === 'freight' ? { freight: step1Data } : { equipment: step1Data }),
      locations: {} as any,
      characteristics: {} as any
    }));
    setCurrentStep(2);
  };

  const handleStep2Next = (locationsData: any) => {
    setFormData(prev => ({
      ...prev,
      ...locationsData
    }));
    setCurrentStep(3);
  };

  const handleStep3Next = (schedulingData: any) => {
    setFormData(prev => ({
      ...prev,
      ...schedulingData
    }));
    setCurrentStep(4);
  };

  const handleStep4Next = (additionalInfoData: any) => {
    setFormData(prev => ({
      ...prev,
      ...additionalInfoData
    }));
    // Now we have all the data, calculate the estimate
    const completeData = {
      ...formData,
      ...additionalInfoData
    } as EstimateData;
    
    const result = calculateEstimate(completeData);
    setEstimateResult(result);
    setCurrentStep(5);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const calculateEstimate = (data: EstimateData): EstimateResult => {
    // Basic calculation logic - this would be more sophisticated in production
    const { equipment, characteristics, locations, scheduling, additionalInfo } = data;
    
    // Base cost calculation (simplified)
    const baseRate = 2.50; // per mile
    const estimatedMiles = 500; // This would be calculated based on pickup/delivery locations
    let baseCost = baseRate * estimatedMiles;

    // Weight adjustments
    if (equipment.weight > 10000) {
      baseCost *= 1.2; // 20% surcharge for heavy loads
    }

    // Oversize adjustments
    const totalLength = equipment.dimensions.length.feet + (equipment.dimensions.length.inches / 12);
    const totalWidth = equipment.dimensions.width.feet + (equipment.dimensions.width.inches / 12);
    const totalHeight = equipment.dimensions.height.feet + (equipment.dimensions.height.inches / 12);

    let oversizeFee = 0;
    if (totalLength > 48 || totalWidth > 8.5 || totalHeight > 13.5) {
      oversizeFee = baseCost * 0.5; // 50% oversize fee
    }

    // Additional fees
    let fuelSurcharge = baseCost * 0.15; // 15% fuel surcharge
    let hazmatFee = 0;
    let additionalFees = 0;

    if (characteristics.hasHazmat) {
      hazmatFee = baseCost * 0.25; // 25% hazmat fee
    }

    if (characteristics.hasDuals) {
      additionalFees += 200;
    }

    if (characteristics.hasAttachments) {
      additionalFees += 150;
    }

    if (characteristics.transportMethod === 'towed') {
      additionalFees += 300;
    } else if (characteristics.transportMethod === 'driven') {
      additionalFees += 500;
    }

    // Location-based fees
    if (locations.pickup.addressType === 'port' || locations.dropoff.addressType === 'port') {
      additionalFees += 300; // Port access fee
    }

    if (locations.pickup.addressType === 'residential' || locations.dropoff.addressType === 'residential') {
      additionalFees += 150; // Residential delivery fee
    }

    // Scheduling-based fees
    const pickupDate = scheduling.pickup.specificDate;
    const deliveryDate = scheduling.delivery.specificDate;
    const daysBetween = Math.ceil((deliveryDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysBetween < 3) {
      additionalFees += 400; // Rush delivery fee
    } else     if (daysBetween > 14) {
      additionalFees -= 200; // Long-term booking discount
    }

    // Additional info based fees
    if (additionalInfo.rampsNeeded) {
      additionalFees += 150; // Ramp fee
    }

    if (additionalInfo.loadingMethods.includes('FORKLIFT') || additionalInfo.unloadingMethods.includes('FORKLIFT')) {
      additionalFees += 200; // Forklift fee
    }

    if (additionalInfo.loadingMethods.includes('OTHER') || additionalInfo.unloadingMethods.includes('OTHER')) {
      additionalFees += 100; // Special handling fee
    }

    const totalEstimate = baseCost + fuelSurcharge + oversizeFee + hazmatFee + additionalFees;

    const estimate: EstimateResult = {
      baseCost: Math.round(baseCost),
      fuelSurcharge: Math.round(fuelSurcharge),
      oversizeFee: Math.round(oversizeFee),
      hazmatFee: Math.round(hazmatFee),
      additionalFees: Math.round(additionalFees),
      totalEstimate: Math.round(totalEstimate),
      disclaimer: "This is an estimate only. Final pricing may vary based on actual pickup/delivery locations, market conditions, and other factors. All estimates are valid for 7 days."
    };

    return estimate;
  };

  if (!isOpen) return null;

  const handleNewEstimate = () => {
    setCurrentStep(0);
    setFormData(null);
    setEstimateResult(null);
  };

  return (
    <>
      {currentStep === 0 && (
        <Step0CategorySelection
          onNext={handleStep0Next}
          onClose={handleClose}
        />
      )}
      {currentStep === 1 && formData?.category === 'equipment' && (
        <Step1EquipmentDetails
          category={formData.category}
          onNext={handleStep1Next}
          onClose={handleClose}
          onBack={handleBack}
        />
      )}
      {currentStep === 1 && formData?.category === 'freight' && (
        <Step1FreightDimensions
          onNext={handleStep1Next}
          onClose={handleClose}
          onBack={handleBack}
        />
      )}
      {currentStep === 2 && (formData?.equipment || formData?.freight) && (
        <Step2Locations
          equipmentData={formData?.equipment || formData?.freight}
          onNext={handleStep2Next}
          onBack={handleBack}
          onClose={handleClose}
        />
      )}
      {currentStep === 3 && (formData?.equipment || formData?.freight) && formData?.locations && (
        <Step3DatesTimes
          equipmentData={formData?.equipment || formData?.freight}
          locationsData={formData.locations}
          onNext={handleStep3Next}
          onBack={handleBack}
          onClose={handleClose}
        />
      )}
      {currentStep === 4 && (formData?.equipment || formData?.freight) && formData?.locations && formData?.scheduling && (
        <Step4AdditionalInfo
          equipmentData={formData?.equipment || formData?.freight}
          locationsData={formData.locations}
          schedulingData={formData.scheduling}
          onNext={handleStep4Next}
          onBack={handleBack}
          onClose={handleClose}
        />
      )}
      {currentStep === 5 && estimateResult && (
        <EstimateResults
          estimate={estimateResult}
          estimateData={formData}
          onClose={handleClose}
          onNewEstimate={handleNewEstimate}
        />
      )}
    </>
  );
}
