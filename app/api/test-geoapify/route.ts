import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TESTING GEOAPIFY API ===');
    
    // Check if API key exists
    const apiKey = process.env.GEOAPIFY_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    console.log('API Key starts with:', apiKey?.substring(0, 8) || 'N/A');
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'GEOAPIFY_API_KEY not found in environment variables',
        envVars: Object.keys(process.env).filter(key => key.includes('GEOAPIFY') || key.includes('GEO'))
      });
    }

    // Test with a simple query
    const testQuery = 'San Antonio';
    const apiUrl = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
    apiUrl.searchParams.set('text', testQuery);
    apiUrl.searchParams.set('filter', 'countrycode:us');
    apiUrl.searchParams.set('limit', '5');
    apiUrl.searchParams.set('format', 'json');
    apiUrl.searchParams.set('apiKey', apiKey);

    console.log('Making request to:', apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return NextResponse.json({
        error: 'Geoapify API error',
        status: response.status,
        statusText: response.statusText,
        response: errorText
      });
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      query: testQuery,
      resultCount: data.features?.length || 0,
      results: data.features?.slice(0, 3).map((f: any) => ({
        address: f.properties.formatted,
        confidence: f.properties.rank?.confidence
      })) || [],
      fullResponse: data
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
