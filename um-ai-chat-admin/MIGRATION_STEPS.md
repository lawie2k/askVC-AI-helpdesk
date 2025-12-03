# Step-by-Step: Migrate Admin Panel from Vercel to Hostinger

## 📋 What You'll Need
- Hostinger account with hosting plan
- FTP credentials or Hostinger File Manager access
- Your computer with Node.js installed

---

## Step 1: Build Your Admin Panel Locally

1. **Open Terminal/Command Prompt** and navigate to your project:
   ```bash
   cd "/Users/lawie/local Documents/UM AI chat/um-ai-chat-admin"
   ```

2. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Check the build output**:
   - You should see a `dist` folder created
   - Open it and verify it contains:
     - `index.html`
     - `assets/` folder (with JS and CSS files)
     - `.htaccess` file

✅ **Success Check**: If you see the `dist` folder with these files, you're ready!

---

## Step 2: Access Your Hostinger Account

1. **Log in to Hostinger**:
   - Go to https://hpanel.hostinger.com
   - Log in with your credentials

2. **Open File Manager**:
   - In hPanel, find "File Manager" or "Files"
   - Click to open it

---

## Step 3: Navigate to Your Website's Root Folder

1. **Find your domain folder**:
   - Look for `public_html` or `www` or your domain name folder
   - This is where your website files go

2. **Decide where to put the admin panel**:
   - **Option A**: Root directory (e.g., `yourdomain.com`)
     - Upload directly to `public_html/`
   - **Option B**: Subdirectory (e.g., `yourdomain.com/admin`)
     - Create a folder named `admin` inside `public_html/`
     - Upload to `public_html/admin/`

---

## Step 4: Upload Files to Hostinger

### Method A: Using Hostinger File Manager (Easiest)

1. **Navigate to your target folder** (root or `admin` subfolder)

2. **Delete old files** (if migrating from Vercel):
   - Select all old files
   - Delete them (keep a backup if needed)

3. **Upload new files**:
   - Click "Upload" button
   - Select ALL files from your `dist` folder:
     - `index.html`
     - `.htaccess` (make sure hidden files are visible)
     - `assets/` folder (upload the entire folder)
   - Wait for upload to complete

4. **Verify files are uploaded**:
   - You should see `index.html` in the root
   - You should see `.htaccess` file
   - You should see `assets/` folder

### Method B: Using FTP Client (FileZilla, WinSCP, etc.)

1. **Get FTP credentials from Hostinger**:
   - In hPanel, go to "FTP Accounts"
   - Note down: Host, Username, Password, Port

2. **Connect via FTP**:
   - Open your FTP client
   - Enter credentials
   - Connect

3. **Navigate to `public_html/`** (or `public_html/admin/`)

4. **Upload files**:
   - Drag and drop ALL contents from `dist` folder
   - Make sure `.htaccess` is uploaded (enable "Show hidden files")

---

## Step 5: Set File Permissions (If Needed)

1. **In File Manager, right-click on files/folders**:
   - Files: Set to `644`
   - Folders: Set to `755`
   - `.htaccess`: Set to `644`

2. **If using FTP**:
   - Files: `chmod 644`
   - Folders: `chmod 755`

---

## Step 6: Test Your Admin Panel

1. **Visit your website**:
   - If uploaded to root: `https://yourdomain.com`
   - If uploaded to subdirectory: `https://yourdomain.com/admin`

2. **Check for issues**:
   - ✅ Page loads without errors
   - ✅ Login page appears
   - ✅ No console errors (press F12 → Console tab)
   - ✅ API calls work (try logging in)

3. **Test React Router**:
   - Navigate to a page (e.g., Dashboard)
   - Refresh the page (F5)
   - ✅ Should NOT show 404 error

---

## Step 7: Update DNS (If Using Custom Domain)

If your admin was on Vercel with a custom domain:

1. **Remove Vercel DNS settings** (if any)

2. **Point domain to Hostinger**:
   - In Hostinger, go to "Domains" → "DNS Zone Editor"
   - Update A record to point to Hostinger's IP
   - Or use Hostinger's nameservers

---

## Step 8: Verify Everything Works

✅ **Checklist**:
- [ ] Admin panel loads at your domain
- [ ] Login page works
- [ ] Can log in successfully
- [ ] Dashboard loads
- [ ] All tabs/pages work
- [ ] API calls to backend work
- [ ] No 404 errors on page refresh
- [ ] Images/assets load correctly

---

## 🔧 Troubleshooting

### Problem: White screen / Nothing loads
**Solution**: 
- Check browser console (F12) for errors
- Verify `index.html` is in the root directory
- Check that all files uploaded correctly

### Problem: 404 error when refreshing page
**Solution**: 
- Verify `.htaccess` file is uploaded
- Check that Apache mod_rewrite is enabled (contact Hostinger support)
- Ensure `.htaccess` is in the same folder as `index.html`

### Problem: API calls failing
**Solution**: 
- Check `src/config/api.ts` - verify API URL is correct
- Check browser console for CORS errors
- Verify backend is running and accessible

### Problem: Assets (CSS/JS) not loading
**Solution**: 
- Check file paths in browser console
- Verify `assets/` folder uploaded correctly
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Problem: Can't see `.htaccess` file
**Solution**: 
- In File Manager, enable "Show hidden files"
- In FTP, enable "Show hidden files" option

---

## 📝 Quick Reference Commands

```bash
# Navigate to admin folder
cd "/Users/lawie/local Documents/UM AI chat/um-ai-chat-admin"

# Build for production
npm run build

# Preview build locally (optional - to test before uploading)
npm run preview
```

---

## 🎉 You're Done!

Once everything is working:
1. Your admin panel is now on Hostinger
2. You can remove it from Vercel (optional)
3. Update any bookmarks/links to the new URL

---

## Need Help?

If you encounter issues:
1. Check the browser console (F12) for errors
2. Verify all files uploaded correctly
3. Check file permissions
4. Contact Hostinger support if Apache issues persist



