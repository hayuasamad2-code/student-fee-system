const mysql = require("mysql2/promise");

async function setupMySQL() {
    console.log("=".repeat(60));
    console.log("MySQL Database Setup for student_system");
    console.log("=".repeat(60));

    try {
        // Step 1: Connect to MySQL server
        console.log("\n📡 Step 1: Connecting to MySQL...\n");

        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: ""  // Change this if your MySQL has a password
        });

        console.log("   ✅ Connected to MySQL Server\n");

        // Step 2: Create database if it doesn't exist
        console.log("📊 Step 2: Creating database 'student_system'...\n");

        await connection.query("CREATE DATABASE IF NOT EXISTS student_system");
        console.log("   ✅ Database ready\n");

        await connection.query("USE student_system");

        // Step 3: Create tables
        console.log("📋 Step 3: Creating tables...\n");

        // Create Users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'student') NOT NULL
            )
        `);
        console.log("   ✅ Users table ready");

        // Create Payments table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                month VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL,
                FOREIGN KEY (student_id) REFERENCES users(id)
            )
        `);
        console.log("   ✅ Payments table ready");

        // Create Messages table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id)
            )
        `);
        console.log("   ✅ Messages table ready\n");

        await connection.end();

        // Success!
        console.log("=".repeat(60));
        console.log("✅ DATABASE SETUP COMPLETE!");
        console.log("=".repeat(60));
        console.log("\nDatabase: student_system");
        console.log("Tables: users, payments, messages");
        console.log("\nNext steps:");
        console.log("1. Run: npm start");
        console.log("2. Visit: http://localhost:5000/create-admin");
        console.log("3. Your backend is ready! 🚀");
        console.log("=".repeat(60));

    } catch (err) {
        console.log("\n❌ ERROR:", err.message);
        console.log("\nPossible solutions:");
        console.log("1. Make sure MySQL is running");backend
        console.log("2. Check your MySQL username and password in this script");
        console.log("3. Ensure you have permission to create databases");
        console.log("\nFull error:", err);
        process.exit(1);
    }
}

setupMySQL();
