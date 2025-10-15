import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { contactInfo, estimate, estimateData } = await request.json();

    if (!contactInfo || !estimate || !estimateData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, we'll simulate sending emails
    // In production, you would integrate with Resend, SendGrid, or another email service
    
    console.log('=== USER EMAIL WOULD BE SENT TO:', contactInfo.email);
    console.log('=== CONTACT INFO:', JSON.stringify(contactInfo, null, 2));
    console.log('=== ESTIMATE DATA:', JSON.stringify(estimate, null, 2));
    console.log('=== FORM DATA:', JSON.stringify(estimateData, null, 2));
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TODO: Replace with actual email service integration
    // const resend = new Resend(process.env.RESEND_API_KEY);
    
    // User confirmation email
    const userEmailContent = generateUserEmailContent(contactInfo, estimate, estimateData);
    console.log('=== USER EMAIL CONTENT:', userEmailContent);
    
    // Business email to Evan
    const businessEmailContent = generateBusinessEmailContent(contactInfo, estimate, estimateData);
    console.log('=== BUSINESS EMAIL CONTENT:', businessEmailContent);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Emails sent successfully',
        userEmail: userEmailContent,
        businessEmail: businessEmailContent
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}

function generateUserEmailContent(contactInfo: any, estimate: any, estimateData: any) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return {
    to: contactInfo.email,
    subject: `Your Hauln' Heavy Estimate - ${formatCurrency(estimate.totalEstimate)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #fcd001; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Hauln' Heavy</h1>
          <p style="color: #333; margin: 10px 0 0 0;">Your Freight Estimate</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333;">Hello ${contactInfo.firstName}!</h2>
          <p style="color: #666; margin-bottom: 30px;">Thank you for requesting an estimate from Hauln' Heavy. Here are the details of your freight estimate:</p>
          
          <h3 style="color: #333;">Estimate Summary</h3>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Cost Breakdown</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Base Cost:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${formatCurrency(estimate.baseCost)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Fuel Surcharge:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(estimate.fuelSurcharge)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Oversize Fee:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(estimate.oversizeFee)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Hazmat Fee:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(estimate.hazmatFee)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Additional Fees:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(estimate.additionalFees)}</td>
              </tr>
              <tr style="background-color: #fcd001;">
                <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">Total Estimate:</td>
                <td style="padding: 12px 0; font-weight: bold; font-size: 18px; text-align: right;">${formatCurrency(estimate.totalEstimate)}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #333;">Your Contact Information</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${contactInfo.firstName} ${contactInfo.lastName}</p>
            <p><strong>Email:</strong> ${contactInfo.email}</p>
            ${contactInfo.company ? `<p><strong>Company:</strong> ${contactInfo.company}</p>` : ''}
            <p><strong>Phone:</strong> ${contactInfo.phone}</p>
          </div>

          <h3 style="color: #333;">Your Request Details</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${generateRequestDetailsHTML(estimateData)}
          </div>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">Important Disclaimer</h4>
            <p style="color: #856404; margin: 0;">${estimate.disclaimer}</p>
          </div>

          <p style="color: #666; font-size: 14px;">
            Thank you for choosing Hauln' Heavy! Our team will contact you shortly to discuss your freight needs and finalize the details.
          </p>
        </div>
      </div>
    `
  };
}

