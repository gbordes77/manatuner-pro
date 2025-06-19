# 🚀 Vercel Deployment Setup Guide

## Prerequisites

1. **Vercel Account**: [Sign up at vercel.com](https://vercel.com)
2. **GitHub Repository**: Your ManaTuner Pro repository
3. **Vercel CLI**: `npm install -g vercel`

## Step 1: Create Vercel Project

### Option A: Via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`

### Option B: Via CLI
```bash
# Login to Vercel
vercel login

# Link your project
vercel link

# Deploy (first time)
vercel --prod
```

## Step 2: Get Vercel Secrets

### Get Vercel Token
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name: `ManaTuner Pro CI/CD`
4. Scope: `Full Account`
5. Copy the token (starts with `vercel_`)

### Get Organization ID
```bash
# Via CLI (after linking project)
vercel project ls

# Or via Vercel dashboard
# Settings → General → Project ID & Team ID
```

### Get Project ID
```bash
# Via CLI
cat .vercel/project.json

# Or via Vercel dashboard
# Project Settings → General → Project ID
```

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these **Repository Secrets**:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VERCEL_TOKEN` | `vercel_xxxxx...` | Your Vercel API token |
| `VERCEL_ORG_ID` | `team_xxxxx...` | Your Vercel team/org ID |
| `VERCEL_PROJECT_ID` | `prj_xxxxx...` | Your Vercel project ID |

## Step 4: Environment Variables (Optional)

If your app needs environment variables, add them in:

### Vercel Dashboard
1. Project Settings → Environment Variables
2. Add variables for `Production`, `Preview`, and `Development`

### Common Variables for ManaTuner Pro
```env
# Scryfall API (if needed)
VITE_SCRYFALL_API_URL=https://api.scryfall.com

# Analytics (if using)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Feature flags
VITE_ENABLE_BETA_FEATURES=true
```

## Step 5: Verify Deployment

### Test the Workflow
1. Make a change to your code
2. Push to `main` branch
3. Check GitHub Actions tab
4. Verify deployment at your Vercel URL

### Expected Workflow
```
Push to main → GitHub Actions → Tests → Build → Deploy to Vercel
```

## Step 6: Custom Domain (Optional)

### Add Custom Domain
1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `manatuner.pro`)
3. Configure DNS records as instructed
4. SSL certificate is automatic

### Update README
Update your README.md with the live URL:
```markdown
- **Live Demo**: [🚀 https://manatuner.pro](https://manatuner.pro)
```

## Troubleshooting

### Common Issues

**Build Fails**
```bash
# Check build locally
npm run build

# Check Node.js version
node --version  # Should be 18+
```

**Secrets Not Working**
- Verify secret names match exactly (case-sensitive)
- Regenerate Vercel token if needed
- Check organization ID format (`team_` prefix)

**Deployment Timeout**
- Optimize build size
- Check for infinite loops in build process
- Verify all dependencies are in `package.json`

### Logs and Debugging
```bash
# View deployment logs
vercel logs [deployment-url]

# Local preview
vercel dev
```

## Advanced Configuration

### Custom Build Settings
Create `vercel.json` in project root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### Performance Optimization
- Enable compression in `vercel.json`
- Configure caching headers
- Use Vercel Analytics for monitoring

## Success Checklist

- [ ] Vercel project created and linked
- [ ] GitHub secrets configured
- [ ] First deployment successful
- [ ] CI/CD pipeline working
- [ ] Custom domain configured (optional)
- [ ] Environment variables set
- [ ] Performance monitoring enabled

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)
- **Issues**: Create GitHub issue for project-specific problems

---

🎉 **Your ManaTuner Pro is now production-ready with automated CI/CD!** 🚀 