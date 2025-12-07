# 🚀 Step-by-Step: Deploy to Vercel (100% FREE)

Follow these steps exactly to deploy your GryphonGrade app!

## Step 1: Sign Up for Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"** (top right)
3. Choose **"Continue with GitHub"** (easiest way)
4. Authorize Vercel to access your GitHub account
5. You're now signed up! ✅

## Step 2: Import Your Project

1. After signing in, you'll see the Vercel dashboard
2. Click **"Add New..."** button (top right)
3. Click **"Project"**
4. You'll see a list of your GitHub repositories
5. Find **"gryphongrade"** and click **"Import"**

## Step 3: Configure Project Settings

Vercel will auto-detect Next.js, but verify these settings:

- **Framework Preset**: `Next.js` ✅ (should be auto-detected)
- **Root Directory**: `./` ✅ (default - leave as is)
- **Build Command**: `npm run build` ✅ (default - leave as is)
- **Output Directory**: `.next` ✅ (default - leave as is)
- **Install Command**: `npm install` ✅ (default - leave as is)

**Don't change anything here** - just click **"Environment Variables"** (on the left sidebar)

## Step 4: Add Environment Variables (CRITICAL!)

This is the most important step! You need to add your Supabase keys.

1. Click **"Environment Variables"** in the left sidebar
2. Add these **3 variables one by one**:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: (copy from your `.env.local` file)
   - Environment: Select **Production**, **Preview**, and **Development** (all 3)
   - Click **"Save"**

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (copy from your `.env.local` file)
   - Environment: Select **Production**, **Preview**, and **Development** (all 3)
   - Click **"Save"**

   **Variable 3:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (copy from your `.env.local` file)
   - Environment: Select **Production**, **Preview**, and **Development** (all 3)
   - Click **"Save"**

**⚠️ Important**: Make sure you select all 3 environments (Production, Preview, Development) for each variable!

## Step 5: Deploy!

1. After adding all 3 environment variables, click **"Deploy"** button (bottom right)
2. Wait 2-3 minutes while Vercel builds your app
3. You'll see a progress bar showing:
   - Installing dependencies
   - Building your app
   - Deploying

## Step 6: Your Site is Live! 🎉

1. Once deployment completes, you'll see:
   - ✅ "Congratulations! Your project has been deployed"
   - A URL like: `https://gryphongrade.vercel.app`

2. **Click the URL** to visit your live site!

3. **Test it:**
   - Search for a course (e.g., "MATH")
   - Make sure courses load
   - Test the grade calculator

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Make sure all dependencies are in `package.json`
- Check that you didn't miss any files in your Git commit

**Error: "Environment variable not found"**
- Go back to Step 4
- Double-check all 3 variables are added
- Make sure you selected all 3 environments (Production, Preview, Development)
- Check for typos in variable names

### Site Works But No Courses Show

1. Check **Vercel Function Logs**:
   - Go to your project → Deployments → Latest deployment
   - Click "Functions" tab
   - Check `/api/courses` logs for errors

2. Verify environment variables:
   - Go to Settings → Environment Variables
   - Make sure all 3 are there and correct

3. Make sure your Supabase database has courses:
   - If not, run `npm run scrape:courses` locally
   - Or run it on Vercel (see below)

### How to Run Scraper on Vercel

The scraper needs to run locally or you can:
1. Run it locally: `npm run scrape:courses`
2. Or set up a Vercel Cron Job (advanced - see Vercel docs)

## What Happens Next?

✅ **Automatic Deployments**: Every time you push to GitHub, Vercel automatically deploys!

✅ **Preview Deployments**: Every pull request gets its own preview URL

✅ **Free Forever**: As long as you stay on the free tier, it's completely free!

## Your Live URLs

After deployment, you'll have:
- **Production**: `https://gryphongrade.vercel.app`
- **Custom Domain**: (optional - add in Settings → Domains)

## Next Steps

1. ✅ Share your site with friends!
2. ✅ Monitor usage in Vercel Dashboard
3. ✅ Set up custom domain (optional - costs ~$10-15/year for domain)
4. ✅ Add analytics (optional - Vercel Analytics is free)

---

**That's it!** Your GryphonGrade app is now live on the internet! 🚀

