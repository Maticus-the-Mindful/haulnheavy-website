import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== RAW REQUEST BODY ===');
    console.log('Full body:', JSON.stringify(body, null, 2));
    console.log('========================');
    
    const { 
      estimateData, 
      recipientEmail, 
      senderName, 
      senderEmail, 
      message,
      shareType 
    } = body;

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
    
    if (!recipientEmail || !senderEmail || !estimateData) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          debug: {
            recipientEmail: !!recipientEmail,
            senderEmail: !!senderEmail,
            estimateData: !!estimateData,
            recipientEmailValue: recipientEmail,
            senderEmailValue: senderEmail
          }
        },
        { status: 400 }
      );
    }

    // Ensure estimateData has an estimateId
    if (!estimateData.estimateId) {
      estimateData.estimateId = `EST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

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
    return NextResponse.json(
      { error: 'Failed to send estimate' },
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
        <p><strong>Date:</strong> ${estimateData.timestamp.toLocaleDateString()}</p>
        
        <h4>Item Information</h4>
        <p><strong>Type:</strong> ${summary.itemType}</p>
        ${summary.itemDetails.shippingItem ? `<p><strong>Item:</strong> ${summary.itemDetails.shippingItem}</p>` : ''}
        ${summary.itemDetails.make ? `<p><strong>Make:</strong> ${summary.itemDetails.make}</p>` : ''}
        ${summary.itemDetails.model ? `<p><strong>Model:</strong> ${summary.itemDetails.model}</p>` : ''}
        ${summary.itemDetails.year ? `<p><strong>Year:</strong> ${summary.itemDetails.year}</p>` : ''}
        
        <h4>Dimensions & Weight</h4>
        <p><strong>Length:</strong> ${summary.itemDetails.dimensions?.length?.feet || 0}' ${summary.itemDetails.dimensions?.length?.inches || 0}"</p>
        <p><strong>Width:</strong> ${summary.itemDetails.dimensions?.width?.feet || 0}' ${summary.itemDetails.dimensions?.width?.inches || 0}"</p>
        <p><strong>Height:</strong> ${summary.itemDetails.dimensions?.height?.feet || 0}' ${summary.itemDetails.dimensions?.height?.inches || 0}"</p>
        <p><strong>Weight:</strong> ${summary.itemDetails.weight || 0} lbs</p>
        
        <h4>Locations</h4>
        <p><strong>Pickup:</strong> ${summary.locations?.pickup?.address || 'Not specified'}</p>
        <p><strong>Delivery:</strong> ${summary.locations?.dropoff?.address || 'Not specified'}</p>
        
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

        ${message ? `<h4>Message</h4><p>${message}</p>` : ''}
        
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
        <p><strong>Date:</strong> ${estimateData.timestamp.toLocaleDateString()}</p>
        <p><strong>Category:</strong> ${estimateData.category}</p>
        
        <h3>Quick Summary</h3>
        <p><strong>Total Estimate:</strong> $${estimateData.estimateResult.totalEstimate.toFixed(2)}</p>
        
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
