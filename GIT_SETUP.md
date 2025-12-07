# Git Setup & Push Commands

Run these commands in order to push to GitHub:

```bash
# 1. Configure Git (if not already done)
git config user.email "kenjiifx@users.noreply.github.com"
git config user.name "kenjiifx"

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit - GryphonGrade ready to deploy"

# 4. Set main branch
git branch -M main

# 5. Push to GitHub
git push -u origin main
```

If you get authentication errors, you may need to:
- Use a Personal Access Token instead of password
- Or set up SSH keys

See DEPLOYMENT.md for full deployment instructions!

