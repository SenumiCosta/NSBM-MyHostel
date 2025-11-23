# NSBM MyHostel - Deployment Guide

## Production Checklist

Before deploying to production, ensure:

### ✅ Security
- [ ] Replace plaintext password storage with bcrypt hashing
- [ ] Implement JWT token signing with secret keys
- [ ] Add CSRF protection middleware
- [ ] Enable HTTPS only
- [ ] Implement rate limiting on API endpoints
- [ ] Add input validation and sanitization
- [ ] Set up environment variables for secrets
- [ ] Enable CORS restrictions
- [ ] Add request logging and monitoring

### ✅ Database
- [ ] Set up Firebase project
- [ ] Configure Realtime Database
- [ ] Set up authentication rules
- [ ] Enable backup and disaster recovery
- [ ] Set up database indexing

### ✅ Notifications
- [ ] Configure Firebase Cloud Messaging
- [ ] Set up email service (SendGrid/AWS SES)
- [ ] Test notification delivery

### ✅ Performance
- [ ] Enable caching headers
- [ ] Implement pagination for lists
- [ ] Add database query optimization
- [ ] Set up CDN for static assets
- [ ] Enable gzip compression

### ✅ Monitoring
- [ ] Set up error tracking (Sentry/Rollbar)
- [ ] Configure performance monitoring
- [ ] Enable analytics
- [ ] Set up uptime monitoring

## Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

```bash
# 1. Create Vercel account
# Go to vercel.com and sign up

# 2. Install Vercel CLI
npm i -g vercel

# 3. Deploy
cd nsbm-myhostel
vercel

# 4. Set environment variables in Vercel dashboard
# Add all Firebase credentials and secrets
```

**Environment Variables to Add:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_DATABASE_URL=xxxx
JWT_SECRET=your_secret_key
```

### Option 2: Deploy to AWS Amplify

```bash
# 1. Install AWS CLI
npm i -g @aws-amplify/cli

# 2. Initialize Amplify
amplify init

# 3. Add hosting
amplify add hosting

# 4. Deploy
amplify publish
```

### Option 3: Deploy to Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t nsbm-myhostel .
docker run -p 3000:3000 nsbm-myhostel
```

### Option 4: Deploy to VPS (DigitalOcean/Linode)

```bash
# 1. SSH into server
ssh root@your_server_ip

# 2. Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone repository
git clone https://github.com/SenumiCosta/NSBM-MyHostel.git
cd NSBM-MyHostel/nsbm-myhostel

# 4. Install dependencies
npm install

# 5. Build application
npm run build

# 6. Set environment variables
nano .env.production

# 7. Install PM2 for process management
npm i -g pm2

# 8. Start application
pm2 start npm --name "nsbm-myhostel" -- start

# 9. Setup nginx reverse proxy
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
# Configure to proxy to localhost:3000

# 10. Enable HTTPS with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# 11. Enable PM2 to start on boot
pm2 startup
pm2 save
```

## Firebase Setup for Production

### 1. Create Firebase Project
```bash
# Go to https://console.firebase.google.com
# Create new project
# Select "Realtime Database"
# Choose "Start in production mode"
```

### 2. Configure Database Rules
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'warden'",
        ".write": "auth.uid === $uid"
      }
    },
    "outings": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$outingId": {
        "status": {
          ".validate": "newData.val() === 'pending' || newData.val() === 'parent_approved' || newData.val() === 'parent_rejected' || newData.val() === 'warden_approved' || newData.val() === 'warden_rejected'"
        }
      }
    },
    "anomalies": {
      ".read": "root.child('users').child(auth.uid).child('role').val() === 'warden'",
      ".write": false
    }
  }
}
```

### 3. Enable Authentication
```bash
# Go to Authentication section
# Enable Email/Password authentication
# Add users or enable custom claims for roles
```

### 4. Setup Firestore Backups
```bash
# Enable automated backups in Firebase Console
# Set retention to 30 days
```

## Environment Variables

### Development (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=dev_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dev-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://dev.firebaseio.com
JWT_SECRET=dev_secret_key_change_in_production
```

### Production (.env.production)
```
NEXT_PUBLIC_FIREBASE_API_KEY=prod_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prod-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://prod.firebaseio.com
JWT_SECRET=highly_secure_random_key_min_32_chars
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Post-Deployment

### 1. Run Database Migrations
```bash
# Initialize production data
npm run seed:production
```

### 2. Verify All Services
- [ ] Check API endpoints
- [ ] Test authentication flow
- [ ] Verify database connectivity
- [ ] Test notifications
- [ ] Check error logging

### 3. Monitor Performance
- [ ] Check Core Web Vitals
- [ ] Monitor error rates
- [ ] Review API response times
- [ ] Check database performance

### 4. Setup Monitoring
```bash
# Install Sentry for error tracking
npm install @sentry/nextjs

# Setup in next.config.js
```

## Rollback Procedure

### Vercel
```bash
# View deployment history
vercel list

# Rollback to previous version
vercel rollback
```

### Docker
```bash
# Stop current container
docker stop nsbm-myhostel

# Remove current image
docker rmi nsbm-myhostel

# Deploy previous version
docker run -p 3000:3000 nsbm-myhostel:previous
```

### VPS
```bash
# Rollback with PM2
pm2 start npm --name "nsbm-myhostel" -- start --version=1.0.0
```

## Performance Optimization

### 1. Enable Caching
```typescript
// pages/api/outings/route.ts
response.headers.set('Cache-Control', 'public, max-age=60')
```

### 2. Implement Pagination
```typescript
// GET /api/outings?page=1&limit=20
const offset = (page - 1) * limit
const items = allItems.slice(offset, offset + limit)
```

### 3. Database Indexing
```json
{
  "students": {
    ".indexOn": ["email", "hostelBlock"]
  },
  "outings": {
    ".indexOn": ["studentId", "parentId", "wardenId", "status", "createdAt"]
  }
}
```

## Security Hardening

### 1. API Rate Limiting
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.use('/api/', limiter)
```

### 2. Input Validation
```typescript
import { z } from 'zod'

const outingSchema = z.object({
  destination: z.string().min(2).max(100),
  reason: z.string().min(10).max(500),
  startDateTime: z.number().min(Date.now()),
  endDateTime: z.number()
})
```

### 3. CORS Configuration
```typescript
// next.config.js
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

## Troubleshooting

### Issue: Database Connection Failed
```bash
# Check Firebase configuration
# Verify network connectivity
# Check database rules allow app access
```

### Issue: High API Latency
```bash
# Enable Firebase database indexing
# Implement pagination
# Add response caching
# Check for N+1 queries
```

### Issue: Auth Errors
```bash
# Verify JWT secrets match
# Check Firebase auth rules
# Clear browser localStorage
# Verify token expiration
```

## Monitoring Dashboard

Set up monitoring with:
- **Vercel Analytics** - built-in
- **Firebase Console** - database & auth monitoring
- **Google Analytics** - user analytics
- **Sentry** - error tracking
- **New Relic** - APM monitoring

---

**Deployment Status**: Ready for Production
**Last Updated**: November 23, 2025
