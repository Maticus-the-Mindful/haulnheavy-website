import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== ADDRESS AUTOCOMPLETE API CALLED ===');
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const countryCode = searchParams.get('country') || 'us';
    
    console.log('Query:', query);
    console.log('Country:', countryCode);
    
    if (!query || query.trim().length < 2) {
      console.log('Query too short, returning empty suggestions');
      return NextResponse.json({ suggestions: [] });
    }

    // Get API key from environment variables
    const apiKey = process.env.GEOAPIFY_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.error('GEOAPIFY_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Address service not configured' },
        { status: 500 }
      );
    }

    // Build Geoapify API URL
    const apiUrl = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
    apiUrl.searchParams.set('text', query.trim());
    apiUrl.searchParams.set('filter', `countrycode:${countryCode}`);
    apiUrl.searchParams.set('limit', '8'); // Limit to 8 suggestions for better UX
    apiUrl.searchParams.set('format', 'json');
    apiUrl.searchParams.set('apiKey', apiKey);

    console.log('Making request to Geoapify:', apiUrl.toString());

    // Make request to Geoapify
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geoapify API error:', response.status, response.statusText);
      console.error('Error response body:', errorText);
      return NextResponse.json(
        { 
          error: 'Address service unavailable',
          status: response.status,
          statusText: response.statusText,
          response: errorText
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('Geoapify API Response:', JSON.stringify(data, null, 2));
    console.log('Features count:', data.features?.length || 0);
    console.log('Response type:', typeof data);
    console.log('Response keys:', Object.keys(data));
    
    // Transform Geoapify response to our format
    const suggestions = data.features?.map((feature: any) => ({
      id: feature.properties.place_id || Math.random().toString(36),
      address: feature.properties.formatted,
      addressLine1: feature.properties.address_line1,
      addressLine2: feature.properties.address_line2,
      city: feature.properties.city,
      state: feature.properties.state,
      postcode: feature.properties.postcode,
      country: feature.properties.country,
      confidence: feature.properties.rank?.confidence || 0,
      lat: feature.properties.lat,
      lon: feature.properties.lon,
      resultType: feature.properties.result_type,
      raw: feature.properties // Keep original for debugging
    })) || [];

    console.log(`Found ${suggestions.length} address suggestions for query: "${query}"`);

    return NextResponse.json({ 
      suggestions,
      query: query.trim(),
      country: countryCode
    });

  } catch (error) {
    console.error('Address autocomplete error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address suggestions' },
      { status: 500 }
    );
  }
}
