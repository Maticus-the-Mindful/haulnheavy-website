import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { estimateData, recipientPhone, recipientName } = body;

    // Validate required fields
    if (!recipientPhone) {
      return NextResponse.json(
        { error: 'Recipient phone number is required' },
        { status: 400 }
      );
    }

    if (!estimateData || !estimateData.estimateResult) {
      return NextResponse.json(
        { error: 'Estimate data is required' },
        { status: 400 }
      );
    }

    // Check for Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error('Twilio credentials not configured');
      return NextResponse.json(
        { error: 'SMS service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Import Twilio (will need to install: npm install twilio)
    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);

    // Format the estimate for SMS
    const { estimateResult, equipment, freight, locations } = estimateData;
    const itemDescription = equipment?.make && equipment?.model
      ? `${equipment.make} ${equipment.model}`
      : freight?.shippingItem || 'Item';

    const pickupCity = locations?.pickup?.address?.split(',')[0] || 'Pickup Location';
    const dropoffCity = locations?.dropoff?.address?.split(',')[0] || 'Dropoff Location';

    const estimateAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(estimateResult.totalEstimate);

    // Create SMS message (keep under 160 characters if possible)
    const smsMessage = `Haul'n Heavy Estimate: ${estimateAmount}
Item: ${itemDescription}
Route: ${pickupCity} → ${dropoffCity}
*Additional fees may apply
Questions? Call 701-870-2144`;

    // Send SMS via Twilio
    const message = await client.messages.create({
      body: smsMessage,
      from: twilioPhoneNumber,
      to: recipientPhone
    });

    console.log('SMS sent successfully:', message.sid);

    return NextResponse.json({
      success: true,
      messageSid: message.sid,
      message: 'Estimate sent via SMS successfully'
    });

  } catch (error: any) {
    console.error('Error sending SMS:', error);

    // Handle Twilio-specific errors
    if (error.code) {
      return NextResponse.json(
        { error: `SMS Error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send SMS. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
