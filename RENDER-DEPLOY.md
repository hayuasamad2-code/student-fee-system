# 🚀 Deploy to Render.com (No Credit Card Required!)

## Why Render?
- ✅ Completely FREE (no credit card needed)
- ✅ Free PostgreSQL database included
- ✅ Easy deployment from GitHub
- ✅ Automatic HTTPS
- ✅ Similar to Heroku but better free tier

---

## Step 1: Create Render Account

1. Go to https://render.com/
2. Click "Get Started for Free"
3. Sign up with GitHub (easiest) or email
4. Verify your email

---

## Step 2: Create PostgreSQL Database

1. From Render Dashboard, click "New +"
2. Select "PostgreSQL"
3. Fill in:
   - **Name**: `student-system-db`
   - **Database**: `student_system`
   - **User**: `student_admin` (auto-filled)
   - **Region**: Choose closest to you
   - **Plan**: **Free** (select this!)
4. Click "Create Database"
5. Wait 1-2 minutes for it to be ready
6. **IMPORTANT**: Copy the "Internal Database URL" - you'll need it!
   - It looks like: `postgresql://student_admin:xxxxx@dpg-xxxxx/student_system`

---

## Step 3: Create Web Service

1. Click "New +" again
2. Select "Web Service"
3. Connect your GitHub repository:
   - Click "Connect account" if needed
   - Select your repository: `student-fee-system`
   - Click "Connect"
4. Fill in the settings:
   - **Name**: `student-fee-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server-postgres.js`
   - **Plan**: **Free** (select this!)

---

## Step 4: Add Environment Variables

Scroll down to "Environment Variables" section and add these:

Click "Add Environment Variable" for each:

1. **Key**: `DATABASE_URL`
   **Value**: (paste the Internal Database URL from Step 2)

2. **Key**: `JWT_SECRET`
   **Value**: `student-fee-system-secret-key-2026-secure`

3. **Key**: `CLOUDINARY_CLOUD_NAME`
   **Value**: `dnra24mnh`

4. **Key**: `CLOUDINARY_API_KEY`
   **Value**: (your Cloudinary API key from https://cloudinary.com/console)

5. **Key**: `CLOUDINARY_API_SECRET`
   **Value**: (your Cloudinary API secret)

6. **Key**: `NODE_ENV`
   **Value**: `production`

7. **Key**: `USE_POSTGRES`
   **Value**: `true`

---

## Step 5: Deploy!

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your GitHub repo
   - Install dependencies
   - Start your server
3. Wait 3-5 minutes for deployment
4. You'll get a URL like: `https://student-fee-backend.onrender.com`

---

## Step 6: Set Up Database Tables

1. Go to your PostgreSQL database in Render dashboard
2. Click "Connect" → "External Connection"
3. Copy the "PSQL Command"
4. Open PowerShell and run that command (it will connect to your database)
5. Once connected, copy and paste the contents of `backend/setup-postgres.sql`
6. Press Enter to execute
7. Type `\q` to exit

**OR use the Render Shell:**

1. Go to your Web Service in Render
2. Click "Shell" tab
3. Run:
```bash
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const fs = require('fs');
const sql = fs.readFileSync('setup-postgres.sql', 'utf8');
pool.query(sql).then(() => { console.log('Tables created!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });
"
```

---

## Step 7: Create Admin User

In the Render Shell (or via PSQL), run:

```bash
node -e "
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
bcrypt.hash('admin123', 10).then(hash => {
  pool.query('INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING', ['Main Admin', 'admin', hash, 'admin'])
    .then(() => { console.log('Admin created!'); process.exit(0); })
    .catch(err => { console.error(err); process.exit(1); });
});
"
```

---

## Step 8: Test Your Backend

Visit: `https://your-app-name.onrender.com/api/ping`

You should see:
```json
{"status":"WORKS","version":15,"port":5008,"database":"PostgreSQL"}
```

✅ **Backend is live!**

---

## Step 9: Deploy Frontend to Netlify

1. Go to https://app.netlify.com
2. Sign up (free, no credit card)
3. Click "Add new site" → "Deploy manually"
4. **FIRST**: Update frontend API URLs:
   - Open `frontend/admin/admin_latest.js`
   - Replace `http://localhost:5008` with `https://your-render-url.onrender.com`
   - Do the same for `frontend/student/student_latest.js`
5. Drag your `frontend` folder to Netlify
6. Wait for deployment
7. You'll get a URL like: `https://random-name.netlify.app`

---

## Step 10: Update CORS

1. Go back to Render dashboard
2. Go to your Web Service
3. Click "Environment"
4. Add new variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-netlify-url.netlify.app`
5. Click "Save Changes"
6. Service will automatically redeploy

---

## 🎉 You're Done!

Your app is now live:
- **Frontend**: https://your-netlify-url.netlify.app
- **Backend**: https://your-render-url.onrender.com
- **Database**: Managed by Render

**Login:**
- Username: `admin`
- Password: `admin123`

---

## 📝 Important Notes

### Free Tier Limitations:
- Render free services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Database has 1GB storage limit
- Plenty for your student management system!

### Keeping Service Awake (Optional):
Use a service like UptimeRobot (free) to ping your backend every 10 minutes to keep it awake.

---

## 🆘 Troubleshooting

**Check Logs:**
- Go to your Web Service in Render
- Click "Logs" tab
- See real-time logs

**Database Issues:**
- Go to PostgreSQL database
- Click "Logs" tab
- Check connection issues

**Redeploy:**
- Go to Web Service
- Click "Manual Deploy" → "Deploy latest commit"

---

**Ready? Start with Step 1!** 🚀
