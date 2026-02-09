require('dotenv').config();
const { Pool } = require('pg');

// Check if we're using PostgreSQL (production) or SQL Server LocalDB (development)
const usePostgres = process.env.DATABASE_URL || process.env.USE_POSTGRES === 'true';

let pool;

if (usePostgres) {
    // PostgreSQL (Heroku or other cloud)
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL ? {
            rejectUnauthorized: false
        } : false
    });
    
    console.log("🐘 Using PostgreSQL Database");
    
    // Test connection
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error("❌ PostgreSQL connection failed:", err.message);
        } else {
            console.log("✅ PostgreSQL Connected Successfully");
        }
    });
} else {
    // Fallback to SQL Server LocalDB for local development
    const sql = require("mssql/msnodesqlv8");
    const config = {
        connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=student_system;Trusted_Connection=yes;'
    };
    
    console.log("💻 Using SQL Server LocalDB for development");
    
    const poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(p => {
            console.log("✅ LocalDB Connected Successfully");
            return p;
        })
        .catch(err => {
            console.error("❌ LocalDB connection failed:", err.message);
        });
    
    module.exports = {
        sql,
        poolPromise,
        isPostgres: false
    };
    return;
}

// PostgreSQL query helper functions
const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

module.exports = {
    query,
    pool,
    getClient,
    isPostgres: true
};
