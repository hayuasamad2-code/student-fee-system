const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("./db");
const multer = require("multer");
const fs = require("fs");

const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "supersecretkey";

// AUTH middleware (MOVED TO TOP)
function auth(req, res, next) {
    console.log(`🔐 [AUTH] Checking token for: ${req.method} ${req.url}`);
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        console.log("❌ [AUTH] No token provided");
        return res.status(401).send("No token");
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        console.log(`✅ [AUTH] Token verified. Role: ${decoded.role}, ID: ${decoded.id}`);
        next();
    } catch (err) {
        console.log(`❌ [AUTH] Token invalid: ${err.message}`);
        return res.status(401).send("Invalid token");
    }
}

// --- MASSIVE LOGGING ---
app.use((req, res, next) => {
    console.log(`📡 [LOG] ${req.method} ${req.url}`);
    next();
});

app.get("/api/ping", (req, res) => {
    console.log("🎯 PING ROUTE HIT!");
    res.json({ status: "WORKS", version: 14, port: 5008 });
});

// PAYMENT DELETION ROUTES
app.post("/delete-payment/:id", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        console.log(`🚨 [POST-DELETE-PAYMENT] Deleting ID: ${req.params.id}`);
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query("DELETE FROM payments WHERE id = @id");
        res.json({ message: "Payment deleted successfully" });
    } catch (err) {
        console.error("❌ Post-Delete payment error:", err);
        res.status(500).json({ message: err.message });
    }
});

app.delete("/delete-payment/:id", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        console.log(`🚨 [DELETE-PAYMENT] Deleting ID: ${req.params.id}`);
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query("DELETE FROM payments WHERE id = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.json({ message: "Payment deleted successfully" });
    } catch (err) {
        console.error("❌ Delete payment error:", err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/delete-message/:id", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        console.log(`🚨 [DELETE-API] Deleting message ID: ${req.params.id}`);
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query("DELETE FROM messages WHERE id = @id");
        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        console.error("❌ Delete error:", err);
        res.status(500).json({ message: err.message });
    }
});


app.post("/update-student/:id", auth, async (req, res) => {
    const studentId = req.params.id;
    console.log(`🚀 [MATCH] POST /update-student/${req.params.id}`);
    console.log(`👤 User Role: ${req.user.role}, User ID: ${req.user.id}`);

    try {
        const id = parseInt(studentId);
        if (isNaN(id)) {
            console.log("❌ Invalid ID:", studentId);
            return res.status(400).json({ message: "Invalid Student ID" });
        }

        const { name, username, password } = req.body;
        console.log(`📝 Payload for ID ${id}:`, req.body);

        // Security check
        if (req.user.role !== "admin" && req.user.id != id) {
            return res.status(403).json({ message: "Forbidden: Not authorized" });
        }

        const pool = await poolPromise;
        let query = "UPDATE users SET name = @name, username = @username";
        const request = pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('username', sql.NVarChar, username);

        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            query += ", password = @password";
            request.input('password', sql.NVarChar, hashed);
        }

        query += " WHERE id = @id";
        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Student record not found" });
        }

        console.log(`✅ [API] Student ${id} updated successfully!`);
        res.json({ message: "Updated successfully" });
    } catch (err) {
        console.log("❌ [API] Update error:", err);
        res.status(500).json({ message: "Server error: " + err.message });
    }
});


// Serving static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../frontend")));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.get("/", (req, res) => res.send("Server is alive 🚀"));
app.get("/login", (req, res) => res.redirect("/login/index.html"));

