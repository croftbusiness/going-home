# Spotify Integration Setup Guide

This guide will walk you through setting up Spotify OAuth integration for the Going Home app.

## Prerequisites

- A Spotify account
- Access to Spotify Developer Dashboard
- Your app's redirect URI

## Step 1: Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. **Log in** with your Spotify account (use the same account you use for Spotify)
3. After logging in, you should see the **Dashboard** page
4. Look for the **"Create app"** button:
   - If you have no apps: It will be a prominent button in the center
   - If you have apps: It will be in the top right corner (green button)
5. Click **"Create app"**
6. Fill in the app details:
   - **App name**: Going Home (or your app name)
   - **App description**: Personal legacy planning app
   - **Website**: Your app's website URL (can be a placeholder)
   - **Redirect URI**: Click "Add" and enter `http://localhost:3000/api/spotify/callback` (for development)
   - **Redirect URI**: Click "Add" again and enter `https://yourdomain.com/api/spotify/callback` (for production)
   - **Which API/SDKs are you planning to use?**: Check "Web API"
   - **What are you building?**: Select "Web app" or "Website"
7. Check the agreement box (read and accept Developer Terms of Service)
8. Click **"Save"** or **"Create"**

## Step 2: Get Your Credentials

1. After creating the app, you'll be taken to the app details page
2. On this page, you'll see:
   - **Client ID**: A long string visible on the page - copy this
   - **Client Secret**: Click the **"Show client secret"** or **"View client secret"** button to reveal it
     - ⚠️ **Important**: The secret is only shown once! Copy it immediately and save it securely
3. Keep these secure - you'll need them for environment variables

**Note**: If you lose your Client Secret, you can reset it in the app settings, but you'll need to update your environment variables.

## Step 3: Configure Environment Variables

Add these to your `.env.local` file (or your hosting platform's environment variables):

```env
# Spotify OAuth Credentials
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here

# Spotify Redirect URI (must match what you set in Spotify Dashboard)
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
# For production:
# SPOTIFY_REDIRECT_URI=https://yourdomain.com/api/spotify/callback

# Your app's base URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# For production:
# NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Step 4: Create Database Table

Run the SQL migration in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/spotify_integration_schema.sql`
4. Copy and paste the SQL into the editor
5. Click **Run** to execute

This creates the `spotify_tokens` table that stores user OAuth tokens.

## Step 5: Update Spotify App Settings

Make sure your redirect URIs in Spotify Dashboard match your environment:

**Development:**
- `http://localhost:3000/api/spotify/callback`

**Production:**
- `https://yourdomain.com/api/spotify/callback`

**Important:** You can add multiple redirect URIs in the Spotify Dashboard. Add both development and production URLs.

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the Funeral Preferences page
3. In the "Song Choices" section, you should see a "Connect to Spotify" button
4. Click it and you'll be redirected to Spotify to authorize
5. After authorization, you'll be redirected back and can browse playlists/search songs

## Required Spotify Scopes

The integration requests these scopes (already configured in the code):
- `user-read-private` - Read user's profile info
- `user-read-email` - Read user's email
- `playlist-read-private` - Read user's private playlists
- `playlist-read-collaborative` - Read collaborative playlists
- `user-library-read` - Read user's saved tracks

## Troubleshooting

### Can't Find "Create App" Button?

If you don't see the dashboard or "Create app" button:

1. **Make sure you're logged in**: Check top right for your Spotify profile
2. **Verify the URL**: Should be `https://developer.spotify.com/dashboard`
3. **Try direct link**: https://developer.spotify.com/dashboard/applications
4. **Clear browser cache** or try incognito mode
5. **Disable browser extensions** that might interfere
6. **Use desktop browser** (mobile can have issues)
7. **Verify your Spotify account** is active and email is verified

### "Invalid redirect URI" error
- Make sure the redirect URI in your `.env` file exactly matches what's in Spotify Dashboard
- Check for trailing slashes or protocol mismatches (http vs https)

### "Invalid client" error
- Verify your `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are correct
- Make sure there are no extra spaces in your environment variables

### Token refresh issues
- The app automatically refreshes tokens when they expire
- If you see token errors, check the `spotify_tokens` table in Supabase
- You may need to reconnect your Spotify account

### Database errors
- Make sure you've run the `spotify_integration_schema.sql` migration
- Check that RLS policies are set up correctly
- Verify the `users` table exists (it's referenced by foreign key)

## Security Notes

- Never commit your `SPOTIFY_CLIENT_SECRET` to version control
- Use environment variables for all sensitive credentials
- The access tokens are stored encrypted in the database
- Tokens automatically expire and refresh as needed

## Production Deployment

Before deploying to production:

1. Update `SPOTIFY_REDIRECT_URI` to your production URL
2. Add the production redirect URI in Spotify Dashboard
3. Update `NEXT_PUBLIC_SITE_URL` to your production domain
4. Ensure all environment variables are set in your hosting platform
5. Test the OAuth flow in production

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check server logs for API errors
3. Verify all environment variables are set correctly
4. Ensure the database migration has been run

