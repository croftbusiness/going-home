# How to Set Up Your OpenAI API Key

## ⚠️ IMPORTANT SECURITY WARNING

If you've shared your API key publicly, you **must regenerate it** immediately:

1. Go to: https://platform.openai.com/api-keys
2. Delete the exposed key
3. Create a new key
4. Never share your API key publicly again

## Setup Steps

1. **Create a `.env.local` file** in your project root (if it doesn't exist)

2. **Add your OpenAI API key** to `.env.local`:

```env
OPENAI_API_KEY=sk-proj-your_new_key_here
```

**Important**: Use your NEW key (after regenerating the exposed one), not the one you shared.

3. **Add other required environment variables** if needed:

```env
# Supabase (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI API Key
OPENAI_API_KEY=sk-proj-your_new_key_here
```

4. **Restart your Next.js dev server** for the changes to take effect:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

## Verify It's Working

1. Open your app at `http://localhost:3000`
2. Go to the Dashboard
3. You should see the AI Checklist component
4. Try the "AI Generate" button on the Letters page

If you see errors about the API key, check:
- The key is correctly formatted in `.env.local`
- The dev server was restarted after adding the key
- The key has the correct permissions on OpenAI

## Security Best Practices

✅ **DO:**
- Store keys in `.env.local` (already in `.gitignore`)
- Use different keys for development and production
- Regenerate keys if exposed
- Use environment variables in Vercel for production

❌ **DON'T:**
- Commit `.env.local` to git (it's already ignored)
- Share API keys in chat, emails, or public places
- Hardcode keys in your source code
- Use the same key for multiple projects without limits

## For Production (Vercel)

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add `OPENAI_API_KEY` with your production key
4. Redeploy your application

Your `.env.local` file is already protected by `.gitignore`, so it won't be committed to git.




