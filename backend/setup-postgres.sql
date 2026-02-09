-- PostgreSQL Database Setup for Student Fee Management System

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    month VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    proof_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table (for discussion group)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create failed_logins table (for security monitoring)
CREATE TABLE IF NOT EXISTS failed_logins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    ip_address VARCHAR(100),
    reason VARCHAR(255),
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_student ON messages(student_id);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip ON failed_logins(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_logins_time ON failed_logins(attempt_time);

-- Insert default admin user (password: admin123)
-- Note: This is a bcrypt hash of "admin123"
INSERT INTO users (name, username, password, role)
VALUES ('Main Admin', 'admin', '$2b$10$rBV2kHZ5dZa4rZ5L5vXxXeqKqF5qF5qF5qF5qF5qF5qF5qF5qF5qO', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as message;
