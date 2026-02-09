# 🚀 Deploy Your App NOW - Step by Step

Follow these commands **exactly** in PowerShell (in your project root folder):

## Step 1: Login to Heroku

```powershell
heroku login
```

Press any key when prompted, and login in your browser.

## Step 2: Create Heroku App

```powershell
cd backend
heroku create student-fee-backend
```

**IMPORTANT**: Copy the URL you get (like `https://student-fee-backend-xxxxx.herokuapp.com`)

## Step 3: Add PostgreSQL Database

```powershell
heroku addons:create heroku-postgresql:essential-0
```

Wait for it to finish (about 30 seconds).

## Step 4: Get Cloudinary Credentials

Go to https://cloudinary.com/console and copy:
- Cloud Name: `dnra24mnh` ✅
- API Key: (copy this)
- API Secret: (copy this)

## Step 5: Set Environment Variables

Replace `YOUR_API_KEY` and `YOUR_API_SECRET` with your actual Cloudinary credentials:

```powershell
heroku config:set JWT_SECRET="student-fee-system-secret-key-2026-secure"
heroku config:set CLOUDINARY_CLOUD_NAME="dnra24mnh"
heroku config:set CLOUDINARY_API_KEY="YOUR_API_KEY"
heroku config:set CLOUDINARY_API_SECRET="YOUR_API_SECRET"
heroku config:set NODE_ENV="production"
heroku config:set USE_POSTGRES="true"
```

## Step 6: Deploy to Heroku

```powershell
git push heroku main
```

Wait for deployment to finish (2-3 minutes).

## Step 7: Set Up Database Tables

```powershell
heroku pg:psql < setup-postgres.sql
```

This creates all tables and the admin user.

## Step 8: Test Your Backend

```powershell
heroku open
```

Or visit: `https://your-app-name.herokuapp.com/api/ping`

You should see: `{"status":"WORKS","version":15,"port":5008,"database":"PostgreSQL"}`

## Step 9: Create Admin User

```powershell
heroku run node -e "const bcrypt = require('bcrypt'); const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }}); bcrypt.hash('admin123', 10).then(hash => { pool.query('INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING', ['Main Admin', 'admin', hash, 'admin']).then(() => { console.log('Admin created!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); }); });"
```

---

## ✅ Backend Deployed!

Your backend is now live at: `https://your-app-name.herokuapp.com`

**Test it:**
- Visit: `https://your-app-name.herokuapp.com/api/ping`
- Should see: `{"status":"WORKS",...}`

---

## 🎯 Next: Deploy Frontend

After backend is working, we'll:
1. Update frontend API URLs
2. Deploy to Netlify
3. Test everything!

---

## 🆘 If Something Goes Wrong

Check logs:
```powershell
heroku logs --tail
```

Check database:
```powershell
heroku pg:info
```

Check config:
```powershell
heroku config
```

---

**Ready? Start with Step 1!** 🚀