function generateBusinessEmailContent(contactInfo: any, estimate: any, estimateData: any) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return {
    to: 'evan@haulnheavy.com', // Evan's business email
    subject: `New Estimate Request - ${estimateData.category === 'equipment' ? 'Equipment' : 'Freight'} - ${contactInfo.firstName} ${contactInfo.lastName} - ${formatCurrency(estimate.totalEstimate)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #fcd001; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Hauln' Heavy</h1>
          <p style="color: #333; margin: 10px 0 0 0;">New Estimate Request</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333;">New Estimate Request</h2>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1976d2;"><strong>Customer:</strong> ${contactInfo.firstName} ${contactInfo.lastName}</p>
            <p style="margin: 5px 0 0 0; color: #1976d2;"><strong>Email:</strong> ${contactInfo.email}</p>
            <p style="margin: 5px 0 0 0; color: #1976d2;"><strong>Phone:</strong> ${contactInfo.phone}</p>
            ${contactInfo.company ? `<p style="margin: 5px 0 0 0; color: #1976d2;"><strong>Company:</strong> ${contactInfo.company}</p>` : ''}
            <p style="margin: 5px 0 0 0; color: #1976d2;"><strong>Request Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Estimate Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Base Cost:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(estimate.baseCost)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Fuel Surcharge:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(estimate.fuelSurcharge)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Oversize Fee:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(estimate.oversizeFee)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Hazmat Fee:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(estimate.hazmatFee)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Additional Fees:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(estimate.additionalFees)}</td>
              </tr>
              <tr style="background-color: #fcd001;">
                <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">Total Estimate:</td>
                <td style="padding: 12px 0; font-weight: bold; font-size: 18px; text-align: right;">${formatCurrency(estimate.totalEstimate)}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #333;">Customer Request Details</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${generateRequestDetailsHTML(estimateData)}
          </div>

          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #155724; margin-top: 0;">Next Steps</h4>
            <ul style="color: #155724; margin: 0; padding-left: 20px;">
              <li>Contact ${contactInfo.firstName} ${contactInfo.lastName} at ${contactInfo.email} or ${contactInfo.phone}</li>
              <li>Review estimate details and adjust if needed</li>
              <li>Confirm pickup/delivery arrangements</li>
              <li>Send final quote and booking confirmation</li>
            </ul>
          </div>
        </div>
      </div>
    `
  };
}

function generateRequestDetailsHTML(estimateData: any) {
  let html = '';
  
  if (estimateData.category === 'equipment' && estimateData.equipment) {
    const eq = estimateData.equipment;
    html += `
      <p><strong>Category:</strong> Equipment & Machinery</p>
      <p><strong>Equipment:</strong> ${eq.year} ${eq.make} ${eq.model}</p>
      <p><strong>Type:</strong> ${eq.type}</p>
      <p><strong>Quantity:</strong> ${eq.quantity}</p>
      <p><strong>Dimensions:</strong> ${eq.dimensions.length.feet}'${eq.dimensions.length.inches}" × ${eq.dimensions.width.feet}'${eq.dimensions.width.inches}" × ${eq.dimensions.height.feet}'${eq.dimensions.height.inches}"</p>
      <p><strong>Weight:</strong> ${eq.weight} lbs</p>
    `;
  } else if (estimateData.category === 'freight' && estimateData.freight) {
    const fr = estimateData.freight;
    html += `
      <p><strong>Category:</strong> Freight</p>
      <p><strong>Item:</strong> ${fr.shippingItem}</p>
      <p><strong>Quantity:</strong> ${fr.quantity}</p>
      <p><strong>Dimensions:</strong> ${fr.dimensions.length.feet}'${fr.dimensions.length.inches}" × ${fr.dimensions.width.feet}'${fr.dimensions.width.inches}" × ${fr.dimensions.height.feet}'${fr.dimensions.height.inches}"</p>
      <p><strong>Weight:</strong> ${fr.weight} lbs</p>
      <p><strong>Hazmat:</strong> ${fr.hasHazmat ? 'Yes' : 'No'}</p>
      <p><strong>Transport Method:</strong> ${fr.transportMethod}</p>
    `;
  }

  if (estimateData.locations) {
    html += `
      <p><strong>Pickup:</strong> ${estimateData.locations.pickup?.address || 'Not specified'}</p>
      <p><strong>Delivery:</strong> ${estimateData.locations.dropoff?.address || 'Not specified'}</p>
    `;
  }

  if (estimateData.additionalInfo) {
    const ai = estimateData.additionalInfo;
    if (ai.handlingInstructions) {
      html += `<p><strong>Handling Instructions:</strong> ${ai.handlingInstructions}</p>`;
    }
    if (ai.targetBudget) {
      html += `<p><strong>Target Budget:</strong> $${ai.targetBudget}</p>`;
    }
  }

  return html;
}
