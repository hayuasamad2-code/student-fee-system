require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Pool } = require('pg');

const app = express();

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? {
        rejectUnauthorized: false
    } : false
});

pool.on('connect', () => {
    console.log('✅ PostgreSQL Connected Successfully');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL error:', err);
});

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5500', 'http://localhost:5008']
    : ['http://localhost:3000', 'http://localhost:5500', 'http://localhost:5008'];

console.log('🌐 CORS Allowed Origins:', allowedOrigins);

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "supersecretkey";
const PORT = process.env.PORT || 5008;

// Cloudinary configuration
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log("☁️ Cloudinary configured");
}

// AUTH middleware
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

// Logging middleware
app.use((req, res, next) => {
    console.log(`📡 [LOG] ${req.method} ${req.url}`);
    next();
});

// Serving static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../frontend")));

// Multer configuration
let upload;

if (process.env.CLOUDINARY_CLOUD_NAME) {
    const cloudinaryStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'student-payments',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
        }
    });
    upload = multer({ storage: cloudinaryStorage });
    console.log("📤 Using Cloudinary for file uploads");
} else {
    const localStorage = multer.diskStorage({
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
    upload = multer({ storage: localStorage });
    console.log("💾 Using local storage for file uploads");
}

// Routes
app.get("/", (req, res) => res.send("Server is alive 🚀"));
app.get("/login", (req, res) => res.redirect("/login/index.html"));

app.get("/api/ping", (req, res) => {
    console.log("🎯 PING ROUTE HIT!");
    res.json({ status: "WORKS", version: 15, port: PORT, database: "PostgreSQL" });
});

// Setup database (run once)
app.get("/setup-database", async (req, res) => {
    try {
        // Create tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'student',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                amount DECIMAL(10, 2) NOT NULL,
                month VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                proof_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS failed_logins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255),
                ip_address VARCHAR(100),
                reason VARCHAR(255),
                attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Create admin user
        const hashed = await bcrypt.hash("admin123", 10);
        await pool.query(
            'INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING',
            ["Main Admin", "admin", hashed, "admin"]
        );
        
        res.send("✅ Database setup complete! Tables created and admin user added. You can now login with username: admin, password: admin123");
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message, error: err.toString() });
    }
});

// Create Admin
app.get("/create-admin", async (req, res) => {
    try {
        const hashed = await bcrypt.hash("admin123", 10);
        await pool.query(
            'INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4)',
            ["Main Admin", "admin", hashed, "admin"]
        );
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
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            await pool.query(
                'INSERT INTO failed_logins (username, ip_address, reason) VALUES ($1, $2, $3)',
                [username, ipAddress, 'User not found']
            );
            return res.status(401).json({ message: "User not found" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            await pool.query(
                'INSERT INTO failed_logins (username, ip_address, reason) VALUES ($1, $2, $3)',
                [username, ipAddress, 'Wrong password']
            );
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
        const result = await pool.query(
            'SELECT id, name, username, role FROM users WHERE id = $1',
            [req.user.id]
        );
        res.send(result.rows[0]);
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
        await pool.query(
            'INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4)',
            [name, username, hashed, "student"]
        );
        res.json({ message: "Saved successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// Get all students
app.get("/students", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        const result = await pool.query(
            "SELECT id, name, username, role FROM users WHERE role = 'student'"
        );
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// Update student
app.post("/update-student/:id", auth, async (req, res) => {
    const studentId = parseInt(req.params.id);
    console.log(`🚀 [MATCH] POST /update-student/${req.params.id}`);

    try {
        const { name, username, password } = req.body;

        if (req.user.role !== "admin" && req.user.id != studentId) {
            return res.status(403).json({ message: "Forbidden: Not authorized" });
        }

        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE users SET name = $1, username = $2, password = $3 WHERE id = $4',
                [name, username, hashed, studentId]
            );
        } else {
            await pool.query(
                'UPDATE users SET name = $1, username = $2 WHERE id = $3',
                [name, username, studentId]
            );
        }

        console.log(`✅ [API] Student ${studentId} updated successfully!`);
        res.json({ message: "Updated successfully" });
    } catch (err) {
        console.log("❌ [API] Update error:", err);
        res.status(500).json({ message: "Server error: " + err.message });
    }
});

// Payments
app.get("/payments", auth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, u.name as studentname 
            FROM payments p
            JOIN users u ON p.student_id = u.id
            ORDER BY p.created_at DESC
        `);
        res.send(result.rows);
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
        
        let proof_url = null;
        if (req.file) {
            proof_url = req.file.path || `/uploads/${req.file.filename}`;
        }

        // Check for duplicate
        const check = await pool.query(
            'SELECT * FROM payments WHERE student_id = $1 AND month = $2',
            [student_id, month]
        );

        if (check.rows.length > 0) {
            return res.status(400).json({ message: "You already paid for this month!" });
        }

        await pool.query(
            'INSERT INTO payments (student_id, amount, month, status, proof_url) VALUES ($1, $2, $3, $4, $5)',
            [student_id, amount, month, status, proof_url]
        );

        res.json({ message: "Saved successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// Delete payment
app.delete("/delete-payment/:id", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        console.log(`🚨 [DELETE-PAYMENT] Deleting ID: ${req.params.id}`);
        const result = await pool.query('DELETE FROM payments WHERE id = $1', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.json({ message: "Payment deleted successfully" });
    } catch (err) {
        console.error("❌ Delete payment error:", err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/delete-payment/:id", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        console.log(`🚨 [POST-DELETE-PAYMENT] Deleting ID: ${req.params.id}`);
        await pool.query('DELETE FROM payments WHERE id = $1', [req.params.id]);
        res.json({ message: "Payment deleted successfully" });
    } catch (err) {
        console.error("❌ Post-Delete payment error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Messages
app.get("/messages", auth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.*, u.name as name 
            FROM messages m
            JOIN users u ON m.student_id = u.id
            ORDER BY m.created_at ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/messages", auth, async (req, res) => {
    try {
        const { message } = req.body;
        await pool.query(
            'INSERT INTO messages (student_id, message) VALUES ($1, $2)',
            [req.user.id, message]
        );
        res.json({ message: "Saved successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/delete-message/:id", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        console.log(`🚨 [DELETE-API] Deleting message ID: ${req.params.id}`);
        await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        console.error("❌ Delete error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Security endpoints
app.get("/security/failed-logins", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        const result = await pool.query(`
            SELECT 
                id,
                username,
                ip_address,
                reason,
                attempt_time,
                (SELECT COUNT(*) FROM failed_logins f2 
                 WHERE f2.ip_address = failed_logins.ip_address 
                 AND f2.attempt_time >= NOW() - INTERVAL '1 hour') as recent_attempts
            FROM failed_logins
            ORDER BY attempt_time DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.get("/security/alerts", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        const result = await pool.query(`
            SELECT 
                ip_address,
                COUNT(*) as attempt_count,
                MAX(attempt_time) as last_attempt,
                STRING_AGG(username, ', ') as usernames_tried
            FROM failed_logins
            WHERE attempt_time >= NOW() - INTERVAL '24 hours'
            GROUP BY ip_address
            HAVING COUNT(*) >= 3
            ORDER BY attempt_count DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/security/clear-logs", auth, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
        await pool.query("DELETE FROM failed_logins WHERE attempt_time < NOW() - INTERVAL '7 days'");
        res.json({ message: "Old logs cleared successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📅 Started at: ${new Date().toLocaleTimeString()}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🐘 Database: PostgreSQL`);
});
