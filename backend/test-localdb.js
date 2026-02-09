const sql = require("mssql/msnodesqlv8");

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=student_system;Trusted_Connection=yes;'
};

async function test() {
    console.log("Testing connection to (localdb)\\MSSQLLocalDB...");
    try {
        const pool = await sql.connect(config);
        console.log("✅ Success! Connected to student_system database.");

        console.log("Checking tables...");
        const result = await pool.request().query("SELECT name FROM sys.tables");
        console.log("Tables found:");
        result.recordset.forEach(row => console.log(" - " + row.name));

        await pool.close();
    } catch (err) {
        console.error("❌ Failed to connect:");
        console.error(err);
    }
}

test();
