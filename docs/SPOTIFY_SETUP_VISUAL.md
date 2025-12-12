# Spotify App Creation - Step by Step Visual Guide

## Step 1: Access the Dashboard

1. Go to: **https://developer.spotify.com/dashboard**
2. **Log in** with your Spotify account (use the same account you use for Spotify)
3. After logging in, you should see the **Dashboard** page

## Step 2: Create Your App

If you see the Dashboard page, you should see:

### Option A: If you have NO apps yet
- You'll see a message like "You don't have any apps yet"
- Click the **"Create app"** button (usually a green button in the center or top right)

### Option B: If you already have apps
- You'll see a list of your existing apps
- Click the **"Create app"** button (usually in the top right corner, green button)

## Step 3: Fill Out the App Form

When you click "Create app", a form will appear with these fields:

1. **App name**: Enter "Going Home" (or any name you prefer)
2. **App description**: Enter something like "Personal legacy planning application"
3. **Website**: Enter your website URL (can be placeholder like `https://goinghome.app`)
4. **Redirect URI**: This is CRITICAL - enter:
   - For development: `http://localhost:3000/api/spotify/callback`
   - For production: `https://yourdomain.com/api/spotify/callback`
   - You can add multiple redirect URIs by clicking "Add" or "+"
5. **Which API/SDKs are you planning to use?**: Check "Web API"
6. **What are you building?**: Select "Web app" or "Website"
7. **Check the agreement box**: Read and accept the Developer Terms of Service

## Step 4: Save Your App

- Click **"Save"** or **"Create"** button
- Your app will be created and you'll be taken to the app details page

## Step 5: Get Your Credentials

On the app details page, you'll see:

1. **Client ID**: A long string of characters - copy this
2. **Client Secret**: Click "Show client secret" or "View client secret" button
   - Copy the secret (it will only show once, so save it!)
   - This is your `SPOTIFY_CLIENT_SECRET`

## Step 6: Add Redirect URIs (if needed)

1. Click **"Edit Settings"** button on your app page
2. Scroll to **"Redirect URIs"** section
3. Click **"Add"** or **"+"** to add more URIs
4. Add both:
   - `http://localhost:3000/api/spotify/callback` (development)
   - `https://yourdomain.com/api/spotify/callback` (production)
5. Click **"Add"** after each one
6. Click **"Save"** at the bottom

## Troubleshooting: Can't Find "Create App" Button?

If you don't see a "Create app" button:

1. **Make sure you're logged in**: Check the top right corner - you should see your Spotify profile/name
2. **Check the URL**: Make sure you're at `https://developer.spotify.com/dashboard` (not just `developer.spotify.com`)
3. **Try a different browser**: Sometimes browser extensions can interfere
4. **Clear cache**: Try clearing your browser cache or using incognito mode
5. **Check if you need to verify your account**: Spotify may require email verification first

## Alternative: Direct Dashboard Link

Try this direct link after logging in:
**https://developer.spotify.com/dashboard/applications**

This should take you directly to the applications/dashboard page.

## Still Having Issues?

If you still can't see the dashboard or create button:

1. Make sure you have a **Spotify account** (free or premium)
2. Try accessing from a **desktop browser** (mobile can sometimes have issues)
3. Check if your **ad blocker** is interfering
4. Try **disabling browser extensions** temporarily

## What You Should See

After successfully creating an app, you should see a page with:
- Your app name at the top
- Client ID (visible)
- Client Secret (hidden, click to reveal)
- Settings button
- Redirect URIs section
- App details

This is where you'll get your credentials for the `.env` file!

