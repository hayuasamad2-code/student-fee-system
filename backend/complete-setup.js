const mysql = require("mysql2/promise");
const fs = require('fs');

async function completeSetup() {
    console.log("=".repeat(70));
    console.log("  COMPLETE MYSQL SETUP - Finding your configuration automatically");
    console.log("=".repeat(70));

    const passwordsToTry = [
        { pwd: "", display: "no password" },
        { pwd: "root", display: "root" },
        { pwd: "password", display: "password" },
        { pwd: "admin", display: "admin" },
        { pwd: "mysql", display: "mysql" },
        { pwd: "1234", display: "1234" },
        { pwd: "12345678", display: "12345678" }
    ];

    let workingPassword = null;
    let connection = null;

    console.log("\n🔍 Step 1: Finding your MySQL credentials...\n");

    // Try without database first to create it if needed
    for (const { pwd, display } of passwordsToTry) {
        try {
            process.stdout.write(`   Testing: ${display.padEnd(15)}... `);

            const testConn = await mysql.createConnection({
                host: "localhost",
                user: "root",
                password: pwd,
                connectTimeout: 3000
            });

            workingPassword = pwd;
            console.log("✅");

            // Create database if not exists
            await testConn.query("CREATE DATABASE IF NOT EXISTS student_system");
            await testConn.end();

            // Now connect to the database
            connection = await mysql.createConnection({
                host: "localhost",
                user: "root",
                password: pwd,
                database: "student_system"
            });

            console.log(`\n   ✅ Connected successfully with password: "${display}"\n`);
            break;
        } catch (err) {
            console.log("❌");
        }
    }

    if (!connection) {
        console.log("\n" + "=".repeat(70));
        console.log("❌ Could not connect with common passwords");
        console.log("=".repeat(70));
        console.log("\nPlease find your MySQL password and update db.js manually:");
        console.log("  password: \"YOUR_PASSWORD_HERE\"");
        process.exit(1);
    }

    try {
        console.log("📊 Step 2: Creating database tables...\n");

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
        console.log("   ✅ users");

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
        console.log("   ✅ payments");

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
        console.log("   ✅ messages\n");

        await connection.end();

        console.log("💾 Step 3: Updating db.js configuration...\n");

        const dbJsContent = `const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "${workingPassword}",
    database: "student_system"
});

db.connect(err => {
    if(err) {
        console.log("DB Error ❌:", err.message);
    } else {
        console.log("MySQL Connected ✅");
    }
});

module.exports = db;
`;

        fs.writeFileSync('./db.js', dbJsContent);
        console.log("   ✅ db.js updated\n");

        console.log("=".repeat(70));
        console.log("  ✅ SETUP COMPLETE - EVERYTHING IS READY!");
        console.log("=".repeat(70));
        console.log("\n📊 Database System: MySQL");
        console.log("📦 Database Name: student_system");
        console.log("📋 Tables Created: users, payments, messages");
        console.log("\n🚀 NEXT STEPS:");
        console.log("  1. Run: npm start");
        console.log("  2. Open browser: http://localhost:5000/create-admin");
        console.log("  3. You'll see: 'Admin Created ✅'");
        console.log("  4. Your backend is now fully connected and running!");
        console.log("=".repeat(70));
        console.log("\n💡 Login credentials will be:");
        console.log("   Username: admin");
        console.log("   Password: admin123");
        console.log("=".repeat(70) + "\n");

    } catch (err) {
        console.log("\n❌ ERROR during setup:", err.message);
        console.log("\nDetails:", err);
        process.exit(1);
    }
}

completeSetup();
