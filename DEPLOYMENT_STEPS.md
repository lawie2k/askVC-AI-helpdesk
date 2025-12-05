# Deployment Steps for Scanned URLs Feature

## 📋 Pre-Deployment Checklist

- [x] Database schema updated (`scanned_urls` table)
- [x] New API endpoints created (`/api/scanned-urls`)
- [x] AI chat integration updated
- [x] New dependency added (`cheerio`)
- [x] Prisma schema updated

---

## 🚀 Deployment Steps

### Step 1: Commit All Changes

Make sure all new files are committed:

```bash
git add .
git commit -m "Add scanned URLs feature for AI chat"
```

**New files to commit:**
- `um-ai-chat-backend/services/url-fetcher.js`
- `um-ai-chat-backend/routes/api/scannedUrls.js`
- `um-ai-chat-backend/prisma/schema.prisma` (updated)
- `um-ai-chat-backend/routes/chat.js` (updated)
- `um-ai-chat-backend/routes/endpoints.js` (updated)
- `um-ai-chat-backend/prisma/migrations/20250101000000_add_scanned_urls/migration.sql`

---

### Step 2: Push to Git Repository

```bash
git push origin main
```

---

### Step 3: Deploy to Heroku

If using Heroku Git:
```bash
git push heroku main
```

Or if using Heroku CLI:
```bash
heroku git:remote -a your-app-name
git push heroku main
```

---

### Step 4: Run Database Migration on Production

**Option A: Using Prisma Migrate (Recommended)**

```bash
# Connect to Heroku app
heroku run -a your-app-name bash

# Inside Heroku bash, run:
cd um-ai-chat-backend
npx prisma migrate deploy
```

**Option B: Using Prisma DB Push (Alternative)**

If migrations have issues, you can use:
```bash
heroku run -a your-app-name "cd um-ai-chat-backend && npx prisma db push"
```

**Option C: Manual SQL Execution (If needed)**

If you have direct database access, run this SQL:

```sql
CREATE TABLE `scanned_urls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(500) NOT NULL,
    `title` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `admin_id` INTEGER NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `scanned_urls_admin_id_idx`(`admin_id`),
    INDEX `scanned_urls_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `scanned_urls` ADD CONSTRAINT `scanned_urls_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
```

---

### Step 5: Verify Deployment

1. **Check if table exists:**
   ```bash
   heroku run -a your-app-name "cd um-ai-chat-backend && node -e \"const p = require('./config/prismaClient'); p.scanned_urls.findMany().then(r => console.log('✅ Table exists! Records:', r.length)).catch(e => console.error('❌ Error:', e.message));\""
   ```

2. **Test API endpoint:**
   ```bash
   curl https://your-app-name.herokuapp.com/api/scanned-urls
   ```
   Should return: `[]` (empty array, which is correct)

3. **Check server logs:**
   ```bash
   heroku logs --tail -a your-app-name
   ```
   Look for any errors related to Prisma or the new routes.

---

### Step 6: Generate Prisma Client (if needed)

The `postinstall` script should automatically run `prisma generate`, but if needed:

```bash
heroku run -a your-app-name "cd um-ai-chat-backend && npx prisma generate"
```

---

## ✅ Post-Deployment

1. **Add your first scanned URL:**
   ```bash
   curl -X POST https://your-app-name.herokuapp.com/api/scanned-urls \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -d '{
       "url": "https://example.com/info",
       "title": "Campus Information",
       "description": "Main campus website",
       "is_active": true
     }'
   ```

2. **Test the AI chat:**
   - Ask a question that might be answered by the URL content
   - Verify the AI uses both database and URL content

---

## 🔧 Troubleshooting

### Issue: Migration fails
**Solution:** Use `prisma db push` instead of `prisma migrate deploy`

### Issue: Table already exists
**Solution:** The table might already exist. Check with:
```bash
heroku run -a your-app-name "cd um-ai-chat-backend && node -e \"const p = require('./config/prismaClient'); p.scanned_urls.findMany().then(() => console.log('✅ Table exists')).catch(e => console.error('❌', e.message));\""
```

### Issue: Prisma Client not generated
**Solution:** Run manually:
```bash
heroku run -a your-app-name "cd um-ai-chat-backend && npx prisma generate"
```

### Issue: Routes not found
**Solution:** 
- Check that `routes/endpoints.js` includes the scanned URLs route
- Restart Heroku dyno: `heroku restart -a your-app-name`

---

## 📝 Notes

- The `postinstall` script in `package.json` automatically runs `prisma generate` on deployment
- All new dependencies (like `cheerio`) will be installed automatically during `npm install` on Heroku
- The migration file is included in the repository, so it will be available on Heroku

---

## 🎯 Quick Deploy Command Summary

```bash
# 1. Commit and push
git add .
git commit -m "Add scanned URLs feature"
git push origin main

# 2. Deploy to Heroku
git push heroku main

# 3. Run migration
heroku run -a your-app-name "cd um-ai-chat-backend && npx prisma db push"

# 4. Verify
heroku logs --tail -a your-app-name
```