// Create Admin (run once)
app.get("/create-admin", async (req, res) => {
    try {
        const hashed = await bcrypt.hash("admin123", 10);
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, "Main Admin")
            .input('username', sql.NVarChar, "admin")
            .input('password', sql.NVarChar, hashed)
            .input('role', sql.NVarChar, "admin")
            .query("INSERT INTO users (name, username, password, role) VALUES (@name, @username, @password, @role)");
        res.send("Admin Created ✅");
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    const ipAddress = req.ip || req.connection.remoteAddress;
    try {
        const { username, password } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query("SELECT * FROM users WHERE username = @username");

        if (result.recordset.length === 0) {
            // Log failed login attempt
            await pool.request()
                .input('username', sql.NVarChar, username)
                .input('ip_address', sql.NVarChar, ipAddress)
                .input('reason', sql.NVarChar, 'User not found')
                .query("INSERT INTO failed_logins (username, ip_address, reason, attempt_time) VALUES (@username, @ip_address, @reason, GETDATE())");
            return res.status(401).json({ message: "User not found" });
        }

        const user = result.recordset[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            // Log failed login attempt
            await pool.request()
                .input('username', sql.NVarChar, username)
                .input('ip_address', sql.NVarChar, ipAddress)
                .input('reason', sql.NVarChar, 'Wrong password')
                .query("INSERT INTO failed_logins (username, ip_address, reason, attempt_time) VALUES (@username, @ip_address, @reason, GETDATE())");
            return res.status(401).json({ message: "Wrong password" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1d" });
        res.send({ token, role: user.role });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// Get logged in user
app.get("/auth/me", auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.user.id)
            .query("SELECT id, name, username, role FROM users WHERE id = @id");
        res.send(result.recordset[0]);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

// Admin creates student
app.post("/create-student", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).send("Forbidden");
    try {
        const { name, username, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashed)
            .input('role', sql.NVarChar, "student")
            .query("INSERT INTO users (name, username, password, role) VALUES (@name, @username, @password, @role)");
        res.json({ message: "Saved successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// Payments
app.get("/payments", auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT p.*, u.name as studentName 
                FROM payments p
                JOIN users u ON p.student_id = u.id
            `);
        res.send(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/payments", auth, upload.single("proof"), async (req, res) => {
    try {
        const { amount, month } = req.body;
        const student_id = req.user.role === 'admin' ? req.body.student_id : req.user.id;
        const status = req.user.role === 'admin' ? (req.body.status || 'paid') : 'paid';
        const proof_url = req.file ? `/uploads/${req.file.filename}` : null;

        const pool = await poolPromise;

        // Check for duplicate
        const check = await pool.request()
            .input('sid', sql.Int, student_id)
            .input('m', sql.NVarChar, month)
            .query("SELECT * FROM payments WHERE student_id = @sid AND month = @m");

        if (check.recordset.length > 0) {
            return res.status(400).json({ message: "You already paid for this month!" });
        }

        await pool.request()
            .input('student_id', sql.Int, student_id)
            .input('amount', sql.Decimal(10, 2), amount)
            .input('month', sql.NVarChar, month)
            .input('status', sql.NVarChar, status)
            .input('proof_url', sql.NVarChar, proof_url)
            .query("INSERT INTO payments (student_id, amount, month, status, proof_url) VALUES (@student_id, @amount, @month, @status, @proof_url)");

        res.json({ message: "Saved successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// Discussion messages
app.get("/messages", auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT m.*, u.name as name 
                FROM messages m
                JOIN users u ON m.student_id = u.id
                ORDER BY m.created_at ASC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// GET ALL STUDENTS (Admin only)
app.get("/students", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query("SELECT id, name, username, role FROM users WHERE role = 'student'");
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// GET FAILED LOGIN ATTEMPTS (Admin only)
app.get("/security/failed-logins", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT 
                    id,
                    username,
                    ip_address,
                    reason,
                    attempt_time,
                    (SELECT COUNT(*) FROM failed_logins f2 
                     WHERE f2.ip_address = failed_logins.ip_address 
                     AND f2.attempt_time >= DATEADD(hour, -1, GETDATE())) as recent_attempts
                FROM failed_logins
                ORDER BY attempt_time DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// GET SECURITY ALERTS (Admin only) - IPs with multiple failed attempts
app.get("/security/alerts", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT 
                    ip_address,
                    COUNT(*) as attempt_count,
                    MAX(attempt_time) as last_attempt,
                    STRING_AGG(username, ', ') as usernames_tried
                FROM failed_logins
                WHERE attempt_time >= DATEADD(hour, -24, GETDATE())
                GROUP BY ip_address
                HAVING COUNT(*) >= 3
                ORDER BY attempt_count DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// CLEAR SECURITY LOGS (Admin only)
app.post("/security/clear-logs", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        const pool = await poolPromise;
        await pool.request()
            .query("DELETE FROM failed_logins WHERE attempt_time < DATEADD(day, -7, GETDATE())");
        res.json({ message: "Old logs cleared successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/messages", auth, async (req, res) => {
    try {
        const { message } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('student_id', sql.Int, req.user.id)
            .input('message', sql.NVarChar, message)
            .query("INSERT INTO messages (student_id, message) VALUES (@student_id, @message)");
        res.json({ message: "Saved successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.listen(5008, () => console.log(`🚀 [CLEAN] Server active on port 5008 - Started at: ${new Date().toLocaleTimeString()}`));
