import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      environment: {
        hasResendKey: !!process.env.RESEND_API_KEY,
        hasClientEmail: !!process.env.CLIENT_EMAIL,
        resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
        clientEmail: process.env.CLIENT_EMAIL,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check environment' },
      { status: 500 }
    );
  }
}
