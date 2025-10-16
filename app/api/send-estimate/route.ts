import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// FORCE DEPLOYMENT - VERSION 4.0 - CACHE BUST

export async function GET() {
  return NextResponse.json({ message: 'API route is working - VERSION 4.0' });
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== API CALLED - VERSION 4.0 - CACHE BUST ===');
    console.log('Environment check:');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('CLIENT_EMAIL exists:', !!process.env.CLIENT_EMAIL);
    console.log('RESEND_API_KEY value:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
    console.log('CLIENT_EMAIL value:', process.env.CLIENT_EMAIL);
    
    const body = await request.json();
    
    // Log everything we receive
    console.log('=== FULL REQUEST DEBUG ===');
    console.log('Request body type:', typeof body);
    console.log('Request body keys:', Object.keys(body || {}));
    console.log('Full body:', JSON.stringify(body, null, 2));
    console.log('Body is null/undefined:', body === null || body === undefined);
    console.log('Body is empty object:', JSON.stringify(body) === '{}');
    console.log('========================');
    
    // Extract all fields
    const { 
      estimateData, 
      recipientEmail, 
      senderName, 
      senderEmail, 
      message,
      shareType 
    } = body || {};
    
    // Log each field individually
    console.log('=== INDIVIDUAL FIELD DEBUG ===');
    console.log('estimateData:', estimateData, 'type:', typeof estimateData);
    console.log('recipientEmail:', recipientEmail, 'type:', typeof recipientEmail);
    console.log('senderName:', senderName, 'type:', typeof senderName);
    console.log('senderEmail:', senderEmail, 'type:', typeof senderEmail);
    console.log('message:', message, 'type:', typeof message);
    console.log('shareType:', shareType, 'type:', typeof shareType);
    console.log('==============================');

    // Debug logging
    console.log('=== API DEBUG ===');
    console.log('recipientEmail:', recipientEmail);
    console.log('senderEmail:', senderEmail);
    console.log('estimateData exists:', !!estimateData);
    console.log('estimateData.estimateId:', estimateData?.estimateId);
    console.log('shareType:', shareType);
    console.log('================');

    // Validate required fields with detailed logging
    console.log('=== VALIDATION CHECK ===');
    console.log('recipientEmail check:', recipientEmail, 'type:', typeof recipientEmail, 'truthy:', !!recipientEmail);
    console.log('senderEmail check:', senderEmail, 'type:', typeof senderEmail, 'truthy:', !!senderEmail);
    console.log('estimateData check:', !!estimateData, 'type:', typeof estimateData);
    if (estimateData) {
      console.log('estimateData keys:', Object.keys(estimateData));
      console.log('estimateData.estimateId:', estimateData.estimateId);
      console.log('estimateData.estimateResult:', !!estimateData.estimateResult);
    }
    console.log('=======================');
    
    // More lenient validation - just check if we have the basic structure
    if (!body || typeof body !== 'object') {
      console.log('Validation failed - no request body');
      return NextResponse.json(
        { 
          error: 'No request body received',
          debug: {
            hasResendKey: !!process.env.RESEND_API_KEY,
            hasClientEmail: !!process.env.CLIENT_EMAIL,
            resendKeyLength: process.env.RESEND_API_KEY?.length || 0
          }
        },
        { status: 400 }
      );
    }

    // Check if we have the minimum required fields
    if (!recipientEmail || !senderEmail) {
      console.log('Validation failed - missing email fields');
      return NextResponse.json(
        { 
          error: 'Missing email fields - Enhanced Debug Version',
          debug: {
            recipientEmail: !!recipientEmail,
            senderEmail: !!senderEmail,
            estimateData: !!estimateData,
            hasResendKey: !!process.env.RESEND_API_KEY,
            hasClientEmail: !!process.env.CLIENT_EMAIL
          }
        },
        { status: 400 }
      );
    }

    // Validation passed - continue with email sending
    console.log('=== VALIDATION PASSED ===');

    // Ensure estimateData has an estimateId
    if (!estimateData.estimateId) {
      estimateData.estimateId = `EST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Initialize Resend
    console.log('=== INITIALIZING RESEND ===');
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
    
    if (!process.env.RESEND_API_KEY) {
      console.log('ERROR: RESEND_API_KEY is not set!');
      return NextResponse.json(
        { error: 'Email service not configured - missing API key' },
        { status: 500 }
      );
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('Resend initialized successfully');

    // Generate estimate summary
    const estimateSummary = generateEstimateSummary(estimateData);
    
    // Create email content - always use the full estimate email template
    const emailSubject = `Heavy Equipment Hauling Estimate - ${estimateData.estimateId}`;
    const emailContent = generateEmailContent(estimateData, estimateSummary, message);

    // Email to customer
    const customerEmail = await resend.emails.send({
      from: 'Hauln Heavy <noreply@maticusmedia360.com>',
      to: recipientEmail,
      subject: emailSubject,
      html: emailContent,
      replyTo: senderEmail,
    });

    // Email to your business (client notification)
    const clientEmail = await resend.emails.send({
      from: 'Hauln Heavy <noreply@maticusmedia360.com>',
      to: process.env.CLIENT_EMAIL || 'mat@maticusmedia360.com',
      subject: `New Estimate Request - Email`,
      html: generateClientNotificationEmail(estimateData, senderName, senderEmail, 'email'),
    });

    console.log('=== EMAIL SENT ===');
    console.log('Estimate ID:', estimateData.estimateId);
    console.log('Sender:', senderName, '<' + senderEmail + '>');
    console.log('Recipient:', recipientEmail);
    console.log('Share Type:', shareType);
    console.log('Estimate Total:', estimateData.estimateResult?.totalEstimate);
    console.log('Customer Email ID:', customerEmail.data?.id);
    console.log('Client Email ID:', clientEmail.data?.id);
    console.log('==================');

    return NextResponse.json({ 
        success: true, 
      message: 'Estimate sent successfully',
      estimateId: estimateData.estimateId,
      emailId: customerEmail.data?.id
    });

  } catch (error) {
    console.error('Error sending estimate:', error);
    
    // Return detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';

    return NextResponse.json(
      { 
        error: 'Failed to send estimate',
        details: errorMessage,
        stack: errorStack,
        debug: {
          hasResendKey: !!process.env.RESEND_API_KEY,
          hasClientEmail: !!process.env.CLIENT_EMAIL,
          resendKeyLength: process.env.RESEND_API_KEY?.length || 0
        }
      },
      { status: 500 }
    );
  }
}

function generateEstimateSummary(estimateData: any) {
  const item = estimateData.equipment || estimateData.freight;
  const result = estimateData.estimateResult;

  return {
    itemType: estimateData.equipment ? 'Equipment' : 'Freight',
    itemDetails: item,
    locations: estimateData.locations,
    scheduling: estimateData.scheduling,
    additionalInfo: estimateData.additionalInfo,
    pricing: result,
    images: estimateData.images?.length || 0
  };
}

function generateEmailContent(estimateData: any, summary: any, message?: string) {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #eab308; background: #1f2937; padding: 20px; margin: 0; text-align: center;">
        Heavy Equipment Hauling Estimate
      </h2>
      
      <div style="padding: 20px; background: #f9fafb;">
        <h3>Estimate Details</h3>
        <p><strong>Estimate ID:</strong> ${estimateData.estimateId}</p>
        <p><strong>Date:</strong> ${new Date(estimateData.timestamp).toLocaleDateString()}</p>
        
        <h4>Item Information</h4>
        <p><strong>Type:</strong> ${summary.itemType}</p>
        ${summary.itemDetails.shippingItem ? `<p><strong>Item:</strong> ${summary.itemDetails.shippingItem}</p>` : ''}
        ${summary.itemDetails.make ? `<p><strong>Make:</strong> ${summary.itemDetails.make}</p>` : ''}
        ${summary.itemDetails.model ? `<p><strong>Model:</strong> ${summary.itemDetails.model}</p>` : ''}
        ${summary.itemDetails.year ? `<p><strong>Year:</strong> ${summary.itemDetails.year}</p>` : ''}
        ${summary.itemDetails.quantity ? `<p><strong>Quantity:</strong> ${summary.itemDetails.quantity}</p>` : ''}
        
        <h4>Dimensions & Weight</h4>
        <p><strong>Length:</strong> ${summary.itemDetails.dimensions?.length?.feet || 0}' ${summary.itemDetails.dimensions?.length?.inches || 0}"</p>
        <p><strong>Width:</strong> ${summary.itemDetails.dimensions?.width?.feet || 0}' ${summary.itemDetails.dimensions?.width?.inches || 0}"</p>
        <p><strong>Height:</strong> ${summary.itemDetails.dimensions?.height?.feet || 0}' ${summary.itemDetails.dimensions?.height?.inches || 0}"</p>
        <p><strong>Weight:</strong> ${summary.itemDetails.weight || 0} lbs</p>
        
        ${summary.itemDetails.hasHazmatPlacards !== null ? `<p><strong>Hazmat Placards:</strong> ${summary.itemDetails.hasHazmatPlacards ? 'Yes' : 'No'}</p>` : ''}
        ${summary.itemDetails.transportationMethod ? `<p><strong>Transportation Method:</strong> ${summary.itemDetails.transportationMethod}</p>` : ''}
        
        <h4>Locations</h4>
        <p><strong>Pickup:</strong> ${summary.locations?.pickup?.address || 'Not specified'}</p>
        ${summary.locations?.pickup?.addressType ? `<p><strong>Pickup Type:</strong> ${summary.locations.pickup.addressType}</p>` : ''}
        <p><strong>Delivery:</strong> ${summary.locations?.dropoff?.address || 'Not specified'}</p>
        ${summary.locations?.dropoff?.addressType ? `<p><strong>Delivery Type:</strong> ${summary.locations.dropoff.addressType}</p>` : ''}
        
        <h4>Scheduling Information</h4>
        ${summary.scheduling?.pickup?.dateType ? `<p><strong>Pickup Date Type:</strong> ${summary.scheduling.pickup.dateType}</p>` : ''}
        ${summary.scheduling?.pickup?.specificDate ? `<p><strong>Pickup Date:</strong> ${new Date(summary.scheduling.pickup.specificDate).toLocaleDateString()}</p>` : ''}
        ${summary.scheduling?.pickup?.timeType ? `<p><strong>Pickup Time Type:</strong> ${summary.scheduling.pickup.timeType}</p>` : ''}
        ${summary.scheduling?.pickup?.specificTime ? `<p><strong>Pickup Time:</strong> ${summary.scheduling.pickup.specificTime}</p>` : ''}
        
        ${summary.scheduling?.delivery?.dateType ? `<p><strong>Delivery Date Type:</strong> ${summary.scheduling.delivery.dateType}</p>` : ''}
        ${summary.scheduling?.delivery?.specificDate ? `<p><strong>Delivery Date:</strong> ${new Date(summary.scheduling.delivery.specificDate).toLocaleDateString()}</p>` : ''}
        ${summary.scheduling?.delivery?.timeType ? `<p><strong>Delivery Time Type:</strong> ${summary.scheduling.delivery.timeType}</p>` : ''}
        ${summary.scheduling?.delivery?.specificTime ? `<p><strong>Delivery Time:</strong> ${summary.scheduling.delivery.specificTime}</p>` : ''}
        
        <h4>Additional Information</h4>
        ${summary.additionalInfo?.loadingMethod ? `<p><strong>Loading Method:</strong> ${summary.additionalInfo.loadingMethod}</p>` : ''}
        ${summary.additionalInfo?.unloadingMethod ? `<p><strong>Unloading Method:</strong> ${summary.additionalInfo.unloadingMethod}</p>` : ''}
        ${summary.additionalInfo?.rampsNeeded !== null ? `<p><strong>Ramps Needed:</strong> ${summary.additionalInfo.rampsNeeded ? 'Yes' : 'No'}</p>` : ''}
        ${summary.additionalInfo?.handlingInstructions ? `<p><strong>Handling Instructions:</strong> ${summary.additionalInfo.handlingInstructions}</p>` : ''}
        ${summary.additionalInfo?.targetBudget ? `<p><strong>Target Budget:</strong> $${summary.additionalInfo.targetBudget}</p>` : ''}
        ${summary.additionalInfo?.valueOfItems ? `<p><strong>Value of Items:</strong> $${summary.additionalInfo.valueOfItems}</p>` : ''}
        
        <h4>Cost Breakdown</h4>
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <p>Base Transport Cost: $${summary.pricing.baseCost.toFixed(2)}</p>
          <p>Fuel Surcharge: $${summary.pricing.fuelSurcharge.toFixed(2)}</p>
          <p>Oversize Load Fee: $${summary.pricing.oversizeFee.toFixed(2)}</p>
          <p>Hazmat Fee: $${summary.pricing.hazmatFee.toFixed(2)}</p>
          <p>Additional Fees: $${summary.pricing.additionalFees.toFixed(2)}</p>
          <hr style="margin: 10px 0;">
          <h3 style="color: #eab308;">Total Estimate: $${summary.pricing.totalEstimate.toFixed(2)}</h3>
          </div>

        ${message ? `<h4>Customer Message</h4><p>${message}</p>` : ''}

        <p><em>This is an estimate only. Final pricing may vary based on actual conditions.</em></p>

        <p>Thank you for choosing Hauln' Heavy for your equipment transportation needs!</p>
        </div>
      </div>
  `;
}

function generatePDFEmailContent(estimateData: any, summary: any) {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #eab308; background: #1f2937; padding: 20px; margin: 0; text-align: center;">
        PDF Estimate Ready
      </h2>
      
      <div style="padding: 20px; background: #f9fafb;">
        <p>Your detailed PDF estimate is attached to this email.</p>
        
        <h3>Quick Summary</h3>
        <p><strong>Estimate ID:</strong> ${estimateData.estimateId}</p>
        <p><strong>Total Estimate:</strong> $${summary.pricing.totalEstimate.toFixed(2)}</p>
        <p><strong>Item:</strong> ${summary.itemDetails.shippingItem || `${summary.itemDetails.make} ${summary.itemDetails.model}`}</p>
        
        <p>Please review the attached PDF for complete details and contact us with any questions.</p>
        
        <p>Thank you for choosing Hauln' Heavy!</p>
        </div>
      </div>
  `;
}

function generateShareEmailContent(estimateData: any, summary: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #eab308; background: #1f2937; padding: 20px; margin: 0; text-align: center;">
        Shared Estimate Link
      </h2>
      
      <div style="padding: 20px; background: #f9fafb;">
        <p>You've received a shared estimate link for your equipment hauling needs.</p>
        
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/estimate/${estimateData.estimateId}" 
             style="background: #eab308; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Your Estimate
          </a>
        </div>
        
        <h3>Quick Summary</h3>
        <p><strong>Estimate ID:</strong> ${estimateData.estimateId}</p>
        <p><strong>Total Estimate:</strong> $${summary.pricing.totalEstimate.toFixed(2)}</p>
        
        <p>Click the button above to view your complete estimate details.</p>
        
        <p>Thank you for choosing Hauln' Heavy!</p>
      </div>
    </div>
  `;
}

function generateClientNotificationEmail(estimateData: any, senderName: string, senderEmail: string, shareType: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #eab308; background: #1f2937; padding: 20px; margin: 0; text-align: center;">
        New Estimate Request - ${shareType.toUpperCase()}
      </h2>
      
      <div style="padding: 20px; background: #f9fafb;">
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${senderName}</p>
        <p><strong>Email:</strong> ${senderEmail}</p>
        <p><strong>Share Type:</strong> ${shareType}</p>
        
        <h3>Estimate Details</h3>
        <p><strong>Estimate ID:</strong> ${estimateData.estimateId}</p>
        <p><strong>Date:</strong> ${new Date(estimateData.timestamp).toLocaleDateString()}</p>
        <p><strong>Category:</strong> ${estimateData.category}</p>
        
        <h4>Item Information</h4>
        <p><strong>Type:</strong> ${estimateData.equipment ? 'Equipment' : 'Freight'}</p>
        ${estimateData.equipment?.make ? `<p><strong>Make:</strong> ${estimateData.equipment.make}</p>` : ''}
        ${estimateData.equipment?.model ? `<p><strong>Model:</strong> ${estimateData.equipment.model}</p>` : ''}
        ${estimateData.equipment?.year ? `<p><strong>Year:</strong> ${estimateData.equipment.year}</p>` : ''}
        ${estimateData.freight?.shippingItem ? `<p><strong>Item:</strong> ${estimateData.freight.shippingItem}</p>` : ''}
        
        <h4>Dimensions & Weight</h4>
        <p><strong>Length:</strong> ${(estimateData.equipment?.dimensions?.length?.feet || estimateData.freight?.dimensions?.length?.feet || 0)}' ${(estimateData.equipment?.dimensions?.length?.inches || estimateData.freight?.dimensions?.length?.inches || 0)}"</p>
        <p><strong>Width:</strong> ${(estimateData.equipment?.dimensions?.width?.feet || estimateData.freight?.dimensions?.width?.feet || 0)}' ${(estimateData.equipment?.dimensions?.width?.inches || estimateData.freight?.dimensions?.width?.inches || 0)}"</p>
        <p><strong>Height:</strong> ${(estimateData.equipment?.dimensions?.height?.feet || estimateData.freight?.dimensions?.height?.feet || 0)}' ${(estimateData.equipment?.dimensions?.height?.inches || estimateData.freight?.dimensions?.height?.inches || 0)}"</p>
        <p><strong>Weight:</strong> ${estimateData.equipment?.weight || estimateData.freight?.weight || 0} lbs</p>
        
        <h4>Locations</h4>
        <p><strong>Pickup:</strong> ${estimateData.locations?.pickup?.address || 'Not specified'}</p>
        <p><strong>Delivery:</strong> ${estimateData.locations?.dropoff?.address || 'Not specified'}</p>
        
        <h4>Scheduling Information</h4>
        ${estimateData.scheduling?.pickup?.dateType ? `<p><strong>Pickup Date Type:</strong> ${estimateData.scheduling.pickup.dateType}</p>` : ''}
        ${estimateData.scheduling?.pickup?.specificDate ? `<p><strong>Pickup Date:</strong> ${new Date(estimateData.scheduling.pickup.specificDate).toLocaleDateString()}</p>` : ''}
        ${estimateData.scheduling?.pickup?.timeType ? `<p><strong>Pickup Time Type:</strong> ${estimateData.scheduling.pickup.timeType}</p>` : ''}
        ${estimateData.scheduling?.pickup?.specificTime ? `<p><strong>Pickup Time:</strong> ${estimateData.scheduling.pickup.specificTime}</p>` : ''}
        
        ${estimateData.scheduling?.delivery?.dateType ? `<p><strong>Delivery Date Type:</strong> ${estimateData.scheduling.delivery.dateType}</p>` : ''}
        ${estimateData.scheduling?.delivery?.specificDate ? `<p><strong>Delivery Date:</strong> ${new Date(estimateData.scheduling.delivery.specificDate).toLocaleDateString()}</p>` : ''}
        ${estimateData.scheduling?.delivery?.timeType ? `<p><strong>Delivery Time Type:</strong> ${estimateData.scheduling.delivery.timeType}</p>` : ''}
        ${estimateData.scheduling?.delivery?.specificTime ? `<p><strong>Delivery Time:</strong> ${estimateData.scheduling.delivery.specificTime}</p>` : ''}
        
        <h4>Additional Information</h4>
        ${estimateData.additionalInfo?.loadingMethod ? `<p><strong>Loading Method:</strong> ${estimateData.additionalInfo.loadingMethod}</p>` : ''}
        ${estimateData.additionalInfo?.unloadingMethod ? `<p><strong>Unloading Method:</strong> ${estimateData.additionalInfo.unloadingMethod}</p>` : ''}
        ${estimateData.additionalInfo?.handlingInstructions ? `<p><strong>Handling Instructions:</strong> ${estimateData.additionalInfo.handlingInstructions}</p>` : ''}
        ${estimateData.additionalInfo?.targetBudget ? `<p><strong>Target Budget:</strong> $${estimateData.additionalInfo.targetBudget}</p>` : ''}
        
        <h4>Cost Breakdown</h4>
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <p>Base Transport Cost: $${estimateData.estimateResult.baseCost.toFixed(2)}</p>
          <p>Fuel Surcharge: $${estimateData.estimateResult.fuelSurcharge.toFixed(2)}</p>
          <p>Oversize Load Fee: $${estimateData.estimateResult.oversizeFee.toFixed(2)}</p>
          <p>Hazmat Fee: $${estimateData.estimateResult.hazmatFee.toFixed(2)}</p>
          <p>Additional Fees: $${estimateData.estimateResult.additionalFees.toFixed(2)}</p>
          <hr style="margin: 10px 0;">
          <h3 style="color: #eab308;">Total Estimate: $${estimateData.estimateResult.totalEstimate.toFixed(2)}</h3>
        </div>
        
        <p><em>This estimate was automatically generated and shared with the customer.</em></p>
        
        <div style="background: #eab308; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/estimate/${estimateData.estimateId}" 
             style="color: white; text-decoration: none; font-weight: bold;">
            View Full Estimate Details
          </a>
        </div>
      </div>
    </div>
  `;
}
