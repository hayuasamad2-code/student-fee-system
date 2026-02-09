-- Create failed_logins table for security monitoring
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'failed_logins')
BEGIN
    CREATE TABLE failed_logins (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(255) NOT NULL,
        ip_address NVARCHAR(100) NOT NULL,
        reason NVARCHAR(255) NOT NULL,
        attempt_time DATETIME NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX idx_ip_time ON failed_logins(ip_address, attempt_time);
    CREATE INDEX idx_attempt_time ON failed_logins(attempt_time);
    PRINT 'Table failed_logins created successfully';
END
ELSE
BEGIN
    PRINT 'Table failed_logins already exists';
END
