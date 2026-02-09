# SQL Server Connection Guide

## Current Status
I've configured your backend to connect to SQL Server, but we need to ensure SQL Server is running and accessible.

## Quick Setup Steps

### Option 1: Automatic Setup (Recommended)
Run this command in the backend folder:
```bash
node setup-auto.js
```

This script will:
- ✅ Find your SQL Server instance automatically
- ✅ Create the `student_system` database
- ✅ Create all required tables (users, payments, messages)
- ✅ Update `db.js` with the correct configuration

### Option 2: Manual Setup (If Option 1 fails)

#### Step 1: Check if SQL Server is Running
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Look for one of these services:
   - **SQL Server (SQLEXPRESS)**
   - **SQL Server (MSSQLSERVER)**
4. If the service status is not "Running":
   - Right-click the service
   - Click **Start**

#### Step 2: Open SQL Server Management Studio (SSMS)
1. Open **SQL Server Management Studio**
2. Connect with:
   - **Server name**: `localhost\SQLEXPRESS` or `localhost` or `(local)\SQLEXPRESS`
   - **Authentication**: Windows Authentication

#### Step 3: Create the Database
Run this SQL command in SSMS:
```sql
CREATE DATABASE student_system;
GO

USE student_system;
GO

-- Create Users Table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    username NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('admin', 'student'))
);

-- Create Payments Table
CREATE TABLE payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Create Messages Table
CREATE TABLE messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES users(id)
);
```

#### Step 4: Update db.js
Edit `backend/db.js` and set the server name that worked in SSMS:
```javascript
server: "localhost\\SQLEXPRESS",  // Or whatever name worked for you
```

#### Step 5: Start Your Backend
```bash
npm start
```

You should see: **"SQL Server Connected ✅"**

#### Step 6: Create Admin User
Visit: http://localhost:5000/create-admin

---

## Troubleshooting

### "Cannot connect to SQL Server"
**Solution**: SQL Server is not installed or not running
- Install SQL Server Express from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
- Or start the SQL Server service (see Step 1 above)

### "Login failed"
**Solution**: Use Windows Authentication
- The current configuration uses Windows Authentication (trustedConnection: true)
- Make sure you're logged into Windows with an account that has SQL Server access

### "Database does not exist"
**Solution**: Create the database manually
- Open SSMS and run: `CREATE DATABASE student_system;` 
- Then run the table creation scripts (Step 3 above)

---

## Current Configuration

Your `db.js` is configured for:
- **Server**: localhost\\SQLEXPRESS (will auto-detect on setup)
- **Database**: student_system
- **Authentication**: Windows Authentication (Trusted Connection)
- **Encryption**: Disabled (for local development)

The server will automatically try these SQL Server names:
1. localhost\\SQLEXPRESS
2. localhost
3. (local)\\SQLEXPRESS  
4. .\\SQLEXPRESS
5. 127.0.0.1
