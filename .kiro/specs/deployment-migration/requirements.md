# Deployment Migration Requirements

## 1. Overview

Transform the Student Fee Management System from a local development setup (LocalDB + local file storage) to a production-ready cloud deployment with Azure SQL Database, Cloudinary file storage, Heroku backend hosting, and Netlify frontend hosting.

## 2. Current State

### 2.1 Local Setup
- **Database**: SQL Server LocalDB (Windows-only, not accessible online)
- **File Storage**: Local filesystem (`backend/uploads/` folder)
- **Backend**: Running on `localhost:5008`
- **Frontend**: Running locally, accessing local backend
- **Authentication**: JWT with hardcoded secret
- **Configuration**: Hardcoded connection strings

### 2.2 Limitations
- Cannot be accessed from outside the local machine
- Files stored locally won't be accessible when deployed
- LocalDB connection string won't work on cloud platforms
- No environment variable configuration
- CORS not configured for production URLs

## 3. Target State

### 3.1 Production Architecture
- **Database**: Azure SQL Database (cloud-hosted, globally accessible)
- **File Storage**: Cloudinary (cloud CDN for images)
- **Backend**: Heroku (Node.js hosting platform)
- **Frontend**: Netlify (static site hosting)
- **Configuration**: Environment variables for all sensitive data
- **Security**: Proper CORS, secure secrets, HTTPS

### 3.2 User Accounts Setup
- ✅ Cloudinary Account Created (Cloud Name: dnra24mnh)
- 🔄 Azure SQL Database (in progress - user creating database)
- ⏳ Heroku CLI (needs installation)
- ⏳ Heroku Account (needs creation)
- ⏳ Netlify Account (needs creation)

## 4. User Stories

### 4.1 As a Developer
- I want to install Heroku CLI so I can deploy the backend
- I want to configure environment variables so sensitive data is not hardcoded
- I want to migrate database connection from LocalDB to Azure SQL
- I want to migrate file uploads from local storage to Cloudinary
- I want to deploy backend to Heroku so it's accessible online
- I want to deploy frontend to Netlify so users can access it
- I want to test the deployed application to ensure everything works

### 4.2 As an Administrator
- I want the deployed system to work exactly like the local version
- I want all existing features (payments, security logs, discussion) to work online
- I want file uploads to be stored securely in the cloud
- I want the system to be accessible from any device with internet

### 4.3 As a Student
- I want to access the system from my mobile phone or any computer
- I want to upload payment proofs that are stored securely
- I want the system to be fast and reliable

## 5. Acceptance Criteria

### 5.1 Heroku CLI Installation
- [ ] Heroku CLI is installed on Windows system
- [ ] User can run `heroku --version` successfully
- [ ] User can login with `heroku login`

### 5.2 Azure SQL Database Setup
- [ ] Azure SQL Database is created and accessible
- [ ] Firewall rules allow connections from Heroku and user's IP
- [ ] All database tables are created (users, payments, messages, failed_logins)
- [ ] Admin user is created in Azure database
- [ ] Connection string is obtained and tested

### 5.3 Backend Environment Configuration
- [ ] `.env` file support is implemented in backend code
- [ ] Database connection uses environment variables
- [ ] JWT secret uses environment variable
- [ ] Cloudinary credentials use environment variables
- [ ] Backend works locally with `.env` file

### 5.4 Cloudinary Integration
- [ ] Cloudinary npm package is installed
- [ ] File upload code is updated to use Cloudinary instead of local storage
- [ ] Uploaded files are stored in Cloudinary
- [ ] File URLs point to Cloudinary CDN
- [ ] Old local uploads are migrated or handled gracefully

### 5.5 Backend Deployment to Heroku
- [ ] Heroku app is created
- [ ] Environment variables are set in Heroku
- [ ] Code is pushed to Heroku
- [ ] Backend starts successfully on Heroku
- [ ] All API endpoints work on Heroku URL
- [ ] Database connection works from Heroku

### 5.6 Frontend Configuration
- [ ] API URLs are updated to use Heroku backend URL
- [ ] CORS is configured in backend to allow frontend domain
- [ ] Frontend works locally with Heroku backend

### 5.7 Frontend Deployment to Netlify
- [ ] Netlify account is created
- [ ] Frontend is deployed to Netlify
- [ ] Frontend loads successfully on Netlify URL
- [ ] All pages are accessible

