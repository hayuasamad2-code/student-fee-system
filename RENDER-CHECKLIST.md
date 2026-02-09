# ✅ Render Deployment Checklist

## Before Starting
- [ ] GitHub repository ready: https://github.com/hayuasamad2-code/student-fee-system
- [ ] Get Cloudinary credentials from https://cloudinary.com/console
  - Cloud Name: `dnra24mnh` ✅
  - API Key: ________________
  - API Secret: ________________

---

## Part 1: Create Accounts (5 minutes)

### Render Account
- [ ] Go to https://render.com/
- [ ] Click "Get Started for Free"
- [ ] Sign up with GitHub (easiest)
- [ ] Verify email

### Netlify Account  
- [ ] Go to https://app.netlify.com
- [ ] Sign up (free)

---

## Part 2: Deploy Database (5 minutes)

- [ ] In Render, click "New +" → "PostgreSQL"
- [ ] Name: `student-system-db`
- [ ] Plan: **Free**
- [ ] Click "Create Database"
- [ ] Wait for it to be ready
- [ ] Copy "Internal Database URL": ________________________________

---

## Part 3: Deploy Backend (10 minutes)

- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository: `student-fee-system`
- [ ] Settings:
  - Name: `student-fee-backend`
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `node server-postgres.js`
  - Plan: **Free**

- [ ] Add Environment Variables:
  - `DATABASE_URL` = (paste from Part 2)
  - `JWT_SECRET` = `student-fee-system-secret-key-2026-secure`
  - `CLOUDINARY_CLOUD_NAME` = `dnra24mnh`
  - `CLOUDINARY_API_KEY` = (your key)
  - `CLOUDINARY_API_SECRET` = (your secret)
  - `NODE_ENV` = `production`
  - `USE_POSTGRES` = `true`

- [ ] Click "Create Web Service"
- [ ] Wait 3-5 minutes for deployment
- [ ] Copy your URL: ________________________________

---

## Part 4: Setup Database Tables (5 minutes)

- [ ] Go to Web Service → "Shell" tab
- [ ] Run this command:

```bash
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); const fs = require('fs'); const sql = fs.readFileSync('setup-postgres.sql', 'utf8'); pool.query(sql).then(() => { console.log('Tables created!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
```

- [ ] Create admin user:

```bash
node -e "const bcrypt = require('bcrypt'); const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); bcrypt.hash('admin123', 10).then(hash => { pool.query('INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING', ['Main Admin', 'admin', hash, 'admin']).then(() => { console.log('Admin created!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); }); });"
```

---

## Part 5: Test Backend (2 minutes)

- [ ] Visit: `https://your-render-url.onrender.com/api/ping`
- [ ] Should see: `{"status":"WORKS","version":15,...}`

---

## Part 6: Update Frontend (5 minutes)

Update API URLs in these files:

### File 1: `frontend/admin/admin_latest.js`
Find all `fetch("` and replace `http://localhost:5008` with your Render URL

### File 2: `frontend/student/student_latest.js`  
Find all `fetch("` and replace `http://localhost:5008` with your Render URL

- [ ] Files updated
- [ ] Commit changes:
```powershell
git add .
git commit -m "Update API URLs for production"
git push origin main
```

---

## Part 7: Deploy Frontend (5 minutes)

- [ ] Go to https://app.netlify.com
- [ ] Click "Add new site" → "Deploy manually"
- [ ] Drag your `frontend` folder
- [ ] Wait for deployment
- [ ] Copy Netlify URL: ________________________________

---

## Part 8: Update CORS (2 minutes)

- [ ] Go to Render → Your Web Service → "Environment"
- [ ] Add variable:
  - Key: `FRONTEND_URL`
  - Value: (your Netlify URL)
- [ ] Click "Save Changes"
- [ ] Wait for automatic redeploy

---

## Part 9: Test Everything! (10 minutes)

### Admin Tests
- [ ] Visit your Netlify URL
- [ ] Login as admin (username: `admin`, password: `admin123`)
- [ ] Dashboard loads
- [ ] Create a test student
- [ ] View students list
- [ ] Check payments section
- [ ] Check security logs
- [ ] Test discussion group

### Student Tests
- [ ] Login as student
- [ ] Profile shows (read-only)
- [ ] Upload payment proof
- [ ] Check if file appears in Cloudinary
- [ ] View payment history
- [ ] Test discussion group
- [ ] Check notifications

---

## 🎉 Success!

Your app is live:
- **Frontend**: https://your-netlify-url.netlify.app
- **Backend**: https://your-render-url.onrender.com

**Admin Login:**
- Username: `admin`
- Password: `admin123`

---

## 📝 Save These URLs!

Write them down somewhere safe:
- Render Backend: ________________________________
- Netlify Frontend: ________________________________
- Render Dashboard: https://dashboard.render.com
- Netlify Dashboard: https://app.netlify.com

---

**Total Time: ~45 minutes**

**Start with Part 1!** 🚀
