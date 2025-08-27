# Vercel Deployment Guide

## Prerequisites

1. **Deploy the AI Service First**: The FastAPI service needs to be deployed to a cloud platform like Railway, Heroku, or DigitalOcean.
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Step 1: Deploy AI Service (FastAPI)

### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `ai_service` folder as the root directory
4. Add environment variables if needed
5. Railway will automatically detect the Python app and deploy it

### Option B: Heroku
1. Install Heroku CLI
2. Create a `Procfile` in the `ai_service` directory:
   ```
   web: uvicorn chatbot:app --host 0.0.0.0 --port $PORT
   ```
3. Deploy:
   ```bash
   cd ai_service
   heroku create your-ai-service-name
   git subtree push --prefix ai_service heroku main
   ```

### Option C: DigitalOcean App Platform
1. Go to DigitalOcean App Platform
2. Connect your repository
3. Select the `ai_service` folder
4. Configure as a Python app with start command: `uvicorn chatbot:app --host 0.0.0.0 --port $PORT`

## Step 2: Deploy Frontend to Vercel

### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project root
cd /path/to/ai_stylist

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - What's your project's name? ai-stylist
# - In which directory is your code located? ./frontend
```

### Method 2: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Set the root directory to `frontend`
5. Configure environment variables (see below)

## Step 3: Configure Environment Variables

In your Vercel project settings, add:
- `AI_SERVICE_URL`: The URL of your deployed AI service (e.g., `https://your-app.railway.app`)

## Step 4: Update Image Configuration (if needed)

If you encounter image loading issues, update `next.config.ts` to include your Vercel domain:
```typescript
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'your-app-name.vercel.app',
    pathname: '/api/wardrobe/image/**',
  },
]
```

## Architecture Overview

After deployment:
- **Frontend**: Deployed on Vercel (Edge Network)
- **API Routes**: Vercel Serverless Functions (in `/frontend/api/`)
- **AI Service**: External deployment (Railway/Heroku/DigitalOcean)

The serverless functions act as a proxy between your frontend and the AI service, handling CORS and providing a unified API interface.

## Monitoring and Debugging

- **Vercel Functions**: View logs in Vercel dashboard
- **AI Service**: Monitor via your chosen platform's dashboard
- **Error Tracking**: Check browser console and Vercel function logs

## Environment-Specific Configuration

- **Development**: Uses local backend on port 3001
- **Production**: Uses Vercel serverless functions that proxy to the deployed AI service

## Custom Domain (Optional)

1. Add your domain in Vercel project settings
2. Configure DNS records as instructed
3. Update CORS settings in your AI service if needed
