# ManaTuner Pro - Deployment Guide

This guide provides step-by-step instructions for deploying ManaTuner Pro to production using Firebase.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- **Firebase CLI** installed globally (`npm install -g firebase-tools`)
- **Git** for version control
- **Firebase project** created in the Firebase Console
- **Domain** (optional, for custom domain setup)

## 🔧 Initial Setup

### 1. Firebase Project Configuration

1. **Create a Firebase Project**
   ```bash
   # Login to Firebase
   firebase login
   
   # Create new project (or use existing)
   firebase projects:create project-manabase-prod
   ```

2. **Enable Required Services**
   
   In the Firebase Console, enable:
   - **Authentication** (Email/Password, Google)
   - **Firestore Database** (Production mode)
   - **Hosting**
   - **Cloud Functions**
   - **Analytics** (optional)

3. **Configure Authentication**
   ```bash
   # Enable Email/Password authentication
   # Go to Authentication > Sign-in method in Firebase Console
   # Enable Email/Password and Google providers
   ```

### 2. Environment Configuration

1. **Copy environment template**
   ```bash
   cp env.example .env.local
   ```

2. **Configure Firebase credentials**
   
   Get your Firebase config from **Project Settings > General > Your apps**:
   ```bash
   # .env.local
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
   ```

### 3. Project Initialization

1. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

2. **Initialize Firebase**
   ```bash
   firebase init
   ```
   
   Select:
   - ✅ Firestore: Configure rules and indexes
   - ✅ Functions: Configure Cloud Functions
   - ✅ Hosting: Configure hosting
   - ✅ Storage: Configure security rules
   
   Use existing configuration files when prompted.

3. **Set Firebase project**
   ```bash
   firebase use --add
   # Select your project and give it an alias (e.g., "production")
   ```

## 🏗️ Build and Test

### 1. Local Development Testing

```bash
# Start all emulators
firebase emulators:start

# In another terminal, start the dev server
npm run dev
```

Test all functionality:
- ✅ User authentication
- ✅ Deck analysis
- ✅ Data persistence
- ✅ Real-time updates

### 2. Production Build

```bash
# Build the frontend
npm run build

# Build the functions
cd functions && npm run build && cd ..

# Test the production build locally
npm run preview
```

### 3. Pre-deployment Checks

```bash
# Run all tests
npm test

# Check for linting errors
npm run lint

# Type checking
npm run type-check

# Security audit
npm audit
```

## 🚀 Deployment Process

### 1. Deploy to Staging (Optional)

```bash
# Create staging project
firebase projects:create project-manabase-staging

# Add staging alias
firebase use --add staging

# Deploy to staging
firebase use staging
firebase deploy
```

### 2. Production Deployment

```bash
# Switch to production
firebase use production

# Deploy everything
npm run deploy

# Or deploy individually:
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 3. Verify Deployment

1. **Test the deployed application**
   ```bash
   # Open your deployed app
   firebase open hosting:site
   ```

2. **Check Cloud Functions**
   ```bash
   # Test API endpoint
   curl https://us-central1-your-project.cloudfunctions.net/api/health
   ```

3. **Monitor logs**
   ```bash
   # View function logs
   firebase functions:log
   
   # View hosting logs
   firebase hosting:channel:list
   ```

## 🔒 Security Configuration

### 1. Firestore Security Rules

Ensure your `firestore.rules` file is properly configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data - only readable/writable by owner
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Analyses - only readable/writable by owner
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == resource.data.userId;
    }
    
    // Public read-only collections
    match /cards/{document} {
      allow read: if true;
      allow write: if false; // Only server can write
    }
  }
}
```

### 2. Cloud Functions Security

```bash
# Set environment variables for functions
firebase functions:config:set scryfall.api_key="your_api_key"
firebase functions:config:set app.environment="production"

# Deploy with new config
firebase deploy --only functions
```

### 3. Content Security Policy

Update your hosting headers in `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://api.scryfall.com; connect-src 'self' https://api.scryfall.com https://*.cloudfunctions.net"
          }
        ]
      }
    ]
  }
}
```

## 📊 Monitoring and Analytics

### 1. Enable Firebase Analytics

```bash
# Install Analytics SDK (already included)
# Configure in Firebase Console > Analytics
```

### 2. Error Monitoring

```bash
# Enable Crashlytics (optional)
firebase crashlytics:enable
```

### 3. Performance Monitoring

Add to your `index.html`:
```html
<!-- Firebase Performance Monitoring -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
    })
  }
</script>
```

## 🔄 CI/CD Setup (GitHub Actions)

### 1. Create Workflow File

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd functions && npm ci && cd ..
      
      - name: Run tests
        run: npm test
      
      - name: Lint code
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd functions && npm ci && cd ..
      
      - name: Build project
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: your-project-id
```

### 2. Configure Secrets

In GitHub Repository Settings > Secrets, add:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT` (JSON key)

## 🌐 Custom Domain Setup

### 1. Add Custom Domain

```bash
firebase hosting:sites:create your-custom-domain
firebase target:apply hosting main your-custom-domain
```

### 2. Configure DNS

Add these records to your DNS provider:

```
Type: A
Name: @
Value: 151.101.1.195

Type: A  
Name: @
Value: 151.101.65.195

Type: CNAME
Name: www
Value: your-project.web.app
```

### 3. Verify Domain

```bash
firebase hosting:sites:list
firebase deploy --only hosting
```

## 🔧 Maintenance

### 1. Regular Updates

```bash
# Update dependencies monthly
npm update
cd functions && npm update && cd ..

# Check for security vulnerabilities
npm audit
npm audit fix
```

### 2. Database Maintenance

```bash
# Backup Firestore data
gcloud firestore export gs://your-backup-bucket/$(date +%Y%m%d)

# Clean up old analyses (automated via Cloud Function)
firebase functions:log --only cleanup
```

### 3. Performance Monitoring

- Monitor Firebase Performance dashboard
- Check Google Analytics for user behavior
- Review Cloud Function logs for errors
- Monitor Scryfall API usage and caching effectiveness

## 🆘 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **Function Deployment Errors**
   ```bash
   # Check function logs
   firebase functions:log
   
   # Redeploy specific function
   firebase deploy --only functions:api
   ```

3. **Hosting Issues**
   ```bash
   # Clear hosting cache
   firebase hosting:channel:delete preview
   firebase deploy --only hosting
   ```

4. **Database Permission Errors**
   ```bash
   # Check Firestore rules
   firebase firestore:rules:get
   
   # Test rules locally
   firebase emulators:start --only firestore
   ```

## 📞 Support

For deployment issues:
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Review [GitHub Issues](https://github.com/project-manabase/issues)
- Contact: deploy@project-manabase.com

---

**Happy Deploying! 🚀** 