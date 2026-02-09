# SQL Server Connection Guide

## Steps to Connect Your Backend to SQL Server

### 1. Update Database Credentials
Edit `backend/db.js` and update the following fields:

```javascript
const config = {
    server: "localhost",        // Change to your server name or IP
    database: "student_system",
    user: "sa",                 // Your SQL Server username
    password: "",               // YOUR SQL SERVER PASSWORD HERE
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};
```

**Common SQL Server Configurations:**
- **Default instance**: `server: "localhost"` or `server: "localhost\\SQLEXPRESS"`
- **Named instance**: `server: "localhost\\INSTANCENAME"`
- **Remote server**: `server: "192.168.1.100"` or `server: "servername.domain.com"`

### 2. Create the Database
Open **SQL Server Management Studio (SSMS)** and execute:

```sql
CREATE DATABASE student_system;
```

### 3. Create the Tables
Run the `setup_database.sql` script in SSMS:
1. Open SSMS
2. Connect to your SQL Server instance
3. Click **File > Open > File**
4. Select `backend/setup_database.sql`
5. Click **Execute** (or press F5)

### 4. Enable SQL Server Authentication (if using username/password)
If you're using SQL Server Authentication:

1. Right-click your server in SSMS > **Properties**
2. Go to **Security** page
3. Select **SQL Server and Windows Authentication mode**
4. Click **OK** and restart SQL Server

### 5. Create a Login (if needed)
If you need to create a new SQL user:

```sql
CREATE LOGIN your_username WITH PASSWORD = 'your_password';
USE student_system;
CREATE USER your_username FOR LOGIN your_username;
ALTER ROLE db_owner ADD MEMBER your_username;
```

### 6. Test the Connection
Start your backend server:
```bash
npm start
```

You should see: **"SQL Server Connected ✅"**

### 7. Create the Admin User
Visit: `http://localhost:5000/create-admin`

You should see: **"Admin Created ✅"**

---

## Troubleshooting

### Error: "Login failed for user"
- Check your username and password in `db.js`
- Ensure SQL Server Authentication is enabled
- Verify the user has permissions on the database

### Error: "Cannot connect to server"
- Check if SQL Server service is running
- Verify the server name (might need `localhost\\SQLEXPRESS`)
- Check if TCP/IP is enabled in SQL Server Configuration Manager

### Error: "Invalid object name"
- Run the `setup_database.sql` script to create tables
- Make sure you're using the correct database name

### Connection Timeout
- Add `connectionTimeout: 30000` to options in `db.js`
- Check firewall settings
