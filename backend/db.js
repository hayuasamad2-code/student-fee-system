require('dotenv').config();
const sql = require("mssql");
const sqlLocal = require("mssql/msnodesqlv8");

// Check if we're in production (Azure SQL) or local (LocalDB)
const isProduction = process.env.DB_SERVER && process.env.DB_SERVER.trim() !== '';

let config;
let poolPromise;

if (isProduction) {
    // Azure SQL Database configuration
    config = {
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        options: {
            encrypt: true,
            trustServerCertificate: false,
            enableArithAbort: true
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    };
    console.log("🌐 Using Azure SQL Database");
    
    poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log("✅ Database Connected Successfully");
            return pool;
        })
        .catch(err => {
            console.error("❌ Database connection failed:", err.message);
            throw err;
        });
} else {
    // Local development with LocalDB
    config = {
        connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=student_system;Trusted_Connection=yes;'
    };
    console.log("💻 Using LocalDB for development");
    
    poolPromise = new sqlLocal.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log("✅ Database Connected Successfully");
            return pool;
        })
        .catch(err => {
            console.error("❌ Database connection failed:", err.message);
            throw err;
        });
}

module.exports = {
    sql: isProduction ? sql : sqlLocal,
    poolPromise
};