### 5.8 End-to-End Testing
- [ ] Admin can login on deployed site
- [ ] Admin can create students
- [ ] Admin can view all students
- [ ] Admin can view payments
- [ ] Admin can view security logs
- [ ] Admin can use discussion group
- [ ] Student can login on deployed site
- [ ] Student can view their profile (read-only)
- [ ] Student can upload payment proof (file goes to Cloudinary)
- [ ] Student can view payment history
- [ ] Student can use discussion group
- [ ] Notifications work for discussion messages
- [ ] Security monitoring logs failed login attempts

### 5.9 Performance & Security
- [ ] HTTPS is enabled (automatic on Heroku/Netlify)
- [ ] JWT secret is strong and unique
- [ ] Database credentials are secure
- [ ] No sensitive data in code repository
- [ ] Application loads within reasonable time
- [ ] File uploads work reliably

## 6. Technical Requirements

### 6.1 Backend Code Changes
- Update `db.js` to use Azure SQL connection string from environment variables
- Update `server_v14.js` to use environment variables for JWT secret
- Integrate Cloudinary SDK for file uploads
- Update multer configuration to use Cloudinary storage
- Update CORS configuration to allow production frontend URL
- Add proper error handling for cloud services

### 6.2 Frontend Code Changes
- Update all API fetch calls to use Heroku backend URL
- Consider creating a config file for API URL management
- Ensure all features work with cloud backend

### 6.3 Database Migration
- Export existing data from LocalDB (if any important data exists)
- Run SQL setup scripts on Azure SQL Database
- Create admin user in Azure database
- Verify all tables and relationships

### 6.4 Configuration Files
- Create `.env.example` template (already exists)
- Ensure `.gitignore` excludes sensitive files (already exists)
- Create `Procfile` for Heroku (already exists)
- Update `package.json` with correct start script (already done)

## 7. Dependencies

### 7.1 External Services
- Azure SQL Database (requires Azure account)
- Cloudinary (account created: dnra24mnh)
- Heroku (requires account and CLI)
- Netlify (requires account)

### 7.2 NPM Packages to Install
- `cloudinary` - Cloudinary SDK
- `multer-storage-cloudinary` - Multer storage engine for Cloudinary
- `dotenv` - Environment variable loader (already installed)

### 7.3 Tools Required
- Heroku CLI (needs installation)
- Git (for deployment)
- Azure Data Studio or SQL Server Management Studio (for database setup)

## 8. Constraints

### 8.1 Free Tier Limitations
- Heroku: App sleeps after 30 minutes of inactivity
- Azure SQL: Basic tier has limited performance
- Cloudinary: 10GB storage, 25GB bandwidth/month
- Netlify: 100GB bandwidth/month

### 8.2 Technical Constraints
- Must maintain all existing functionality
- Must not break current local development setup
- Must handle migration of existing uploaded files
- Must maintain backward compatibility during transition

## 9. Out of Scope

- Custom domain setup (optional, can be done later)
- Database backup automation (can be configured in Azure portal)
- Performance optimization (can be done after deployment)
- Monitoring and alerting setup (can be added later)
- CI/CD pipeline (can be added later)

## 10. Success Metrics

- [ ] Application is accessible via public URL
- [ ] All features work identically to local version
- [ ] File uploads are stored in Cloudinary
- [ ] Database operations work with Azure SQL
- [ ] No errors in browser console or server logs
- [ ] User can access from mobile device
- [ ] Response times are acceptable (< 3 seconds for most operations)

## 11. Risks & Mitigation

### 11.1 Risk: Database Connection Fails
**Mitigation**: Test connection string locally before deploying, verify firewall rules

### 11.2 Risk: File Upload Fails
**Mitigation**: Test Cloudinary integration locally first, implement proper error handling

### 11.3 Risk: CORS Errors
**Mitigation**: Configure CORS properly before frontend deployment, test with actual URLs

### 11.4 Risk: Environment Variables Not Set
**Mitigation**: Create checklist of all required variables, verify before deployment

### 11.5 Risk: Heroku App Crashes
**Mitigation**: Test locally with production-like configuration, check Heroku logs

## 12. Timeline Estimate

- Heroku CLI Installation: 10 minutes
- Azure SQL Setup: 30 minutes
- Backend Code Updates: 1 hour
- Cloudinary Integration: 45 minutes
- Backend Deployment: 30 minutes
- Frontend Updates: 30 minutes
- Frontend Deployment: 15 minutes
- Testing: 45 minutes

**Total Estimated Time**: 4-5 hours

## 13. Next Steps

1. Install Heroku CLI
2. Complete Azure SQL Database setup
3. Create design document with detailed implementation plan
4. Execute implementation tasks
5. Deploy and test
