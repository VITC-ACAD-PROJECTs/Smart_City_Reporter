
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Use the access token to fetch user info from Google's userinfo endpoint
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Google userinfo API error:', response.status, await response.text());
      return NextResponse.json({ error: 'Failed to fetch user info from Google' }, { status: 401 });
    }

    const userInfo = await response.json();

    if (!userInfo.sub) {
      return NextResponse.json({ error: 'Invalid user info' }, { status: 401 });
    }

    const user = {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Google token verification failed:', error);
    return NextResponse.json({ error: 'Token verification failed', details: error.message }, { status: 401 });
  }
}
