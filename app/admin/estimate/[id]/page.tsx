'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface EstimateData {
  category: string;
  equipment?: any;
  freight?: any;
  characteristics?: any;
  locations?: any;
  scheduling?: any;
  additionalInfo?: any;
  estimateResult?: any;
  timestamp: string;
  estimateId: string;
}

export default function AdminEstimatePage() {
  const params = useParams();
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now, we'll show a placeholder since we don't have a database
    // In the future, this could fetch from a database using the estimateId
    setLoading(false);
    setEstimateData({
      category: 'equipment',
      equipment: {
        year: '2024',
        make: 'bobcat',
        model: 'bobcat-s530',
        weight: 5800,
        dimensions: {
          length: { feet: 10, inches: 2 },
          width: { feet: 6, inches: 0 },
          height: { feet: 7, inches: 0 }
        }
      },
      estimateResult: {
        baseCost: 1250,
        fuelSurcharge: 188,
        oversizeFee: 0,
        hazmatFee: 0,
        additionalFees: 400,
        totalEstimate: 1838
      },
      timestamp: new Date().toISOString(),
      estimateId: params.id as string
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading estimate details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!estimateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Estimate Not Found</h1>
          <p className="text-gray-600">The requested estimate could not be found.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const item = estimateData.equipment || estimateData.freight;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hauln' Heavy</h1>
              <p className="text-gray-600">Admin - Estimate Details</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Estimate ID</p>
              <p className="font-mono text-sm font-medium text-gray-900">{estimateData.estimateId}</p>
            </div>
          </div>
        </div>

        {/* Estimate Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estimate Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Item Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Type:</span> {estimateData.equipment ? 'Equipment' : 'Freight'}</p>
                {item?.make && <p><span className="font-medium">Make:</span> {item.make}</p>}
                {item?.model && <p><span className="font-medium">Model:</span> {item.model}</p>}
                {item?.year && <p><span className="font-medium">Year:</span> {item.year}</p>}
                {item?.shippingItem && <p><span className="font-medium">Item:</span> {item.shippingItem}</p>}
              </div>
            </div>

            {/* Dimensions & Weight */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Dimensions & Weight</h3>
              <div className="space-y-2">
                {item?.dimensions && (
                  <>
                    <p><span className="font-medium">Length:</span> {item.dimensions.length?.feet || 0}' {item.dimensions.length?.inches || 0}"</p>
                    <p><span className="font-medium">Width:</span> {item.dimensions.width?.feet || 0}' {item.dimensions.width?.inches || 0}"</p>
                    <p><span className="font-medium">Height:</span> {item.dimensions.height?.feet || 0}' {item.dimensions.height?.inches || 0}"</p>
                  </>
                )}
                {item?.weight && <p><span className="font-medium">Weight:</span> {item.weight} lbs</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Locations */}
        {estimateData.locations && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Locations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pickup</h3>
                <p className="text-gray-600">
                  {estimateData.locations.pickup?.address || 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delivery</h3>
                <p className="text-gray-600">
                  {estimateData.locations.dropoff?.address || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        {estimateData.estimateResult && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Base Transport Cost:</span>
                <span className="font-medium">{formatCurrency(estimateData.estimateResult.baseCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fuel Surcharge:</span>
                <span className="font-medium">{formatCurrency(estimateData.estimateResult.fuelSurcharge)}</span>
              </div>
              {estimateData.estimateResult.oversizeFee > 0 && (
                <div className="flex justify-between">
                  <span>Oversize Load Fee:</span>
                  <span className="font-medium">{formatCurrency(estimateData.estimateResult.oversizeFee)}</span>
                </div>
              )}
              {estimateData.estimateResult.hazmatFee > 0 && (
                <div className="flex justify-between">
                  <span>Hazmat Fee:</span>
                  <span className="font-medium">{formatCurrency(estimateData.estimateResult.hazmatFee)}</span>
                </div>
              )}
              {estimateData.estimateResult.additionalFees > 0 && (
                <div className="flex justify-between">
                  <span>Additional Fees:</span>
                  <span className="font-medium">{formatCurrency(estimateData.estimateResult.additionalFees)}</span>
                </div>
              )}
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Estimate:</span>
                <span className="text-yellow-600">{formatCurrency(estimateData.estimateResult.totalEstimate)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        {estimateData.additionalInfo && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-2">
              {estimateData.additionalInfo.loadingMethod && (
                <p><span className="font-medium">Loading Method:</span> {estimateData.additionalInfo.loadingMethod}</p>
              )}
              {estimateData.additionalInfo.unloadingMethod && (
                <p><span className="font-medium">Unloading Method:</span> {estimateData.additionalInfo.unloadingMethod}</p>
              )}
              {estimateData.additionalInfo.handlingInstructions && (
                <p><span className="font-medium">Handling Instructions:</span> {estimateData.additionalInfo.handlingInstructions}</p>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {estimateData.estimateResult?.disclaimer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Important Disclaimer</h3>
            <p className="text-sm text-yellow-700">{estimateData.estimateResult.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
