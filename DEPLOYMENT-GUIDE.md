# 🚀 Complete Deployment Guide - Student Fee Management System

This guide will help you deploy your application to the internet so anyone can access it.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Prepare Your Code](#step-1-prepare-your-code)
4. [Step 2: Set Up Cloud Database](#step-2-set-up-cloud-database)
5. [Step 3: Set Up File Storage](#step-3-set-up-file-storage)
6. [Step 4: Deploy Backend](#step-4-deploy-backend)
7. [Step 5: Deploy Frontend](#step-5-deploy-frontend)
8. [Step 6: Testing](#step-6-testing)
9. [Troubleshooting](#troubleshooting)

---

## Overview

**What We'll Deploy:**
- ✅ Backend API (Node.js) → Heroku
- ✅ Frontend (HTML/CSS/JS) → Netlify
- ✅ Database (SQL Server) → Azure SQL Database
- ✅ File Storage (Images) → Cloudinary

**Estimated Time:** 2-3 hours  
**Cost:** FREE (using free tiers)

---

## Prerequisites

Before starting, create accounts on these platforms:

1. **GitHub Account** - https://github.com/signup
2. **Heroku Account** - https://signup.heroku.com/
3. **Azure Account** - https://azure.microsoft.com/free/
4. **Cloudinary Account** - https://cloudinary.com/users/register/free
5. **Netlify Account** - https://app.netlify.com/signup

**Install Required Tools:**
- Git: https://git-scm.com/downloads
- Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
- Node.js (already installed)

---

## Step 1: Prepare Your Code

### 1.1 Initialize Git Repository

Open terminal in your project folder:

```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Name: `student-fee-system`
3. Click "Create repository"
4. Run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/student-fee-system.git
git branch -M main
git push -u origin main
```

### 1.3 Add Environment Variables Support

Your code is already prepared with `.env` file support. We'll configure it in deployment.

---

## Step 2: Set Up Cloud Database (Azure SQL)

### 2.1 Create Azure SQL Database

1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search for "SQL Database"
4. Click "Create"

**Configuration:**
- **Subscription:** Free Trial
- **Resource Group:** Create new → `student-system-rg`
- **Database Name:** `student_system`
- **Server:** Create new
  - **Server Name:** `student-system-server` (must be unique)
  - **Location:** Choose closest to you
  - **Authentication:** SQL authentication
  - **Admin Login:** `sqladmin`
  - **Password:** Create a strong password (SAVE THIS!)
- **Compute + Storage:** Click "Configure database"
  - Select "Basic" (cheapest option, ~$5/month)
- Click "Review + Create" → "Create"

### 2.2 Configure Firewall

1. Go to your SQL Server (not database)
2. Click "Networking" (left menu)
3. Under "Firewall rules":
   - Check "Allow Azure services and resources to access this server"
   - Click "Add client IP" (adds your current IP)
   - Click "Save"

### 2.3 Get Connection String

1. Go to your database (not server)
2. Click "Connection strings" (left menu)
3. Copy the "ADO.NET" connection string
4. Replace `{your_password}` with your actual password
5. Save this - you'll need it later

**Example:**
```
Server=tcp:student-system-server.database.windows.net,1433;Initial Catalog=student_system;Persist Security Info=False;User ID=sqladmin;Password=YOUR_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### 2.4 Set Up Database Tables

1. Download Azure Data Studio: https://aka.ms/azuredatastudio
2. Connect to your Azure SQL Database using the connection string
3. Run these SQL scripts in order:

**Script 1: Create Tables**
```sql
-- Run backend/setup_database.sql
```

**Script 2: Create Security Table**
```sql
-- Run backend/setup_security_table.sql
```

**Script 3: Create Admin User**
```sql
-- Run the admin creation part from your setup scripts
```

---

## Step 3: Set Up File Storage (Cloudinary)

### 3.1 Get Cloudinary Credentials

1. Go to https://cloudinary.com/console
2. Copy these values from your dashboard:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Save these - you'll need them later

### 3.2 Install Cloudinary Package

In your backend folder:

```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

---

## Step 4: Deploy Backend (Heroku)

### 4.1 Login to Heroku

```bash
heroku login
```

### 4.2 Create Heroku App

```bash
cd backend
heroku create student-fee-backend
```

This creates an app with a URL like: `https://student-fee-backend-xxxxx.herokuapp.com`

### 4.3 Set Environment Variables

Replace the values with your actual credentials:

```bash
heroku config:set DB_SERVER="student-system-server.database.windows.net"
heroku config:set DB_NAME="student_system"
heroku config:set DB_USER="sqladmin"
heroku config:set DB_PASSWORD="YOUR_AZURE_PASSWORD"
heroku config:set JWT_SECRET="your-super-secret-key-change-this"
heroku config:set CLOUDINARY_CLOUD_NAME="your-cloud-name"
heroku config:set CLOUDINARY_API_KEY="your-api-key"
heroku config:set CLOUDINARY_API_SECRET="your-api-secret"
heroku config:set NODE_ENV="production"
```

### 4.4 Create Procfile

In the `backend` folder, create a file named `Procfile` (no extension):

```
web: node server_v14.js
```

### 4.5 Update package.json

Make sure your `backend/package.json` has:

```json
{
  "scripts": {
    "start": "node server_v14.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### 4.6 Deploy to Heroku

```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

### 4.7 Test Backend

Open: `https://your-app-name.herokuapp.com/api/ping`

You should see: `{"status":"WORKS","version":14,"port":5008}`

---

## Step 5: Deploy Frontend (Netlify)

### 5.1 Update API URLs in Frontend

You need to update all API calls to use your Heroku backend URL.

**Option A: Manual Update (Quick but not recommended)**

In each frontend file, replace:
```javascript
const res = await fetch("/payments", {
```

With:
```javascript
const res = await fetch("https://your-app-name.herokuapp.com/payments", {
```

**Option B: Use Environment Variable (Recommended)**

Create `frontend/config.js`:
```javascript
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5008' 
  : 'https://your-app-name.herokuapp.com';
```

Then update all fetch calls to use `API_URL`.

### 5.2 Deploy to Netlify

**Method 1: Drag and Drop (Easiest)**

1. Go to https://app.netlify.com
2. Click "Add new site" → "Deploy manually"
3. Drag your entire `frontend` folder
4. Wait for deployment
5. You'll get a URL like: `https://random-name-12345.netlify.app`

**Method 2: GitHub (Recommended)**

1. Push your code to GitHub (already done in Step 1)
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import from Git"
4. Choose GitHub → Select your repository
5. Configure:
   - **Base directory:** `frontend`
   - **Build command:** (leave empty)
   - **Publish directory:** `.` (dot)
6. Click "Deploy site"

### 5.3 Custom Domain (Optional)

1. In Netlify, go to "Domain settings"
2. Click "Add custom domain"
3. Follow instructions to connect your domain

---

## Step 6: Testing

### 6.1 Test Login

1. Go to your Netlify URL
2. Try logging in with admin credentials
3. Check if dashboard loads

### 6.2 Test Student Features

1. Create a student account
2. Login as student
3. Try uploading a payment proof
4. Check if file uploads to Cloudinary

### 6.3 Test Admin Features

1. Login as admin
2. Check all students list
3. Check payments monitor
4. Check security logs
5. Check discussion group

---

## Troubleshooting

### Backend Issues

**Error: "Cannot connect to database"**
- Check Azure SQL firewall rules
- Verify connection string in Heroku config
- Make sure you added Heroku IP to Azure firewall

**Error: "Application error"**
```bash
heroku logs --tail
```
This shows real-time logs to debug issues.

**Error: "Module not found"**
```bash
heroku run npm install
```

### Frontend Issues

**Error: "Failed to fetch"**
- Check if backend URL is correct
- Check CORS settings in backend
- Open browser console (F12) to see exact error

**Error: "CORS policy"**
Add to your backend `server_v14.js`:
```javascript
app.use(cors({
  origin: ['https://your-netlify-url.netlify.app'],
  credentials: true
}));
```

### Database Issues

**Error: "Login failed for user"**
- Verify username and password
- Check if user exists in Azure SQL
- Verify connection string format

**Error: "Table does not exist"**
- Run all SQL setup scripts in Azure Data Studio
- Check if tables were created successfully

---

## 🎉 Congratulations!

Your application is now live on the internet!

**Your URLs:**
- Frontend: `https://your-site.netlify.app`
- Backend API: `https://your-app.herokuapp.com`

**Share these URLs with your users!**

---

## 📝 Important Notes

1. **Free Tier Limitations:**
   - Heroku: App sleeps after 30 min of inactivity (first request takes 10-15 seconds)
   - Azure SQL: Basic tier has limited performance
   - Cloudinary: 10GB storage, 25GB bandwidth/month

2. **Security:**
   - Change default admin password immediately
   - Use strong JWT secret
   - Enable HTTPS (automatic on Heroku/Netlify)

3. **Backups:**
   - Azure SQL: Enable automated backups in Azure portal
   - Export database regularly

4. **Monitoring:**
   - Heroku: `heroku logs --tail`
   - Netlify: Check deploy logs in dashboard
   - Azure: Monitor database performance

---

## 🆘 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Search the error on Google
3. Check Heroku/Netlify/Azure documentation
4. Ask for help with specific error messages

---

## 📚 Additional Resources

- Heroku Documentation: https://devcenter.heroku.com/
- Netlify Documentation: https://docs.netlify.com/
- Azure SQL Documentation: https://docs.microsoft.com/azure/sql-database/
- Cloudinary Documentation: https://cloudinary.com/documentation

---

**Good luck with your deployment! 🚀**
