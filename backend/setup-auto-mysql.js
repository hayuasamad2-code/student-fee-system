const mysql = require("mysql2/promise");

async function autoSetup() {
    console.log("=".repeat(60));
    console.log("MySQL Auto-Setup for student_system");
    console.log("=".repeat(60));

    // Common MySQL default passwords to try
    const passwordsToTry = ["", "root", "password", "admin", "1234", "mysql"];

    let workingPassword = null;
    let connection = null;

    console.log("\n🔍 Testing MySQL connections...\n");

    for (const pwd of passwordsToTry) {
        try {
            const displayPwd = pwd === "" ? "(no password)" : pwd;
            process.stdout.write(`   Trying password: ${displayPwd}... `);

            connection = await mysql.createConnection({
                host: "localhost",
                user: "root",
                password: pwd,
                database: "student_system",
                connectTimeout: 3000
            });

            workingPassword = pwd;
            console.log("✅ SUCCESS!\n");
            break;
        } catch (err) {
            console.log("❌");
        }
    }

    if (!connection) {
        console.log("\n" + "=".repeat(60));
        console.log("❌ Could not connect with common passwords");
        console.log("=".repeat(60));
        console.log("\nPlease run: node setup-interactive.js");
        console.log("And enter your MySQL password manually.");
        process.exit(1);
    }

    try {
        // Check existing tables
        console.log("📋 Checking existing tables...\n");
        const [tables] = await connection.query("SHOW TABLES");

        console.log("Current tables:");
        if (tables.length === 0) {
            console.log("  (none - will create all tables)\n");
        } else {
            tables.forEach(table => {
                console.log("  ✓", Object.values(table)[0]);
            });
            console.log();
        }

        // Create tables
        console.log("🔧 Creating/updating tables...\n");

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'student') NOT NULL
            )
        `);
        console.log("  ✅ Users table ready");

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
        console.log("  ✅ Payments table ready");

        await connection.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id)
            )
        `);
        console.log("  ✅ Messages table ready\n");

        // Update db.js
        console.log("💾 Updating db.js configuration...\n");

        const fs = require('fs');
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
        console.log("  ✅ db.js updated with correct password\n");

        await connection.end();

        console.log("=".repeat(60));
        console.log("✅ SETUP COMPLETE!");
        console.log("=".repeat(60));
        console.log("\n📊 Database: student_system");
        console.log("📋 Tables: users, payments, messages");
        const displayPwd = workingPassword === "" ? "(no password)" : "***";
        console.log("🔑 Password:", displayPwd);
        console.log("\n🚀 Next steps:");
        console.log("   1. Run: npm start");
        console.log("   2. Visit: http://localhost:5000/create-admin");
        console.log("   3. Your backend is ready!");
        console.log("=".repeat(60));

    } catch (err) {
        console.log("\n❌ ERROR:", err.message);
        console.log("\nFull error:", err);
        process.exit(1);
    }
}

autoSetup();
