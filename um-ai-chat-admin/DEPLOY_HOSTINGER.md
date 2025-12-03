# Deploying Admin Panel to Hostinger

## Prerequisites
- Hostinger account (Shared Hosting or VPS)
- FTP/SSH access credentials
- Node.js installed locally (for building)

## Step 1: Build the Admin Panel

1. Navigate to the admin directory:
```bash
cd um-ai-chat-admin
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Build for production:
```bash
npm run build
```

This will create a `dist` folder with all the production files.

## Step 2: Upload to Hostinger

### Option A: Shared Hosting (via FTP/File Manager)

1. **Access Hostinger File Manager or FTP:**
   - Log in to Hostinger hPanel
   - Go to File Manager or use an FTP client (FileZilla, WinSCP, etc.)

2. **Navigate to your domain's public folder:**
   - Usually: `public_html` or `www` or your domain name folder
   - If you want it in a subdirectory (e.g., `/admin`), create that folder first

3. **Upload files:**
   - Upload ALL contents from the `dist` folder
   - The `.htaccess` file will be automatically included in the build (it's in the `public` folder)
   - Structure should be:
     ```
     public_html/
       ├── index.html
       ├── .htaccess
       ├── assets/
       │   ├── index-[hash].js
       │   ├── index-[hash].css
       │   └── ...
       └── ...
     ```

4. **Set permissions (if needed):**
   - Files: 644
   - Folders: 755
   - `.htaccess`: 644

5. **Access your admin panel:**
   - If uploaded to root: `https://yourdomain.com`
   - If uploaded to subdirectory: `https://yourdomain.com/admin`

### Option B: VPS (via SSH)

1. **Connect via SSH:**
```bash
ssh username@your-server-ip
```

2. **Install Node.js and npm** (if not already installed):
```bash
# For Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

3. **Clone or upload your project:**
```bash
# Option 1: Clone from Git
git clone your-repo-url
cd um-ai-chat-admin

# Option 2: Upload via SCP
# scp -r um-ai-chat-admin username@your-server-ip:/path/to/destination
```

4. **Build the project:**
```bash
npm install
npm run build
```

5. **Set up Nginx** (if using Nginx):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/um-ai-chat-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

6. **Or set up Apache** (if using Apache):
   - Copy the `.htaccess` file to the `dist` folder
   - Configure Apache to serve from the `dist` directory

## Step 3: Verify Deployment

1. Visit your domain in a browser
2. Check browser console for any errors
3. Test login functionality
4. Verify API connections are working

## Step 4: Environment Variables (if needed)

If you need to change the API URL, you can:

1. **Create a `.env.production` file** in `um-ai-chat-admin/`:
```
VITE_API_BASE_URL=https://askvc-ai-helpdesk.onrender.com
```

2. **Rebuild:**
```bash
npm run build
```

3. **Re-upload the new `dist` folder**

## Troubleshooting

### Issue: 404 errors on page refresh
- **Solution:** Make sure `.htaccess` file is uploaded and Apache mod_rewrite is enabled

### Issue: API calls failing
- **Solution:** Check CORS settings on your backend
- Verify `VITE_API_BASE_URL` in `src/config/api.ts` or `.env.production`

### Issue: Assets not loading
- **Solution:** Check file paths in browser console
- Ensure all files from `dist` folder are uploaded
- Check file permissions

### Issue: White screen
- **Solution:** Check browser console for errors
- Verify `index.html` is in the root directory
- Check that all JavaScript files are uploaded correctly

## Updating the Deployment

When you make changes:

1. Make your code changes
2. Run `npm run build` locally
3. Upload the new `dist` folder contents to Hostinger
4. Clear browser cache if needed

## Notes

- The `.htaccess` file is required for React Router to work properly on Apache
- For Nginx, use the server block configuration instead
- Always test locally with `npm run preview` before deploying

