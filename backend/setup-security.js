const { sql, poolPromise } = require("./db");
const fs = require("fs");
const path = require("path");

async function setupSecurityTable() {
    try {
        console.log("🔐 Setting up security monitoring table...");
        
        const pool = await poolPromise;
        const sqlScript = fs.readFileSync(path.join(__dirname, "setup_security_table.sql"), "utf8");
        
        await pool.request().query(sqlScript);
        
        console.log("✅ Security table setup completed!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error setting up security table:", err);
        process.exit(1);
    }
}

setupSecurityTable();
