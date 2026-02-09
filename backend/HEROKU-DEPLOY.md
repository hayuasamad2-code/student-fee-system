# Quick Heroku Deployment Guide with PostgreSQL

## Step 1: Login to Heroku

Open PowerShell in the `backend` folder and run:

```powershell
heroku login
```

This will open your browser to login.

## Step 2: Create Heroku App

```powershell
heroku create student-fee-backend
```

This creates your app. You'll get a URL like: `https://student-fee-backend-xxxxx.herokuapp.com`

**IMPORTANT: Copy this URL! You'll need it later.**

## Step 3: Add PostgreSQL Database

```powershell
heroku addons:create heroku-postgresql:essential-0
```

This automatically creates a PostgreSQL database and sets the `DATABASE_URL` environment variable.

## Step 4: Set Environment Variables

Replace the values with your actual credentials:

```powershell
heroku config:set JWT_SECRET="your-random-secret-key-at-least-32-characters-long"
heroku config:set CLOUDINARY_CLOUD_NAME="dnra24mnh"
heroku config:set CLOUDINARY_API_KEY="your-cloudinary-api-key"
heroku config:set CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
heroku config:set NODE_ENV="production"
heroku config:set USE_POSTGRES="true"
```

## Step 5: Deploy to Heroku

```powershell
git add .
git commit -m "Deploy to Heroku with PostgreSQL"
git push heroku main
```

## Step 6: Set Up Database Tables

```powershell
heroku pg:psql < setup-postgres.sql
```

This creates all the tables and the admin user.

## Step 7: Test Your Backend

```powershell
heroku open
```

Or visit: `https://your-app-name.herokuapp.com/api/ping`

You should see: `{"status":"WORKS","version":14,"port":5008}`

## Step 8: Create Admin User Manually (if needed)

If the SQL script didn't create the admin, run:

```powershell
heroku run node -e "
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }});
bcrypt.hash('admin123', 10).then(hash => {
  pool.query('INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4)', ['Main Admin', 'admin', hash, 'admin'])
    .then(() => { console.log('Admin created!'); process.exit(0); })
    .catch(err => { console.error(err); process.exit(1); });
});
"
```

## Troubleshooting

### Check logs if something goes wrong:
```powershell
heroku logs --tail
```

### Check database connection:
```powershell
heroku pg:info
```

### Check environment variables:
```powershell
heroku config
```

---

## Next Steps After Backend is Deployed

1. Update frontend API URLs to use your Heroku URL
2. Deploy frontend to Netlify
3. Update CORS in Heroku: `heroku config:set FRONTEND_URL="https://your-netlify-url.netlify.app"`
4. Test everything!

---

## Important URLs

- **Backend API**: `https://your-app-name.herokuapp.com`
- **Heroku Dashboard**: https://dashboard.heroku.com/apps/your-app-name
- **Database**: Managed automatically by Heroku

---

Ready to start? Run the commands above one by one!
