export interface EquipmentDetails {
  year: string;
  make: string;
  model: string;
  type: string;
  quantity: number;
  dimensions: {
    length: {
      feet: number;
      inches: number;
    };
    width: {
      feet: number;
      inches: number;
    };
    height: {
      feet: number;
      inches: number;
    };
  };
  weight: number; // in pounds
}

export interface FreightDetails {
  type: 'freight';
  shippingItem: string;
  quantity: number;
  dimensions: {
    length: {
      feet: number;
      inches: number;
    };
    width: {
      feet: number;
      inches: number;
    };
    height: {
      feet: number;
      inches: number;
    };
  };
  weight: number; // in pounds
  hasHazmat: boolean;
  transportMethod: 'hauled' | 'towed' | 'driven';
}

export interface LocationInfo {
  address: string;
  addressType: 'business' | 'residential' | 'port';
  isVerified: boolean;
}

export interface LoadCharacteristics {
  hasHazmat: boolean;
  hasDuals: boolean;
  hasFrontWeights: boolean;
  hasAttachments: boolean;
  transportMethod: 'hauled' | 'towed' | 'driven';
  willDisassemble: boolean;
  photos: File[];
  isLoadDrivable: boolean;
  doYouOwnLoad: boolean;
  isContactAtPickup: boolean;
  isContactAtDropoff: boolean;
}

export interface DateTimeInfo {
  dateType: 'before' | 'between' | 'on' | 'after';
  specificDate?: Date;
  dateRange?: {
    start: Date;
    end: Date;
  };
  timeType: 'before' | 'between' | 'on' | 'after';
  specificTime?: string;
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface AdditionalInfo {
  loadingMethods: string[];
  unloadingMethods: string[];
  rampsNeeded: boolean;
  handlingInstructions: string;
  targetBudget?: number;
  itemValue?: number;
}

export type CategoryType = 'equipment' | 'freight';

export interface EstimateData {
  category: CategoryType;
  equipment?: EquipmentDetails;
  freight?: FreightDetails;
  characteristics: LoadCharacteristics;
  locations: {
    pickup: LocationInfo;
    dropoff: LocationInfo;
  };
  scheduling: {
    pickup: DateTimeInfo;
    delivery: DateTimeInfo;
  };
  additionalInfo: AdditionalInfo;
}

export interface EstimateResult {
  baseCost: number;
  fuelSurcharge: number;
  oversizeFee: number;
  hazmatFee: number;
  additionalFees: number;
  totalEstimate: number;
  disclaimer: string;
}
