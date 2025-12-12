import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/spotify/callback`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    const error = searchParams.get('error');

    // Parse state to get userId and returnUrl
    let userId: string;
    let returnUrl = '/dashboard/funeral-preferences';
    
    try {
      if (stateParam) {
        const state = JSON.parse(stateParam);
        userId = state.userId;
        returnUrl = state.returnUrl || returnUrl;
      } else {
        // Fallback for old format where state was just userId
        userId = stateParam || '';
      }
    } catch {
      // If state is not JSON, treat it as userId (backward compatibility)
      userId = stateParam || '';
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    if (error) {
      return NextResponse.redirect(`${baseUrl}${returnUrl}?spotify_error=${error}`);
    }

    if (!code || !userId) {
      return NextResponse.redirect(`${baseUrl}${returnUrl}?spotify_error=missing_params`);
    }

    // Validate credentials
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.error('Spotify credentials missing in callback');
      return NextResponse.redirect(`${baseUrl}${returnUrl}?spotify_error=not_configured`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Spotify token exchange error:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData,
        redirectUri: SPOTIFY_REDIRECT_URI,
        hasClientId: !!SPOTIFY_CLIENT_ID,
      });
      
      // Provide more specific error messages
      if (tokenResponse.status === 400 && errorData.error === 'invalid_client') {
        return NextResponse.redirect(`${baseUrl}${returnUrl}?spotify_error=invalid_client`);
      }
      
      throw new Error(`Failed to exchange code for token: ${errorData.error || tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Store tokens in database
    const supabase = createServerClient();
    await supabase
      .from('spotify_tokens')
      .upsert({
        user_id: userId,
        access_token,
        refresh_token,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    return NextResponse.redirect(`${baseUrl}${returnUrl}?spotify_connected=true`);
  } catch (error: any) {
    console.error('Spotify callback error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    // Try to get returnUrl from state if available
    let returnUrl = '/dashboard/funeral-preferences';
    try {
      const stateParam = new URL(request.url).searchParams.get('state');
      if (stateParam) {
        const state = JSON.parse(stateParam);
        returnUrl = state.returnUrl || returnUrl;
      }
    } catch {
      // Use default if parsing fails
    }
    return NextResponse.redirect(`${baseUrl}${returnUrl}?spotify_error=connection_failed`);
  }
}

