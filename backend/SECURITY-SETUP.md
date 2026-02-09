# Security Monitoring Setup

## Overview
The security monitoring system tracks failed login attempts and alerts administrators about suspicious activity.

## Setup Instructions

### 1. Create the Security Table

Run this command in the backend folder:

```bash
node setup-security.js
```

This will create the `failed_logins` table in your database.

### 2. Restart Your Server

After creating the table, restart your backend server:

```bash
node server_v14.js
```

## Features

### For Administrators

1. **Security Dashboard**
   - Access via the "Security" menu item in the admin panel
   - Red notification badge shows number of suspicious IPs

2. **Security Alerts**
   - Shows IP addresses with 3+ failed login attempts in the last 24 hours
   - Displays:
     - IP address
     - Number of failed attempts
     - Usernames tried
     - Last attempt time

3. **Failed Login Log**
   - Complete log of all failed login attempts
   - Shows:
     - Username attempted
     - IP address
     - Reason for failure (User not found / Wrong password)
     - Timestamp
     - Recent attempts from same IP (last hour)

4. **Auto-Refresh**
   - Security notifications update every 10 seconds
   - Badge appears when suspicious activity is detected

5. **Log Management**
   - "Clear Old Logs" button removes logs older than 7 days
   - Keeps database clean and performant

## How It Works

1. **Login Tracking**
   - Every failed login attempt is logged with:
     - Username
     - IP address
     - Reason (user not found or wrong password)
     - Timestamp

2. **Alert Generation**
   - System automatically identifies IPs with 3+ failed attempts in 24 hours
   - These appear in the Security Alerts section

3. **Notification Badge**
   - Red badge on "Security" menu shows count of suspicious IPs
   - Updates automatically every 10 seconds
   - Clears when admin views the Security page

## Security Best Practices

- Check the Security dashboard regularly
- Investigate IPs with multiple failed attempts
- Consider blocking IPs with excessive failed attempts
- Clear old logs periodically to maintain performance

## Database Table Structure

```sql
CREATE TABLE failed_logins (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255) NOT NULL,
    ip_address NVARCHAR(100) NOT NULL,
    reason NVARCHAR(255) NOT NULL,
    attempt_time DATETIME NOT NULL DEFAULT GETDATE()
);
```

## API Endpoints

- `GET /security/alerts` - Get IPs with 3+ failed attempts (24h)
- `GET /security/failed-logins` - Get all failed login attempts
- `POST /security/clear-logs` - Clear logs older than 7 days

All endpoints require admin authentication.
