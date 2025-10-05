# Vercel Deployment Guide for Redtune

## Prerequisites

Before deploying to Vercel, ensure you have:

1. A [Vercel account](https://vercel.com/signup)
2. The Vercel CLI installed (optional): `npm i -g vercel`
3. All required API keys and database credentials

## Required Environment Variables

Set these in your Vercel project settings under **Settings → Environment Variables**:

### 1. YouTube API Key
```
YOUTUBE_API_KEY=your_youtube_api_key_here
```
- Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Enable YouTube Data API v3
- Create an API key credential

### 2. Turso Database
```
TURSO_CONNECTION_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token
```
- Get from [Turso Dashboard](https://turso.tech/)
- Create a new database
- Copy the connection URL and auth token

### 3. Better Auth Secret
```
BETTER_AUTH_SECRET=your_secret_here
```
- Generate with: `openssl rand -base64 32`
- Or use any 32+ character random string

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import project in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - In the import screen, add all environment variables listed above
   - Or add them later in **Settings → Environment Variables**

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a production URL like `your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add YOUTUBE_API_KEY
   vercel env add TURSO_CONNECTION_URL
   vercel env add TURSO_AUTH_TOKEN
   vercel env add BETTER_AUTH_SECRET
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment

### 1. Update Better Auth URL
After deployment, update your Better Auth configuration if needed:
- The `BETTER_AUTH_URL` should match your production domain
- This is auto-configured but verify in Vercel environment variables

### 2. Test Your App
- Visit your deployed URL
- Test authentication (sign up/sign in)
- Test music search and playback
- Verify all features work correctly

### 3. Custom Domain (Optional)
- Go to **Settings → Domains** in Vercel
- Add your custom domain
- Follow DNS configuration instructions

## Troubleshooting

### Build Errors
- Check Vercel build logs in the deployment dashboard
- Ensure all dependencies are listed in `package.json`
- Verify Node.js version compatibility

### Environment Variables
- Double-check all env vars are set correctly
- They should be available in all environments (Production, Preview, Development)
- Restart deployment after adding new variables

### Database Connection
- Verify Turso credentials are correct
- Check database is accessible from Vercel's IP ranges
- Run migrations if needed: `npm run db:push`

### YouTube API Errors
- Verify API key is valid and active
- Check YouTube Data API v3 is enabled
- Ensure API key has no IP restrictions (or whitelist Vercel)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Turso Documentation](https://docs.turso.tech/)
- [YouTube API Documentation](https://developers.google.com/youtube/v3)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review environment variables
3. Test locally with production environment variables
4. Contact support if needed