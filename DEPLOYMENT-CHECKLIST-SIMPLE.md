# ✅ Deployment Checklist

## Before You Start
- [ ] Heroku CLI installed (`heroku --version` works)
- [ ] Cloudinary account ready (Cloud Name: dnra24mnh)
- [ ] Get Cloudinary API Key and Secret from https://cloudinary.com/console

---

## Backend Deployment (30 minutes)

### 1. Login to Heroku
```powershell
heroku login
```
- [ ] Logged in successfully

### 2. Create App
```powershell
cd backend
heroku create student-fee-backend
```
- [ ] App created
- [ ] Copy the URL: ___________________________________

### 3. Add Database
```powershell
heroku addons:create heroku-postgresql:essential-0
```
- [ ] PostgreSQL added

### 4. Set Environment Variables
```powershell
heroku config:set JWT_SECRET="student-fee-system-secret-key-2026-secure"
heroku config:set CLOUDINARY_CLOUD_NAME="dnra24mnh"
heroku config:set CLOUDINARY_API_KEY="YOUR_KEY_HERE"
heroku config:set CLOUDINARY_API_SECRET="YOUR_SECRET_HERE"
heroku config:set NODE_ENV="production"
```
- [ ] All variables set

### 5. Deploy
```powershell
git push heroku main
```
- [ ] Deployed successfully

### 6. Setup Database
```powershell
heroku pg:psql < setup-postgres.sql
```
- [ ] Tables created

### 7. Create Admin
```powershell
heroku run node -e "const bcrypt = require('bcrypt'); const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }}); bcrypt.hash('admin123', 10).then(hash => { pool.query('INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING', ['Main Admin', 'admin', hash, 'admin']).then(() => { console.log('Admin created!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); }); });"
```
- [ ] Admin user created

### 8. Test Backend
Visit: `https://your-app-name.herokuapp.com/api/ping`
- [ ] Backend working

---

## Frontend Deployment (20 minutes)

### 1. Update API URLs
Update these files with your Heroku URL:
- [ ] `frontend/admin/admin_latest.js`
- [ ] `frontend/student/student_latest.js`

### 2. Deploy to Netlify
1. Go to https://app.netlify.com
2. Drag `frontend` folder
3. Wait for deployment
- [ ] Frontend deployed
- [ ] Copy Netlify URL: ___________________________________

### 3. Update CORS
```powershell
heroku config:set FRONTEND_URL="https://your-netlify-url.netlify.app"
```
- [ ] CORS updated

---

## Testing (15 minutes)

### Admin Tests
- [ ] Can login as admin (username: admin, password: admin123)
- [ ] Can see dashboard
- [ ] Can create student
- [ ] Can view payments
- [ ] Can view security logs
- [ ] Discussion group works

### Student Tests
- [ ] Can login as student
- [ ] Can see profile (read-only)
- [ ] Can upload payment proof
- [ ] File uploads to Cloudinary
- [ ] Can see payment history
- [ ] Discussion group works
- [ ] Notifications work

---

## 🎉 Done!

Your app is live at:
- **Frontend**: https://your-netlify-url.netlify.app
- **Backend**: https://your-heroku-url.herokuapp.com

---

## Important Info

**Admin Login:**
- Username: `admin`
- Password: `admin123`
- **Change this after first login!**

**Database**: Heroku PostgreSQL (managed automatically)
**File Storage**: Cloudinary
**All features working**: ✅

---

**Start with Backend Deployment above!** 🚀
