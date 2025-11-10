'use client';

import { useState } from 'react';
import Step0CategorySelection from './Step0CategorySelection';
import Step1EquipmentDetails from './Step1EquipmentDetails';
import Step1FreightDimensions from './Step1FreightDimensions';
import Step2Locations from './Step2Locations';
import Step3DatesTimes from './Step3DatesTimes';
import Step4AdditionalInfo from './Step4AdditionalInfo';
import Step5ContactInfo from './Step5ContactInfo';
import EstimateResults from './EstimateResults';
import { EstimateData, EstimateResult, CategoryType } from '@/types/estimator';

interface EstimatorModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function EstimatorModal({ isOpen = true, onClose }: EstimatorModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<EstimateData | null>(null);
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);
  const [completeEstimateData, setCompleteEstimateData] = useState<any>(null);

  // Reset all form state
  const handleClose = () => {
    if (onClose) {
      setCurrentStep(0);
      setFormData(null);
      setEstimateResult(null);
      onClose();
    }
  };

  const handleStep0Next = (category: CategoryType) => {
    setFormData(prev => ({
      ...(prev || {}),
      category,
      equipment: {} as any,
      freight: undefined,
      characteristics: {} as any,
      locations: {
        pickup: {} as any,
        dropoff: {} as any
      },
      scheduling: {
        pickup: {} as any,
        delivery: {} as any
      },
      additionalInfo: {} as any
    } as EstimateData));
    setCurrentStep(1);
  };

  const handleStep1Next = (step1Data: any) => {
    const newFormData = {
      ...(formData || {}),
      ...(step1Data.type === 'freight' ? { freight: step1Data } : { equipment: step1Data }),
      characteristics: {} as any,
      locations: {
        pickup: {} as any,
        dropoff: {} as any
      },
      scheduling: {
        pickup: {} as any,
        delivery: {} as any
      },
      additionalInfo: {} as any
    } as EstimateData;

    setFormData(newFormData);
    setCurrentStep(2);
  };

  const handleStep2Next = (locationsData: any) => {
    setFormData(prev => ({
      ...(prev || {}),
      ...locationsData
    } as EstimateData));
    setCurrentStep(3);
  };

  const handleStep3Next = (schedulingData: any) => {
    setFormData(prev => ({
      ...(prev || {}),
      ...schedulingData
    } as EstimateData));
    setCurrentStep(4);
  };

  const handleStep4Next = (additionalInfoData: any) => {
    const updatedFormData = {
      ...(formData || {}),
      ...additionalInfoData
    } as EstimateData;

    setFormData(updatedFormData);
    setCurrentStep(5);
  };

  const handleStep5Next = (contactInfoData: any) => {
    const updatedFormData = {
      ...(formData || {}),
      ...contactInfoData
    } as EstimateData;

    setFormData(updatedFormData);

    // Now we have all the data, calculate the estimate
    try {
      const result = calculateEstimate(updatedFormData);

      // Create complete estimate data with images
      const completeEstimateData = {
        ...updatedFormData,
        estimateResult: result,
        timestamp: new Date(),
        estimateId: `EST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      setEstimateResult(result);
      setCompleteEstimateData(completeEstimateData);
      setCurrentStep(6);
    } catch (error) {
      console.error('Error calculating estimate:', error);
      alert('Error calculating estimate. Please check the console for details.');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const calculateEstimate = (data: EstimateData): EstimateResult => {
    // Basic calculation logic - this would be more sophisticated in production
    const { equipment, freight, characteristics, locations, scheduling, additionalInfo } = data;

    // Determine if we're dealing with equipment or freight
    // Check if freight has actual data (not just empty object)
    const hasFreightData = freight && freight.type === 'freight' && (freight.shippingItem || freight.weight > 0);
    const hasEquipmentData = equipment && equipment.type === 'equipment' && (equipment.make || equipment.model);

    const itemData = hasFreightData ? freight : hasEquipmentData ? equipment : null;

    if (!itemData) {
      throw new Error('No equipment or freight data provided');
    }
    
    // Base cost calculation (simplified)
    const baseRate = 2.50; // per mile
    const estimatedMiles = 500; // This would be calculated based on pickup/delivery locations
    let baseCost = baseRate * estimatedMiles;

    // Weight adjustments
    if (itemData.weight > 10000) {
      baseCost *= 1.2; // 20% surcharge for heavy loads
    }

    // Oversize adjustments - with null checks
    if (!itemData.dimensions) {
      throw new Error('No dimensions data provided');
    }
    
    const lengthFeet = itemData.dimensions.length?.feet || 0;
    const lengthInches = itemData.dimensions.length?.inches || 0;
    const widthFeet = itemData.dimensions.width?.feet || 0;
    const widthInches = itemData.dimensions.width?.inches || 0;
    const heightFeet = itemData.dimensions.height?.feet || 0;
    const heightInches = itemData.dimensions.height?.inches || 0;
    
    const totalLength = lengthFeet + (lengthInches / 12);
    const totalWidth = widthFeet + (widthInches / 12);
    const totalHeight = heightFeet + (heightInches / 12);

    let oversizeFee = 0;
    if (totalLength > 48 || totalWidth > 8.5 || totalHeight > 13.5) {
      oversizeFee = baseCost * 0.5; // 50% oversize fee
    }

    // Additional fees
    let fuelSurcharge = baseCost * 0.15; // 15% fuel surcharge
    let hazmatFee = 0;
    let additionalFees = 0;

    // Check for hazmat (from either equipment characteristics or freight data)
    const hasHazmat = characteristics?.hasHazmat || (freight?.hasHazmatPlacards) || false;
    if (hasHazmat) {
      hazmatFee = baseCost * 0.25; // 25% hazmat fee
    }

    if (characteristics?.hasDuals) {
      additionalFees += 200;
    }

    if (characteristics?.hasAttachments) {
      additionalFees += 150;
    }

    // Check transport method (from either equipment characteristics or freight data)
    const transportMethod = characteristics?.transportMethod || freight?.transportationMethod;
    if (transportMethod === 'towed') {
      additionalFees += 300;
    } else if (transportMethod === 'driven') {
      additionalFees += 500;
    }

    // Location-based fees
    if (locations?.pickup?.addressType === 'port' || locations?.dropoff?.addressType === 'port') {
      additionalFees += 300; // Port access fee
    }

    if (locations?.pickup?.addressType === 'residential' || locations?.dropoff?.addressType === 'residential') {
      additionalFees += 150; // Residential delivery fee
    }

    // Scheduling-based fees
    const pickupDate = scheduling?.pickup?.specificDate;
    const deliveryDate = scheduling?.delivery?.specificDate;
    const daysBetween = pickupDate && deliveryDate ? 
      Math.ceil((deliveryDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)) : 1;
    
    if (daysBetween < 3) {
      additionalFees += 400; // Rush delivery fee
    } else if (daysBetween > 14) {
      additionalFees -= 200; // Long-term booking discount
    }

    // Additional info based fees
    if (additionalInfo?.rampsNeeded) {
      additionalFees += 150; // Ramp fee
    }

    if (additionalInfo?.loadingMethods?.includes('FORKLIFT') || additionalInfo?.unloadingMethods?.includes('FORKLIFT')) {
      additionalFees += 200; // Forklift fee
    }

    if (additionalInfo?.loadingMethods?.includes('OTHER') || additionalInfo?.unloadingMethods?.includes('OTHER')) {
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

  const handleNewEstimate = () => {
    setCurrentStep(0);
    setFormData(null);
    setEstimateResult(null);
  };

  const handleSwitchToFreight = () => {
    setFormData(prev => ({
      ...(prev || {}),
      category: 'freight',
      equipment: {} as any,
      freight: undefined,
      characteristics: {} as any,
      locations: {
        pickup: {} as any,
        dropoff: {} as any
      },
      scheduling: {
        pickup: {} as any,
        delivery: {} as any
      },
      additionalInfo: {} as any
    } as EstimateData));
    // Stay on the same step (1) but switch to freight form
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
          existingData={formData.equipment}
          onNext={handleStep1Next}
          onClose={handleClose}
          onBack={handleBack}
          onSwitchToFreight={handleSwitchToFreight}
        />
      )}
      {currentStep === 1 && formData?.category === 'freight' && (
        <Step1FreightDimensions
          existingData={formData.freight}
          onNext={handleStep1Next}
          onClose={handleClose}
          onBack={handleBack}
        />
      )}
      {currentStep === 2 && (formData?.equipment || formData?.freight) && (
        <Step2Locations
          equipmentData={formData?.equipment || formData?.freight}
          existingData={formData.locations}
          onNext={handleStep2Next}
          onBack={handleBack}
          onClose={handleClose}
        />
      )}
      {currentStep === 3 && (formData?.equipment || formData?.freight) && formData?.locations && (
        <Step3DatesTimes
          equipmentData={formData?.equipment || formData?.freight}
          locationsData={formData.locations}
          existingData={formData.scheduling}
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
          existingData={formData.additionalInfo}
          onNext={handleStep4Next}
          onBack={handleBack}
          onClose={handleClose}
        />
      )}
      {currentStep === 5 && (formData?.equipment || formData?.freight) && formData?.locations && formData?.scheduling && formData?.additionalInfo && (
        <Step5ContactInfo
          existingData={formData.contactInfo}
          onNext={handleStep5Next}
          onBack={handleBack}
          onClose={handleClose}
        />
      )}
      {currentStep === 6 && estimateResult && completeEstimateData && formData?.contactInfo && (
        <EstimateResults
          estimate={estimateResult}
          estimateData={formData}
          completeData={completeEstimateData}
          contactInfo={formData.contactInfo}
          onClose={handleClose}
          onNewEstimate={handleNewEstimate}
          onBack={handleBack}
        />
      )}
    </>
  );
}
