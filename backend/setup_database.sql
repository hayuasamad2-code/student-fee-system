-- SQL Server Setup Script for student_system database
-- Run this in SQL Server Management Studio

USE student_system;
GO

-- Create Users Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        username NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) NOT NULL CHECK (role IN ('admin', 'student'))
    );
    PRINT 'Users table created successfully ✓';
END
ELSE
    PRINT 'Users table already exists';
GO

-- Create Payments Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payments')
BEGIN
    CREATE TABLE payments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        student_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        month NVARCHAR(50) NOT NULL,
        status NVARCHAR(50) NOT NULL,
        FOREIGN KEY (student_id) REFERENCES users(id)
    );
    PRINT 'Payments table created successfully ✓';
END
ELSE
    PRINT 'Payments table already exists';
GO

-- Create Messages Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'messages')
BEGIN
    CREATE TABLE messages (
        id INT IDENTITY(1,1) PRIMARY KEY,
        student_id INT NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (student_id) REFERENCES users(id)
    );
    PRINT 'Messages table created successfully ✓';
END
ELSE
    PRINT 'Messages table already exists';
GO

PRINT 'Database setup complete! ✓';
