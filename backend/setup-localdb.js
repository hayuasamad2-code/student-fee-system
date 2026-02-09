const sql = require("mssql/msnodesqlv8");

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=student_system;Trusted_Connection=yes;'
};

async function setup() {
    console.log("Setting up tables in (localdb)\\MSSQLLocalDB...");
    try {
        const pool = await sql.connect(config);

        console.log("Creating Users table...");
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
            BEGIN
                CREATE TABLE users (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL,
                    username NVARCHAR(255) NOT NULL UNIQUE,
                    password NVARCHAR(255) NOT NULL,
                    role NVARCHAR(50) NOT NULL CHECK (role IN ('admin', 'student'))
                );
                PRINT 'Users table created.';
            END
        `);

        console.log("Creating Payments table...");
        await pool.request().query(`
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
                PRINT 'Payments table created.';
            END
        `);

        console.log("Creating Messages table...");
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'messages')
            BEGIN
                CREATE TABLE messages (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    student_id INT NOT NULL,
                    message NVARCHAR(MAX) NOT NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (student_id) REFERENCES users(id)
                );
                PRINT 'Messages table created.';
            END
        `);

        console.log("✅ All tables are ready!");
        await pool.close();
    } catch (err) {
        console.error("❌ Setup failed:");
        console.error(err);
    }
}

setup();
