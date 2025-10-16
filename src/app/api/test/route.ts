import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'TEST ROUTE WORKING - VERSION 4.0', 
    timestamp: new Date().toISOString() 
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ 
    message: 'POST TEST ROUTE WORKING - VERSION 4.0',
    receivedData: body,
    timestamp: new Date().toISOString() 
  });
}