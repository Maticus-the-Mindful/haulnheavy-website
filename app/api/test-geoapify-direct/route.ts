import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DIRECT GEOAPIFY TEST ===');
    
    const apiKey = process.env.GEOAPIFY_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key:', apiKey);
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'No API key found'
      });
    }

    // Test the exact URL from the documentation
    const testUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=San%20Antonio&apiKey=${apiKey}`;
    console.log('Test URL:', testUrl);

    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log('Direct API Response:', JSON.stringify(data, null, 2));
    
    return NextResponse.json({
      success: true,
      status: response.status,
      url: testUrl,
      response: data
    });

  } catch (error) {
    console.error('Direct test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
