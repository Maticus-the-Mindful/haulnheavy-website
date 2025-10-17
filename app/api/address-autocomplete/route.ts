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

    // Build Geoapify API URL manually to avoid encoding issues
    const baseUrl = 'https://api.geoapify.com/v1/geocode/autocomplete';
    const params = new URLSearchParams();
    params.set('text', query.trim());
    params.set('limit', '8');
    params.set('format', 'json');
    params.set('apiKey', apiKey);
    
    // Build the final URL with filter parameter added manually
    const apiUrlString = `${baseUrl}?${params.toString()}&filter=countrycode:${countryCode}`;
    console.log('Final API URL:', apiUrlString);

    console.log('Making request to Geoapify:', apiUrlString);

    // Make request to Geoapify
    const response = await fetch(apiUrlString, {
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
    console.log('=== GEOAPIFY RESPONSE DEBUG ===');
    console.log('Raw response data:', JSON.stringify(data, null, 2));
    console.log('Data type:', typeof data);
    console.log('Data keys:', Object.keys(data));
    console.log('Has features property?', 'features' in data);
    console.log('Features value:', data.features);
    console.log('Features type:', typeof data.features);
    console.log('Features is array?', Array.isArray(data.features));
    console.log('Features length:', data.features?.length || 0);
    console.log('==============================');
    
    // Transform Geoapify response to our format
    // Geoapify returns data in "results" array, not "features"
    const suggestions = data.results?.map((result: any) => {
      return {
        id: result.place_id || Math.random().toString(36),
        address: result.formatted,
        addressLine1: result.address_line1,
        addressLine2: result.address_line2,
        city: result.city,
        state: result.state,
        postcode: result.postcode,
        country: result.country,
        confidence: result.rank?.confidence || 0,
        lat: result.lat,
        lon: result.lon,
        resultType: result.result_type,
        raw: result // Keep original for debugging
      };
    }) || [];

    console.log(`Found ${suggestions.length} address suggestions for query: "${query}"`);
    console.log('Processed suggestions:', suggestions);

    return NextResponse.json({ 
      suggestions,
      query: query.trim(),
      country: countryCode,
      debug: {
        totalResults: data.results?.length || 0,
        processedSuggestions: suggestions.length,
        apiUrl: apiUrlString
      }
    });

  } catch (error) {
    console.error('Address autocomplete error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address suggestions' },
      { status: 500 }
    );
  }
}
