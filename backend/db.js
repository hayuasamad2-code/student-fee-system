const sql = require("mssql/msnodesqlv8");

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=student_system;Trusted_Connection=yes;'
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("SQL Server (LocalDB) Connected via ODBC ✅");
        return pool;
    })
    .catch(err => {
        console.log("Database connection failed: ", err);
    });

module.exports = {
    sql,
    poolPromise
};
