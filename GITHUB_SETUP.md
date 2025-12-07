# GitHub Repository Setup

## Option 1: Create Repository on GitHub Website (Easiest)

1. **Go to GitHub:**
   - Visit: https://github.com/new
   - Or: GitHub.com → Click your profile → "New repository"

2. **Fill in the form:**
   - **Repository name**: `gryphongrade`
   - **Description**: `University of Guelph Grade Calculator`
   - **Visibility**: ✅ **Public** (required for free Vercel)
   - **DO NOT** check:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
   - (Leave all unchecked - you already have these files)

3. **Click "Create repository"**

4. **After creating, run in your terminal:**
   ```bash
   git push -u origin main
   ```

## Option 2: Use GitHub CLI (If Installed)

If you have GitHub CLI installed, run:
```bash
gh repo create gryphongrade --public --source=. --remote=origin --push
```

This creates the repo AND pushes your code in one command!

## After Pushing

Once your code is on GitHub, follow the deployment steps in `DEPLOYMENT.md` to deploy to Vercel for free!

