const sql = require("mssql");

// Test different SQL Server configurations
const configurations = [
    {
        name: "SQLEXPRESS with Windows Auth",
        config: {
            server: "localhost\\SQLEXPRESS",
            database: "student_system",
            options: {
                encrypt: false,
                trustServerCertificate: true,
                trustedConnection: true,
                enableArithAbort: true
            }
        }
    },
    {
        name: "Default instance with Windows Auth",
        config: {
            server: "localhost",
            database: "student_system",
            options: {
                encrypt: false,
                trustServerCertificate: true,
                trustedConnection: true,
                enableArithAbort: true
            }
        }
    },
    {
        name: "(local)\\SQLEXPRESS with Windows Auth",
        config: {
            server: "(local)\\SQLEXPRESS",
            database: "student_system",
            options: {
                encrypt: false,
                trustServerCertificate: true,
                trustedConnection: true,
                enableArithAbort: true
            }
        }
    },
    {
        name: "127.0.0.1 with Windows Auth",
        config: {
            server: "127.0.0.1",
            database: "student_system",
            options: {
                encrypt: false,
                trustServerCertificate: true,
                trustedConnection: true,
                enableArithAbort: true
            }
        }
    }
];

async function testConnections() {
    console.log("Testing SQL Server connections...\n");

    for (const { name, config } of configurations) {
        try {
            console.log(`Testing: ${name}...`);
            const pool = await sql.connect(config);
            console.log(`✅ SUCCESS: Connected with "${name}"`);
            console.log(`   Server: ${config.server}`);
            console.log(`   Database: ${config.database}\n`);
            await pool.close();

            // If successful, save this config
            console.log("=".repeat(50));
            console.log("WORKING CONFIGURATION FOUND!");
            console.log("=".repeat(50));
            console.log(`Use this in db.js:\nserver: "${config.server}"`);
            process.exit(0);
        } catch (err) {
            console.log(`❌ FAILED: ${err.message}\n`);
        }
    }

    console.log("=".repeat(50));
    console.log("No working configuration found.");
    console.log("Please check:");
    console.log("1. SQL Server is installed and running");
    console.log("2. The database 'student_system' exists");
    console.log("3. Windows Authentication is enabled");
    console.log("4. TCP/IP protocol is enabled in SQL Server Configuration Manager");
    console.log("=".repeat(50));
}

testConnections();
