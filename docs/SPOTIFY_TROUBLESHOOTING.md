# Spotify "Invalid Client" Error - Troubleshooting Guide

If you're seeing an "invalid client" error when trying to connect to Spotify, follow these steps:

## Common Causes

### 1. Missing Environment Variables

**Check your `.env.local` file has these variables:**

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**For production:**
```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=https://yourdomain.com/api/spotify/callback
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Redirect URI Mismatch

**The redirect URI MUST match exactly in both places:**

1. **In your `.env.local` file:**
   - `SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback`

2. **In Spotify Developer Dashboard:**
   - Go to your app settings
   - Under "Redirect URIs", add: `http://localhost:3000/api/spotify/callback`
   - Click "Add" and then "Save"

**Important:**
- No trailing slashes
- Must match protocol (http vs https)
- Must match port number
- Must match path exactly

### 3. Incorrect Client ID or Secret

**Verify your credentials:**

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app
3. Copy the **Client ID** exactly (no extra spaces)
4. Click "Show client secret" and copy it exactly
5. Paste into `.env.local` with no quotes or extra spaces

**Common mistakes:**
- Extra spaces before/after the value
- Quotes around the value (don't use quotes)
- Copying the wrong app's credentials
- Using an old/revoked secret

### 4. Environment Variables Not Loaded

**After adding/updating `.env.local`:**

1. **Stop your development server** (Ctrl+C)
2. **Restart it**: `npm run dev`
3. Environment variables are only loaded when the server starts

**For production (Vercel/Netlify/etc):**
- Add environment variables in your hosting platform's dashboard
- Redeploy your application

### 5. Check Your Spotify App Settings

**In Spotify Developer Dashboard:**

1. Go to your app
2. Click "Edit Settings"
3. Verify:
   - **Redirect URIs** includes: `http://localhost:3000/api/spotify/callback`
   - **App is not in development mode** (if you need to add more redirect URIs)
   - **Website** is set (can be placeholder)

## Step-by-Step Fix

1. **Verify environment variables exist:**
   ```bash
   # Check if variables are set (don't run this, just verify manually)
   # Make sure .env.local has all 4 variables
   ```

2. **Check Spotify Dashboard:**
   - Go to https://developer.spotify.com/dashboard
   - Click your app
   - Click "Edit Settings"
   - Under "Redirect URIs", ensure you have:
     - `http://localhost:3000/api/spotify/callback` (for development)
     - `https://yourdomain.com/api/spotify/callback` (for production)
   - Click "Save"

3. **Restart your dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Try connecting again:**
   - Go to Funeral Preferences or Playlist page
   - Click "Connect to Spotify"
   - Should redirect to Spotify login

## Testing Your Configuration

You can test if your credentials are correct by checking the authorization URL:

1. The app will generate a URL like:
   ```
   https://accounts.spotify.com/authorize?client_id=YOUR_ID&redirect_uri=...
   ```

2. If you see "invalid_client" when visiting that URL, it means:
   - Client ID is wrong, OR
   - Redirect URI doesn't match

## Still Having Issues?

1. **Double-check the redirect URI:**
   - Copy it exactly from `.env.local`
   - Paste it exactly into Spotify Dashboard
   - No trailing slashes, no spaces

2. **Verify Client ID:**
   - Copy from Spotify Dashboard
   - Paste into `.env.local` (no quotes)
   - Restart server

3. **Check server logs:**
   - Look for any error messages when clicking "Connect"
   - Check browser console for errors

4. **Try creating a new Spotify app:**
   - Sometimes apps get into a bad state
   - Create a fresh app and use new credentials

## Quick Checklist

- [ ] `.env.local` has `SPOTIFY_CLIENT_ID`
- [ ] `.env.local` has `SPOTIFY_CLIENT_SECRET`
- [ ] `.env.local` has `SPOTIFY_REDIRECT_URI`
- [ ] `.env.local` has `NEXT_PUBLIC_SITE_URL`
- [ ] Redirect URI in `.env.local` matches Spotify Dashboard exactly
- [ ] No quotes around values in `.env.local`
- [ ] No extra spaces in values
- [ ] Server restarted after adding variables
- [ ] Spotify app is active (not deleted)

