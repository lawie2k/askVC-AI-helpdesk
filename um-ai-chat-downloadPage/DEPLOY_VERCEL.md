# Deploying Download Page to Vercel with APK

Since the APK file (115MB) is too large for GitHub, you need to deploy directly to Vercel using the CLI, which includes local files.

## Prerequisites
1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Navigate to the downloadPage directory:**
   ```bash
   cd um-ai-chat-downloadPage
   ```

2. **Make sure the APK is in the public folder:**
   ```bash
   ls public/askVC.apk
   ```
   (Should show the file exists)

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

4. **Follow the prompts:**
   - If it's your first time: Link to existing project or create new
   - Select your project or create a new one
   - Vercel will build and deploy, including the APK file

### Option 2: Deploy via Vercel Dashboard

1. **Build locally first:**
   ```bash
   cd um-ai-chat-downloadPage
   npm run build
   ```

2. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Select your project or create new

3. **Upload the dist folder:**
   - The `dist` folder will contain the built site AND the APK (from public folder)
   - Drag and drop the entire `dist` folder to Vercel

### Option 3: Use Vercel Git Integration (Without APK in Git)

1. **Connect your GitHub repo to Vercel** (normal deployment)

2. **After deployment, upload APK manually:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Or use Vercel CLI to upload:
     ```bash
     vercel --prod --force
     ```

## Verify Deployment

After deployment, test the download:
- Visit your Vercel URL
- Click "Download APK"
- The file should download successfully

## Update APK URL (if needed)

If you host the APK elsewhere, update `src/App.tsx`:
```typescript
const apkUrl = 'https://your-vercel-url.vercel.app/askVC.apk';
```

Or use environment variable:
1. In Vercel Dashboard → Settings → Environment Variables
2. Add: `VITE_APK_URL` = `https://your-vercel-url.vercel.app/askVC.apk`
3. Redeploy

