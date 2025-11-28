# GitHub Setup Instructions

## Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Fill in:
   - **Repository name**: `shop-management-system` (or your preferred name)
   - **Description**: "Shop Management System with POS, Inventory, and Receipts"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

## Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote (replace YOUR_USERNAME and REPO_NAME with your actual values)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main if needed (if you're on master)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Alternative: Using SSH

If you have SSH keys set up with GitHub:

```bash
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

## Quick Commands

```bash
# Check current remotes
git remote -v

# If you need to change the remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push all branches
git push -u origin main

# For future pushes (after first time)
git push
```

## Important Notes

✅ **Already done:**
- All files are committed
- `.gitignore` is configured
- Sensitive files (`.env*`, `local.db`) are excluded
- `env.example` has placeholder values (no real credentials)

⚠️ **Before pushing:**
- Make sure you've removed any real credentials from code
- Verify `.env.local` is in `.gitignore` (it should be)
- Your Turso credentials should only be in your local `.env.local` file

## After Pushing

Once pushed, you can:
1. **Deploy to Vercel**: Connect your GitHub repo to Vercel for automatic deployments
2. **Share with team**: Team members can clone and contribute
3. **Set up CI/CD**: Configure automated testing and deployment

