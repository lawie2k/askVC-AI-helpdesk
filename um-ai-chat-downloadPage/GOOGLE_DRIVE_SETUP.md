# Setting Up Google Drive APK Download

## Step 1: Upload APK to Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Click "New" → "File upload"
3. Select your `askVC.apk` file (from `um-ai-chat-downloadPage/public/askVC.apk`)
4. Wait for upload to complete

## Step 2: Get Direct Download Link

1. **Right-click** on the uploaded APK file in Google Drive
2. Click **"Share"** or **"Get link"**
3. Change sharing settings to **"Anyone with the link"** (Viewer permission)
4. Copy the link - it will look like:
   ```
   https://drive.google.com/file/d/FILE_ID_HERE/view?usp=sharing
   ```

## Step 3: Extract File ID

From the link above, copy the `FILE_ID_HERE` part (the long string between `/d/` and `/view`)

Example:
- Link: `https://drive.google.com/file/d/1ABC123xyz456DEF789/view?usp=sharing`
- File ID: `1ABC123xyz456DEF789`

## Step 4: Create Direct Download URL

Convert the sharing link to a direct download link:

**Format:**
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

**Example:**
```
https://drive.google.com/uc?export=download&id=1ABC123xyz456DEF789
```

## Step 5: Update Your Code

### Option A: Update directly in code

Edit `src/App.tsx` line ~19:
```typescript
const apkUrl = import.meta.env.VITE_APK_URL || 'https://drive.google.com/uc?export=download&id=YOUR_FILE_ID';
```

Replace `YOUR_FILE_ID` with your actual file ID.

### Option B: Use Environment Variable (Recommended)

1. Create `.env` file in `um-ai-chat-downloadPage/`:
   ```
   VITE_APK_URL=https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
   ```

2. Add to Vercel Environment Variables:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_APK_URL` = `https://drive.google.com/uc?export=download&id=YOUR_FILE_ID`
   - Redeploy

## Step 6: Test the Download

1. Visit your deployed site
2. Click "Download APK"
3. The file should download from Google Drive

## Troubleshooting

**If download doesn't work:**
- Make sure sharing is set to "Anyone with the link"
- Verify the file ID is correct
- Try the direct download URL format: `https://drive.google.com/uc?export=download&id=FILE_ID`

**Alternative: Use Google Drive API**
If direct link doesn't work, you may need to use Google Drive API with an API key (more complex setup).

