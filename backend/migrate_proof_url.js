const { sql, poolPromise } = require("./db");

async function migrate() {
    try {
        const pool = await poolPromise;
        console.log("Connected to database. Checking for proof_url column...");

        const checkColumn = await pool.request()
            .query(`
                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[dbo].[payments]') 
                    AND name = 'proof_url'
                )
                BEGIN
                    ALTER TABLE payments ADD proof_url NVARCHAR(MAX);
                    PRINT 'Column proof_url added successfully';
                END
                ELSE
                BEGIN
                    PRINT 'Column proof_url already exists';
                END
            `);

        console.log("Migration finished.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
