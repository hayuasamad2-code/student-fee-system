# Quick Setup Guide - Connect Backend to SQL Server

## You have SQL Server Management Studio installed ✅

Now let's connect your backend to it:

### Step 1: Find Your Server Name

In SQL Server Management Studio:
1. Look at the top of the Object Explorer (left panel)
2. You'll see something like:
   - `localhost\SQLEXPRESS`
   - `(local)\SQLEXPRESS`
   - `localhost`
   - or your computer name

**Write down this server name!**

### Step 2: Create the Tables in SSMS

Open a new query window in SSMS and run this SQL:

```sql
USE student_system;
GO

-- Create Users Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    username NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('admin', 'student'))
);

-- Create Payments Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payments')
CREATE TABLE payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Create Messages Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'messages')
CREATE TABLE messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

SELECT 'Tables created successfully!' AS Result;
```

### Step 3: Tell me your server name

Once you run the SQL above, please tell me what server name you used in SSMS, and I'll update your backend configuration to match!

---

## Quick Option: Use MySQL Instead

I noticed you also have MySQL installed and running. If you want to use MySQL instead of SQL Server, I can help you set that up too - it would be simpler!

Just let me know which database you prefer to use:
- **SQL Server** (requires the server name from SSMS)
- **MySQL** (already running and ready to go)
