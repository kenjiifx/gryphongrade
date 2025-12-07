# 🚀 Deployment Guide - Deploy GryphonGrade for FREE

This guide will help you deploy GryphonGrade to **Vercel** (completely free) in just a few minutes!

## Why Vercel?

- ✅ **100% FREE** for personal projects
- ✅ **Perfect for Next.js** - made by the same team
- ✅ **Automatic deployments** from GitHub
- ✅ **Free SSL certificate** (HTTPS)
- ✅ **Global CDN** for fast loading
- ✅ **No credit card required**

## Prerequisites

1. ✅ Your code is working locally
2. ✅ You have a GitHub account (free)
3. ✅ Your Supabase database is set up and populated

## Step-by-Step Deployment

### Step 1: Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it `gryphongrade` (or whatever you want)
   - Make it **public** (required for free Vercel)
   - Don't initialize with README (you already have one)

2. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - GryphonGrade ready to deploy"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/gryphongrade.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username.

### Step 2: Deploy to Vercel

1. **Sign up for Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up"
   - Sign up with your **GitHub account** (easiest way)

2. **Import your project:**
   - Click "Add New..." → "Project"
   - Find your `gryphongrade` repository
   - Click "Import"

3. **Configure the project:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these three variables:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
   ```
   
   **Important**: Get these from your Supabase project:
   - Go to Supabase Dashboard → Settings → API
   - Copy the values from your `.env.local` file

5. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - 🎉 Your site will be live at `https://gryphongrade.vercel.app` (or your custom domain)

### Step 3: Verify Deployment

1. **Check your site:**
   - Visit the URL Vercel gives you
   - Make sure courses load correctly
   - Test the search functionality

2. **Check logs if something's wrong:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Check "Build Logs" and "Function Logs" for errors

## Automatic Deployments

Vercel automatically deploys every time you push to GitHub:
- Push to `main` branch → Production deployment
- Create a pull request → Preview deployment

## Custom Domain (Optional)

Want a custom domain like `gryphongrade.com`?

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow Vercel's DNS instructions
4. Wait for DNS propagation (5-30 minutes)

**Note**: You'll need to buy a domain (usually $10-15/year from Namecheap, Google Domains, etc.)

## Troubleshooting

### Build Fails

- **Error**: "Module not found"
  - Make sure all dependencies are in `package.json`
  - Run `npm install` locally to verify

- **Error**: "Environment variable not found"
  - Double-check all 3 environment variables are set in Vercel
  - Make sure there are no typos

### Site Works But No Courses Show

- Check Vercel Function Logs for API errors
- Verify Supabase environment variables are correct
- Make sure your Supabase database has courses (run scraper if needed)

### API Routes Not Working

- Check Vercel Function Logs
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set (needed for API routes)

## Cost Breakdown

**Vercel (Hosting):**
- ✅ FREE for personal projects
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month (plenty for a grade calculator)

**Supabase (Database):**
- ✅ FREE tier includes:
  - 500MB database
  - 2GB bandwidth
  - 50,000 monthly active users
  - More than enough for GryphonGrade!

**Total Cost: $0/month** 🎉

## Next Steps After Deployment

1. ✅ Share your site with friends!
2. ✅ Monitor usage in Vercel Dashboard
3. ✅ Set up custom domain (optional)
4. ✅ Add analytics (optional - Vercel Analytics is free)

## Need Help?

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)

---

**That's it!** Your GryphonGrade app is now live and accessible to the world! 🚀

