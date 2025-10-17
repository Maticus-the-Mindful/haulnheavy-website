import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEOAPIFY_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' });
    }

    // Test with US filter
    const testUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=San%20Antonio&filter=countrycode:us&apiKey=${apiKey}`;
    console.log('Testing with US filter:', testUrl);

    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log('US Filter Response:', JSON.stringify(data, null, 2));
    
    return NextResponse.json({
      success: true,
      status: response.status,
      url: testUrl,
      response: data,
      featureCount: data.features?.length || 0
    });

  } catch (error) {
    console.error('US filter test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
