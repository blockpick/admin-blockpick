import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.blockpick.net';

/**
 * Login API Route Handler
 * Proxies authentication requests to the backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Try different possible endpoints
    const endpoints = [
      '/api/admin/login',
      '/api/auth/login',
      '/admin/login',
      '/v1/auth/login',
      '/v1/admin/login',
    ];

    let response;
    let lastError = null;

    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${API_BASE_URL}${endpoint}`);
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          console.log(`Success with endpoint: ${endpoint}`);
          break;
        }

        const errorData = await response.json().catch(() => ({}));
        console.log(`Failed with ${endpoint}:`, response.status, errorData);
        lastError = errorData;
      } catch (err) {
        console.log(`Error trying ${endpoint}:`, err);
        lastError = err;
      }
    }

    if (!response || !response.ok) {
      console.error('All endpoints failed. Last error:', lastError);
      return NextResponse.json(
        { error: 'Unable to connect to authentication service. Please check the API configuration.' },
        { status: 503 }
      );
    }

    const data = await response.json();

    // Return the tokens from the backend
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

