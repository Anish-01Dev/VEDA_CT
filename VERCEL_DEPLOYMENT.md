# Vercel Deployment Guide for Vaidyāna

This guide will help you deploy your Vaidyāna healthcare application to Vercel.

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Environment Variables**: Prepare your API keys and configuration

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings

3. **Configure Project Settings**
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)
   - **Root Directory**: `.` (default)

4. **Set Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_GOOGLE_AI_STUDIO_KEY=your_api_key_here
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_DEV_MODE=false
   VITE_APP_NAME=Vaidyāna
   VITE_APP_VERSION=1.0.0
   VITE_ENABLE_VOICE=true
   VITE_ENABLE_OCR=true
   VITE_ENABLE_OFFLINE=true
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_GOOGLE_AI_STUDIO_KEY
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   # ... add other variables as needed
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Configuration Files

### vercel.json
The project includes a `vercel.json` configuration file with:
- Build settings
- Routing rules for client-side routing (React Router)
- Cache headers for static assets
- Framework preset for Vite

### Environment Variables

Create a `.env.local` file for local development (don't commit this):
```env
VITE_GOOGLE_AI_STUDIO_KEY=your_api_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_DEV_MODE=true
VITE_APP_NAME=Vaidyāna
VITE_APP_VERSION=1.0.0
VITE_ENABLE_VOICE=true
VITE_ENABLE_OCR=true
VITE_ENABLE_OFFLINE=true
```

## Post-Deployment

### Custom Domain (Optional)
1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Environment Variables for Different Environments
Vercel allows you to set different environment variables for:
- **Production**: `vercel --prod`
- **Preview**: Automatic for each branch/PR
- **Development**: Local `.env.local` file

### Monitoring
- Check deployment logs in Vercel dashboard
- Monitor build times and errors
- Set up Vercel Analytics (optional)

## Troubleshooting

### Permission Denied Error
If you see `sh: line 1: /vercel/path0/node_modules/.bin/vite: Permission denied`:
1. **Solution**: The `vercel.json` is now configured to use `npm run build` and `npm ci`
2. **Verify**: Make sure `package.json` has the `engines` field specifying Node >=18
3. **Clear cache**: In Vercel dashboard, go to Settings → General → Clear Build Cache
4. **Redeploy**: Push a new commit or manually redeploy

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible (18+)
- Make sure `package-lock.json` is committed to your repository

### Routing Issues
- The `vercel.json` includes rewrites for client-side routing
- All routes should serve `index.html` for React Router to work

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### Large Bundle Size
- Consider code splitting for large chunks
- Enable compression in Vercel settings
- Use dynamic imports for heavy dependencies

## Performance Optimization

### Vercel Optimizations
- **Automatic HTTPS**: Enabled by default
- **CDN**: Global content delivery network
- **Edge Functions**: For serverless functions (if needed)
- **Image Optimization**: Automatic image optimization

### Build Optimizations
- Code splitting is already configured
- Assets are automatically minified
- Gzip compression is enabled

## Security

### API Keys
- Never commit API keys to Git
- Use Vercel environment variables
- Rotate keys regularly
- Use different keys for development and production

### HTTPS
- Vercel provides automatic HTTPS
- SSL certificates are managed automatically
- Force HTTPS redirects are enabled

## Support

For issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Check build logs in Vercel dashboard
3. Verify environment variables are set correctly
4. Ensure all dependencies are compatible

## Next Steps

After successful deployment:
1. Test all features in production
2. Set up monitoring and analytics
3. Configure custom domain (optional)
4. Set up CI/CD for automatic deployments
5. Enable Vercel Analytics for performance monitoring

