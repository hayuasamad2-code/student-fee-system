# 🎓 Student Fee Management System

A complete web-based system for managing student fees, payments, and communication.

## ✨ Features

### For Students
- 📊 View payment history
- 💳 Submit monthly fee payments with proof
- 💬 Discussion group for communication
- 👤 View profile information
- 🔔 Real-time notifications for new messages

### For Administrators
- 👥 Manage student accounts (create, edit)
- 💰 Monitor all payments
- ✅ Track payment status
- 💬 Monitor discussion group
- 🔒 Security monitoring (failed login attempts)
- 📈 Dashboard with statistics
- 🔔 Notifications for new messages and security alerts

## 🛠️ Technology Stack

**Frontend:**
- HTML5, CSS3, JavaScript
- Font Awesome icons
- Responsive design

**Backend:**
- Node.js
- Express.js
- JWT authentication
- Bcrypt password hashing

**Database:**
- Microsoft SQL Server (LocalDB for development)
- Azure SQL Database (for production)

**File Storage:**
- Local storage (development)
- Cloudinary (production)

## 📋 Prerequisites

- Node.js (v18 or higher)
- SQL Server LocalDB
- Git

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/student-fee-system.git
cd student-fee-system
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Set Up Database

```bash
node setup-auto.js
```

This will:
- Create the database
- Create all tables
- Create an admin account (admin/admin123)

### 4. Start the Backend Server

```bash
node server_v14.js
```

Server will run on: http://localhost:5008

### 5. Open Frontend

Open `frontend/index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server frontend -p 8000
```

Then open: http://localhost:8000

## 🔐 Default Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**⚠️ Change these credentials immediately after first login!**

## 📦 Deployment

Ready to deploy your application to the internet?

### Quick Start
👉 See **QUICK-START-DEPLOYMENT.md** for a simplified guide

### Detailed Guide
👉 See **DEPLOYMENT-GUIDE.md** for complete step-by-step instructions

### Checklist
👉 Use **DEPLOYMENT-CHECKLIST.md** to track your progress

## 📁 Project Structure

```
student-fee-system/
├── backend/
│   ├── server_v14.js          # Main server file
│   ├── db.js                  # Database configuration
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── routes/                # API routes (if separated)
│   ├── uploads/               # Uploaded files (local only)
│   ├── setup_database.sql     # Database schema
│   ├── setup_security_table.sql # Security monitoring table
│   └── package.json           # Backend dependencies
│
├── frontend/
│   ├── index.html             # Landing page
│   ├── login/                 # Login page
│   ├── admin/                 # Admin panel
│   │   ├── admin.html
│   │   ├── admin.js
│   │   ├── admin_latest.js
│   │   └── admin.css
│   └── student/               # Student portal
│       ├── student.html
│       ├── student.js
│       ├── student_latest.js
│       └── student.css
│
├── DEPLOYMENT-GUIDE.md        # Complete deployment guide
├── QUICK-START-DEPLOYMENT.md  # Quick deployment guide
├── DEPLOYMENT-CHECKLIST.md    # Deployment checklist
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables (Production)

Create a `.env` file in the `backend` folder:

```env
DB_SERVER=your-server.database.windows.net
DB_NAME=student_system
DB_USER=sqladmin
DB_PASSWORD=your-password
JWT_SECRET=your-super-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
PORT=5008
```

See `backend/.env.example` for a template.

## 🐛 Troubleshooting

### Database Connection Issues
- Verify SQL Server LocalDB is installed
- Check connection string in `backend/db.js`
- Run setup scripts again

### Login Issues
- Clear browser cache and cookies
- Check if admin user exists in database
- Verify JWT secret is set

### File Upload Issues
- Check `backend/uploads/` folder exists
- Verify folder permissions
- Check file size limits

## 📝 API Endpoints

### Authentication
- `POST /login` - User login
- `GET /auth/me` - Get current user

### Students (Admin only)
- `GET /students` - Get all students
- `POST /create-student` - Create new student
- `POST /update-student/:id` - Update student

### Payments
- `GET /payments` - Get all payments
- `POST /payments` - Submit payment
- `POST /delete-payment/:id` - Delete payment (Admin)

### Messages
- `GET /messages` - Get all messages
- `POST /messages` - Send message
- `POST /delete-message/:id` - Delete message (Admin)

### Security (Admin only)
- `GET /security/alerts` - Get security alerts
- `GET /security/failed-logins` - Get failed login attempts
- `POST /security/clear-logs` - Clear old logs

## 🔒 Security Features

- JWT-based authentication
- Bcrypt password hashing
- Failed login attempt tracking
- IP-based security monitoring
- Role-based access control (Admin/Student)
- CORS protection

## 💰 Currency

The system uses **ETB (Ethiopian Birr)** as the default currency.

## 📱 Mobile Responsive

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🤝 Contributing

This is a private project. If you want to contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Created for HRU weltehi Student Union

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the deployment guides
3. Search for similar issues online
4. Contact the system administrator

---

**Version:** 1.0.0  
**Last Updated:** February 2026

🎉 **Happy coding!**
