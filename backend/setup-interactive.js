const mysql = require("mysql2/promise");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function testConnection() {
    console.log("=".repeat(60));
    console.log("MySQL Connection Tester");
    console.log("=".repeat(60));

    console.log("\nLet's test your MySQL connection...\n");

    const password = await question("Enter your MySQL root password (press Enter if no password): ");

    try {
        console.log("\nTesting connection...");

        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: password,
            database: "student_system"
        });

        console.log("✅ Connection successful!\n");

        // Check tables
        const [tables] = await connection.query("SHOW TABLES");
        console.log("Tables in student_system database:");
        if (tables.length === 0) {
            console.log("  (No tables found - need to create them)\n");
        } else {
            tables.forEach(table => {
                console.log("  ✓", Object.values(table)[0]);
            });
            console.log();
        }

        // Update db.js with the correct password
        const fs = require('fs');
        const dbJsContent = `const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "${password}",
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
        console.log("✅ db.js has been updated with your password\n");

        // Create tables if they don't exist
        if (tables.length < 3) {
            console.log("Creating missing tables...\n");

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
        }

        await connection.end();

        console.log("=".repeat(60));
        console.log("✅ SETUP COMPLETE!");
        console.log("=".repeat(60));
        console.log("\nNext steps:");
        console.log("1. Run: npm start");
        console.log("2. Visit: http://localhost:5000/create-admin");
        console.log("3. Start using your backend! 🚀");
        console.log("=".repeat(60));

    } catch (err) {
        console.log("\n❌ Connection failed!");
        console.log("Error:", err.message);
        console.log("\nPlease check:");
        console.log("1. MySQL is running");
        console.log("2. The password is correct");
        console.log("3. The database 'student_system' exists");
    } finally {
        rl.close();
    }
}

testConnection();
