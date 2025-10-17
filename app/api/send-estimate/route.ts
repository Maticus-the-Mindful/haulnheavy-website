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
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper function to build pickup/delivery strings with proper logic
  const buildScheduleString = (scheduleData: any, type: 'pickup' | 'delivery') => {
    if (!scheduleData) return 'Not specified';

    const { dateType, timeType, specificDate, specificTime, dateRange, timeRange } = scheduleData;
    
    // Debug logging for date/time data
    console.log(`=== ${type.toUpperCase()} SCHEDULE DEBUG ===`);
    console.log('dateType:', dateType);
    console.log('timeType:', timeType);
    console.log('specificDate:', specificDate);
    console.log('specificTime:', specificTime);
    console.log('dateRange:', dateRange);
    console.log('timeRange:', timeRange);
    console.log('===============================');
    
    let dateStr = '';
    let timeStr = '';

    // Handle date based on dateType
    if (dateType === 'between' && dateRange?.start && dateRange?.end) {
      const startDate = formatDate(dateRange.start);
      const endDate = formatDate(dateRange.end);
      
      // If dates are the same, just show one date
      if (startDate === endDate) {
        dateStr = startDate;
      } else {
        dateStr = `${startDate}-${endDate}`;
      }
    } else if (specificDate) {
      dateStr = formatDate(specificDate);
    }

    // Handle time based on timeType
    if (timeType === 'between' && timeRange?.start && timeRange?.end) {
      timeStr = ` between ${timeRange.start} - ${timeRange.end}`;
    } else if (specificTime) {
      timeStr = ` at ${specificTime}`;
    }

    // Handle date type modifiers
    if (dateType === 'before') {
      return `Before ${dateStr}${timeStr}`;
    } else if (dateType === 'after') {
      return `After ${dateStr}${timeStr}`;
    } else {
      // 'on' or 'between' or default
      return `${dateStr}${timeStr}`;
    }
  };

  // Build pickup and delivery strings
  const pickupStr = buildScheduleString(estimateData.scheduling?.pickup, 'pickup');
  const deliveryStr = buildScheduleString(estimateData.scheduling?.delivery, 'delivery');

  // Build contact information strings
  const buildContactString = (contactInfo: any, location: 'pickup' | 'delivery') => {
    if (!contactInfo) return '';
    
    const isContact = location === 'pickup' ? contactInfo.isContactAtPickup : contactInfo.isContactAtDropoff;
    const contactName = location === 'pickup' ? contactInfo.pickupContactName : contactInfo.dropoffContactName;
    const contactPhone = location === 'pickup' ? contactInfo.pickupContactPhone : contactInfo.dropoffContactPhone;
    
    if (isContact === true) {
      return 'Customer will be contact';
    } else if (isContact === false && contactName && contactPhone) {
      return `${contactName} (${contactPhone})`;
    }
    return '';
  };

  const pickupContact = buildContactString(estimateData.scheduling?.contactInfo, 'pickup');
  const deliveryContact = buildContactString(estimateData.scheduling?.contactInfo, 'delivery');

  // Build dimensions string
  const lengthFt = summary.itemDetails.dimensions?.length?.feet || 0;
  const lengthIn = summary.itemDetails.dimensions?.length?.inches || 0;
  const widthFt = summary.itemDetails.dimensions?.width?.feet || 0;
  const widthIn = summary.itemDetails.dimensions?.width?.inches || 0;
  const heightFt = summary.itemDetails.dimensions?.height?.feet || 0;
  const heightIn = summary.itemDetails.dimensions?.height?.inches || 0;
  const weight = summary.itemDetails.weight || 0;
  
  const dimensionsStr = `${lengthFt}'${lengthIn}" L × ${widthFt}'${widthIn}" W × ${heightFt}'${heightIn}" H | ${weight.toLocaleString()} lbs`;

  // Build equipment/freight name
  const itemName = summary.itemDetails.shippingItem 
    ? summary.itemDetails.shippingItem 
    : `${summary.itemDetails.make || ''} ${summary.itemDetails.model || ''}`.trim();
  
  const itemYear = summary.itemDetails.year ? ` (${summary.itemDetails.year})` : '';

  // Build value and budget string
  const valueBudgetParts = [];
  if (summary.additionalInfo?.itemValue) valueBudgetParts.push(`Value: $${summary.additionalInfo.itemValue.toLocaleString()}`);
  if (summary.additionalInfo?.targetBudget) valueBudgetParts.push(`Budget: $${summary.additionalInfo.targetBudget.toLocaleString()}`);
  const valueBudgetStr = valueBudgetParts.join(' | ');

  // Build transport details string
  const transportParts = [];
  if (summary.additionalInfo?.loadingMethod) transportParts.push(`Loading: ${summary.additionalInfo.loadingMethod}`);
  if (summary.additionalInfo?.unloadingMethod) transportParts.push(`Unloading: ${summary.additionalInfo.unloadingMethod}`);
  if (summary.additionalInfo?.handlingInstructions) transportParts.push(`Handling: ${summary.additionalInfo.handlingInstructions}`);
  const transportStr = transportParts.join(' | ');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="color: #eab308; background: #1f2937; padding: 12px; text-align: center;">
        <div style="font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">ESTIMATE #${estimateData.estimateId}</div>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 12px; background: #f9fafb; font-size: 13px; line-height: 1.4;">
        
        <!-- Two Column Layout: Customer & Locations -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
          <tr>
            <td style="width: 50%; padding: 8px; vertical-align: top; background: #ffffff; border-right: 1px solid #e0e0e0;">
              <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px;">CUSTOMER</div>
              <div style="font-size: 13px; line-height: 1.5;">
                <div>${message?.split('\\n')[0]?.replace('Company: ', '') || 'N/A'}</div>
                <div style="color: #666;">${summary.scheduling?.contactInfo?.pickupContactPhone || message?.split('\\n')[1]?.replace('Phone: ', '') || ''}</div>
                <div style="font-size: 11px; color: #999; margin-top: 4px;">Category: ${estimateData.category}</div>
              </div>
            </td>
            <td style="width: 50%; padding: 8px; vertical-align: top; background: #ffffff;">
              <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px;">LOCATIONS</div>
              <div style="font-size: 12px; line-height: 1.5;">
                <div><strong>Pickup:</strong> ${summary.locations?.pickup?.address || 'Not specified'}</div>
                <div style="margin-top: 4px;"><strong>Delivery:</strong> ${summary.locations?.dropoff?.address || 'Not specified'}</div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Equipment/Freight Section -->
        <div style="background: #ffffff; padding: 10px; margin-bottom: 8px; border-radius: 4px;">
          <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px;">${summary.itemType.toUpperCase()}</div>
          <div style="font-size: 14px; font-weight: bold; color: #1f2937; margin-bottom: 2px;">${itemName}${itemYear}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${dimensionsStr}</div>
          ${valueBudgetStr ? `<div style="font-size: 12px; color: #666;">${valueBudgetStr}</div>` : ''}
        </div>

        <!-- Schedule Section -->
        <div style="background: #ffffff; padding: 10px; margin-bottom: 8px; border-radius: 4px;">
          <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px;">SCHEDULE</div>
          <div style="font-size: 13px; line-height: 1.6;">
            <strong>Pickup:</strong> ${pickupStr}${pickupContact ? `<br><strong>Pickup Contact:</strong> ${pickupContact}` : ''}<br>
            <strong>Delivery:</strong> ${deliveryStr}${deliveryContact ? `<br><strong>Delivery Contact:</strong> ${deliveryContact}` : ''}
          </div>
        </div>

        <!-- Transport Details Section -->
        ${transportStr ? `
        <div style="background: #ffffff; padding: 10px; margin-bottom: 8px; border-radius: 4px;">
          <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px;">TRANSPORT DETAILS</div>
          <div style="font-size: 12px; color: #666;">${transportStr}</div>
        </div>
        ` : ''}

        <!-- Cost Breakdown -->
        <div style="background: #ffffff; padding: 10px; border-radius: 4px;">
          <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 6px;">COST BREAKDOWN</div>
          <table style="width: 100%; font-size: 12px; line-height: 1.8;">
            <tr><td>Base Transport:</td><td style="text-align: right;">$${summary.pricing.baseCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>
            <tr><td>Fuel Surcharge:</td><td style="text-align: right;">$${summary.pricing.fuelSurcharge.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>
            ${summary.pricing.oversizeFee > 0 ? `<tr><td>Oversize Fee:</td><td style="text-align: right;">$${summary.pricing.oversizeFee.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>` : ''}
            ${summary.pricing.hazmatFee > 0 ? `<tr><td>Hazmat Fee:</td><td style="text-align: right;">$${summary.pricing.hazmatFee.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>` : ''}
            ${summary.pricing.additionalFees > 0 ? `<tr><td>Additional:</td><td style="text-align: right;">$${summary.pricing.additionalFees.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>` : ''}
            <tr style="border-top: 2px solid #e0e0e0;">
              <td style="padding-top: 6px; font-size: 14px; font-weight: bold;">TOTAL:</td>
              <td style="padding-top: 6px; text-align: right; font-size: 16px; font-weight: bold; color: #eab308;">$${summary.pricing.totalEstimate.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="margin-top: 12px; padding: 8px; background: #ffffff; border-radius: 4px; font-size: 11px; color: #666; text-align: center;">
          <em>This is an estimate only. Final pricing may vary based on actual conditions.</em>
        </div>
        
        <div style="margin-top: 8px; font-size: 12px; color: #666; text-align: center;">
          Thank you for choosing Hauln&apos; Heavy!
        </div>
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
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper function to build pickup/delivery strings with proper logic
  const buildScheduleString = (scheduleData: any, type: 'pickup' | 'delivery') => {
    if (!scheduleData) return 'Not specified';

    const { dateType, timeType, specificDate, specificTime, dateRange, timeRange } = scheduleData;
    
    let dateStr = '';
    let timeStr = '';

    // Handle date based on dateType
    if (dateType === 'between' && dateRange?.start && dateRange?.end) {
      const startDate = formatDate(dateRange.start);
      const endDate = formatDate(dateRange.end);
      
      // If dates are the same, just show one date
      if (startDate === endDate) {
        dateStr = startDate;
      } else {
        dateStr = `${startDate}-${endDate}`;
      }
    } else if (specificDate) {
      dateStr = formatDate(specificDate);
    }

    // Handle time based on timeType
    if (timeType === 'between' && timeRange?.start && timeRange?.end) {
      timeStr = ` between ${timeRange.start} - ${timeRange.end}`;
    } else if (specificTime) {
      timeStr = ` at ${specificTime}`;
    }

    // Handle date type modifiers
    if (dateType === 'before') {
      return `Before ${dateStr}${timeStr}`;
    } else if (dateType === 'after') {
      return `After ${dateStr}${timeStr}`;
    } else {
      // 'on' or 'between' or default
      return `${dateStr}${timeStr}`;
    }
  };

  // Build pickup and delivery strings
  const pickupStr = buildScheduleString(estimateData.scheduling?.pickup, 'pickup');
  const deliveryStr = buildScheduleString(estimateData.scheduling?.delivery, 'delivery');

  // Build contact information strings
  const buildContactString = (contactInfo: any, location: 'pickup' | 'delivery') => {
    if (!contactInfo) return '';
    
    const isContact = location === 'pickup' ? contactInfo.isContactAtPickup : contactInfo.isContactAtDropoff;
    const contactName = location === 'pickup' ? contactInfo.pickupContactName : contactInfo.dropoffContactName;
    const contactPhone = location === 'pickup' ? contactInfo.pickupContactPhone : contactInfo.dropoffContactPhone;
    
    if (isContact === true) {
      return 'Customer will be contact';
    } else if (isContact === false && contactName && contactPhone) {
      return `${contactName} (${contactPhone})`;
    }
    return '';
  };

  const pickupContact = buildContactString(estimateData.scheduling?.contactInfo, 'pickup');
  const deliveryContact = buildContactString(estimateData.scheduling?.contactInfo, 'delivery');

  // Get item details
  const item = estimateData.equipment || estimateData.freight;
  const lengthFt = item?.dimensions?.length?.feet || 0;
  const lengthIn = item?.dimensions?.length?.inches || 0;
  const widthFt = item?.dimensions?.width?.feet || 0;
  const widthIn = item?.dimensions?.width?.inches || 0;
  const heightFt = item?.dimensions?.height?.feet || 0;
  const heightIn = item?.dimensions?.height?.inches || 0;
  const weight = item?.weight || 0;
  
  const dimensionsStr = `${lengthFt}'${lengthIn}" L × ${widthFt}'${widthIn}" W × ${heightFt}'${heightIn}" H | ${weight.toLocaleString()} lbs`;

  const itemName = item?.shippingItem 
    ? item.shippingItem 
    : `${item?.make || ''} ${item?.model || ''}`.trim();
  
  const itemYear = item?.year ? ` (${item.year})` : '';

  // Build value and budget string
  const valueBudgetParts = [];
  if (estimateData.additionalInfo?.itemValue) valueBudgetParts.push(`Value: $${estimateData.additionalInfo.itemValue.toLocaleString()}`);
  if (estimateData.additionalInfo?.targetBudget) valueBudgetParts.push(`<strong>Budget: $${estimateData.additionalInfo.targetBudget.toLocaleString()}</strong>`);
  const valueBudgetStr = valueBudgetParts.join(' | ');

  // Build transport details string
  const transportParts = [];
  if (estimateData.additionalInfo?.loadingMethod) transportParts.push(`Loading: ${estimateData.additionalInfo.loadingMethod}`);
  if (estimateData.additionalInfo?.unloadingMethod) transportParts.push(`Unloading: ${estimateData.additionalInfo.unloadingMethod}`);
  if (estimateData.additionalInfo?.handlingInstructions) transportParts.push(`Handling: ${estimateData.additionalInfo.handlingInstructions}`);
  const transportStr = transportParts.join(' | ');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="color: #eab308; background: #1f2937; padding: 12px; text-align: center;">
        <div style="font-size: 14px; font-weight: bold;">NEW ESTIMATE REQUEST</div>
        <div style="font-size: 16px; font-weight: bold; letter-spacing: 0.5px; margin-top: 4px;">ESTIMATE #${estimateData.estimateId}</div>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 12px; background: #f9fafb; font-size: 13px; line-height: 1.4;">
        
        <!-- Two Column Layout: Customer & Locations -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
          <tr>
            <td style="width: 50%; padding: 8px; vertical-align: top; background: #ffffff; border-right: 1px solid #e0e0e0;">
              <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px;">CUSTOMER</div>
              <div style="font-size: 13px; line-height: 1.5;">
                <div><strong>${senderName}</strong></div>
                <div style="color: #666;">${senderEmail}</div>
                <div style="font-size: 11px; color: #999; margin-top: 4px;">Category: ${estimateData.category}</div>
              </div>
            </td>
            <td style="width: 50%; padding: 8px; vertical-align: top; background: #ffffff;">
              <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px;">LOCATIONS</div>
              <div style="font-size: 12px; line-height: 1.5;">
                <div><strong>Pickup:</strong> ${estimateData.locations?.pickup?.address || 'Not specified'}</div>
                <div style="margin-top: 4px;"><strong>Delivery:</strong> ${estimateData.locations?.dropoff?.address || 'Not specified'}</div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Equipment/Freight Section -->
        <div style="background: #ffffff; padding: 10px; margin-bottom: 8px; border-radius: 4px;">
          <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px;">${estimateData.equipment ? 'EQUIPMENT' : 'FREIGHT'}</div>
          <div style="font-size: 14px; font-weight: bold; color: #1f2937; margin-bottom: 2px;">${itemName}${itemYear}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${dimensionsStr}</div>
          ${valueBudgetStr ? `<div style="font-size: 12px; color: #666;">${valueBudgetStr}</div>` : ''}
        </div>

        <!-- Schedule Section -->
        <div style="background: #ffffff; padding: 10px; margin-bottom: 8px; border-radius: 4px;">
          <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px;">SCHEDULE</div>
          <div style="font-size: 13px; line-height: 1.6;">
            <strong>Pickup:</strong> ${pickupStr}${pickupContact ? `<br><strong>Pickup Contact:</strong> ${pickupContact}` : ''}<br>
            <strong>Delivery:</strong> ${deliveryStr}${deliveryContact ? `<br><strong>Delivery Contact:</strong> ${deliveryContact}` : ''}
          </div>
        </div>

        <!-- Transport Details Section -->
        ${transportStr ? `
        <div style="background: #ffffff; padding: 10px; margin-bottom: 8px; border-radius: 4px;">
          <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px;">TRANSPORT DETAILS</div>
          <div style="font-size: 12px; color: #666;">${transportStr}</div>
        </div>
        ` : ''}

        <!-- Cost Breakdown -->
        <div style="background: #ffffff; padding: 10px; margin-bottom: 8px; border-radius: 4px;">
          <div style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 6px;">COST BREAKDOWN</div>
          <table style="width: 100%; font-size: 12px; line-height: 1.8;">
            <tr><td>Base Transport:</td><td style="text-align: right;">$${estimateData.estimateResult.baseCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>
            <tr><td>Fuel Surcharge:</td><td style="text-align: right;">$${estimateData.estimateResult.fuelSurcharge.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>
            ${estimateData.estimateResult.oversizeFee > 0 ? `<tr><td>Oversize Fee:</td><td style="text-align: right;">$${estimateData.estimateResult.oversizeFee.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>` : ''}
            ${estimateData.estimateResult.hazmatFee > 0 ? `<tr><td>Hazmat Fee:</td><td style="text-align: right;">$${estimateData.estimateResult.hazmatFee.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>` : ''}
            ${estimateData.estimateResult.additionalFees > 0 ? `<tr><td>Additional:</td><td style="text-align: right;">$${estimateData.estimateResult.additionalFees.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>` : ''}
            <tr style="border-top: 2px solid #e0e0e0;">
              <td style="padding-top: 6px; font-size: 14px; font-weight: bold;">TOTAL:</td>
              <td style="padding-top: 6px; text-align: right; font-size: 16px; font-weight: bold; color: #eab308;">$${estimateData.estimateResult.totalEstimate.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
          </table>
        </div>


        <!-- Footer -->
        <div style="margin-top: 8px; padding: 6px; font-size: 11px; color: #999; text-align: center;">
          <em>Estimate sent to customer via email</em>
        </div>
      </div>
    </div>
  `;
}
