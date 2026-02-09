# 📋 Deployment Checklist

Use this checklist to ensure you complete all deployment steps.

## Before Deployment

- [ ] Code is working locally
- [ ] All features tested
- [ ] Admin account created
- [ ] Test data added

## Accounts Created

- [ ] GitHub account
- [ ] Heroku account
- [ ] Azure account
- [ ] Cloudinary account
- [ ] Netlify account

## Tools Installed

- [ ] Git installed
- [ ] Heroku CLI installed
- [ ] Azure Data Studio installed

## Database Setup (Azure SQL)

- [ ] Azure SQL Database created
- [ ] Firewall rules configured
- [ ] Connection string saved
- [ ] Tables created (setup_database.sql)
- [ ] Security table created (setup_security_table.sql)
- [ ] Admin user created
- [ ] Test connection successful

## File Storage Setup (Cloudinary)

- [ ] Cloudinary account created
- [ ] Cloud name copied
- [ ] API key copied
- [ ] API secret copied
- [ ] Credentials saved securely

## Backend Deployment (Heroku)

- [ ] Heroku app created
- [ ] Environment variables set:
  - [ ] DB_SERVER
  - [ ] DB_NAME
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] JWT_SECRET
  - [ ] CLOUDINARY_CLOUD_NAME
  - [ ] CLOUDINARY_API_KEY
  - [ ] CLOUDINARY_API_SECRET
  - [ ] NODE_ENV
- [ ] Procfile created
- [ ] package.json updated
- [ ] Code pushed to Heroku
- [ ] Backend URL tested (/api/ping)

## Frontend Deployment (Netlify)

- [ ] API URLs updated in frontend
- [ ] Frontend deployed to Netlify
- [ ] Frontend URL working
- [ ] Can access login page

## Testing

- [ ] Admin login works
- [ ] Student login works
- [ ] Dashboard loads
- [ ] Can create students
- [ ] Can upload payment proof
- [ ] Files upload to Cloudinary
- [ ] Payment history shows
- [ ] Discussion group works
- [ ] Security monitoring works
- [ ] Mobile responsive

## Post-Deployment

- [ ] Change default admin password
- [ ] Share URLs with users
- [ ] Set up database backups
- [ ] Monitor application logs
- [ ] Document any issues

## URLs to Save

- Frontend URL: ___________________________________
- Backend URL: ___________________________________
- Database Server: ___________________________________
- Cloudinary Dashboard: https://cloudinary.com/console

## Credentials to Save Securely

- Azure SQL Admin: ___________________________________
- Azure SQL Password: ___________________________________
- JWT Secret: ___________________________________
- Cloudinary Cloud Name: ___________________________________
- Cloudinary API Key: ___________________________________
- Cloudinary API Secret: ___________________________________

---

**Date Deployed:** _______________
**Deployed By:** _______________
**Notes:** _______________________________________________
