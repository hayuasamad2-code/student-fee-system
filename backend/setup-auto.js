const sql = require("mssql");

async function setupDatabase() {
    console.log("=".repeat(60));
    console.log("SQL Server Database Setup");
    console.log("=".repeat(60));

    const serverVariants = [
        "localhost\\SQLEXPRESS",
        "localhost",
        "(local)\\SQLEXPRESS",
        ".\\SQLEXPRESS",
        "127.0.0.1"
    ];

    let workingServer = null;
    let masterPool = null;

    // Step 1: Find working SQL Server connection
    console.log("\n📡 Step 1: Finding SQL Server instance...\n");

    for (const server of serverVariants) {
        try {
            console.log(`   Trying: ${server}...`);
            const config = {
                server: server,
                database: "master",
                options: {
                    encrypt: false,
                    trustServerCertificate: true,
                    trustedConnection: true,
                    enableArithAbort: true
                },
                connectionTimeout: 5000
            };

            masterPool = await sql.connect(config);
            workingServer = server;
            console.log(`   ✅ Connected to SQL Server at: ${server}\n`);
            break;
        } catch (err) {
            console.log(`   ❌ Failed: ${err.message.split('\n')[0]}`);
        }
    }

    if (!workingServer) {
        console.log("\n" + "=".repeat(60));
        console.log("❌ ERROR: Cannot connect to SQL Server");
        console.log("=".repeat(60));
        console.log("\nPossible solutions:");
        console.log("1. Make sure SQL Server is installed");
        console.log("2. Start SQL Server service:");
        console.log("   - Press Win+R, type 'services.msc'");
        console.log("   - Find 'SQL Server (SQLEXPRESS)' or 'SQL Server (MSSQLSERVER)'");
        console.log("   - Right-click and select 'Start'");
        console.log("3. Enable TCP/IP in SQL Server Configuration Manager");
        console.log("=".repeat(60));
        process.exit(1);
    }

    try {
        // Step 2: Check if database exists, create if not
        console.log("📊 Step 2: Checking database 'student_system'...\n");

        const dbCheck = await masterPool.request()
            .query("SELECT name FROM sys.databases WHERE name = 'student_system'");

        if (dbCheck.recordset.length === 0) {
            console.log("   Creating database 'student_system'...");
            await masterPool.request().query("CREATE DATABASE student_system");
            console.log("   ✅ Database created successfully\n");
        } else {
            console.log("   ✅ Database already exists\n");
        }

        await masterPool.close();

        // Step 3: Connect to student_system database
        console.log("🔌 Step 3: Connecting to 'student_system' database...\n");

        const dbConfig = {
            server: workingServer,
            database: "student_system",
            options: {
                encrypt: false,
                trustServerCertificate: true,
                trustedConnection: true,
                enableArithAbort: true
            }
        };

        const dbPool = await sql.connect(dbConfig);
        console.log("   ✅ Connected to student_system\n");

        // Step 4: Create tables
        console.log("📋 Step 4: Creating tables...\n");

        // Create Users table
        await dbPool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
            BEGIN
                CREATE TABLE users (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL,
                    username NVARCHAR(255) NOT NULL UNIQUE,
                    password NVARCHAR(255) NOT NULL,
                    role NVARCHAR(50) NOT NULL CHECK (role IN ('admin', 'student'))
                );
            END
        `);
        console.log("   ✅ Users table ready");

        // Create Payments table
        await dbPool.request().query(`
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
            END
        `);
        console.log("   ✅ Payments table ready");

        // Create Messages table
        await dbPool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'messages')
            BEGIN
                CREATE TABLE messages (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    student_id INT NOT NULL,
                    message NVARCHAR(MAX) NOT NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (student_id) REFERENCES users(id)
                );
            END
        `);
        console.log("   ✅ Messages table ready\n");

        await dbPool.close();

        // Step 5: Update db.js with working config
        console.log("💾 Step 5: Updating db.js configuration...\n");

        const fs = require('fs');
        const dbJsContent = `const sql = require("mssql");

// SQL Server configuration - Auto-configured
const config = {
    server: "${workingServer}",
    database: "student_system",
    options: {
        encrypt: false,
        trustServerCertificate: true,
        trustedConnection: true,
        enableArithAbort: true
    },
    connectionTimeout: 30000,
    requestTimeout: 30000
};

// Create connection pool
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("SQL Server Connected ✅");
        return pool;
    })
    .catch(err => {
        console.log("DB Error:", err.message);
        process.exit(1);
    });

module.exports = {
    sql,
    poolPromise
};
`;

        fs.writeFileSync('./db.js', dbJsContent);
        console.log("   ✅ db.js updated with working configuration\n");

        // Success!
        console.log("=".repeat(60));
        console.log("✅ DATABASE SETUP COMPLETE!");
        console.log("=".repeat(60));
        console.log(`\nServer: ${workingServer}`);
        console.log("Database: student_system");
        console.log("\nNext steps:");
        console.log("1. Run: npm start");
        console.log("2. Visit: http://localhost:5000/create-admin");
        console.log("3. Your backend is ready! 🚀");
        console.log("=".repeat(60));

    } catch (err) {
        console.log("\n❌ ERROR:", err.message);
        console.log("\nFull error:", err);
        process.exit(1);
    }
}

setupDatabase();
