-- Database initialization script for auto insurance quote application
-- This script creates the necessary table for logging API requests and responses

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS smartautoinsider_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE smartautoinsider_db;

-- Create the insurance_ping table for logging API requests and responses
CREATE TABLE IF NOT EXISTS insurance_ping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    data LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Create a user for the application (if not exists)
-- Note: Replace 'your_password' with a secure password
-- CREATE USER IF NOT EXISTS 'smartautoinsider_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON smartautoinsider_db.* TO 'smartautoinsider_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Show the created table structure
DESCRIBE insurance_ping;

-- Add ping request logging table
CREATE TABLE IF NOT EXISTS exchangeflo_ping_requests (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submission_id VARCHAR(255),
    status VARCHAR(50),
    ping_count INTEGER DEFAULT 0,
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add post request logging table
CREATE TABLE IF NOT EXISTS exchangeflo_post_requests (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submission_id VARCHAR(255),
    status VARCHAR(50),
    total_value DECIMAL(10,2) DEFAULT 0,
    ping_count INTEGER DEFAULT 0,
    successful_posts INTEGER DEFAULT 0,
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ping_submission_id ON exchangeflo_ping_requests(submission_id);
CREATE INDEX IF NOT EXISTS idx_ping_timestamp ON exchangeflo_ping_requests(timestamp);
CREATE INDEX IF NOT EXISTS idx_post_submission_id ON exchangeflo_post_requests(submission_id);
CREATE INDEX IF NOT EXISTS idx_post_timestamp ON exchangeflo_post_requests(timestamp);

-- Create a view for combined ping/post analysis
CREATE OR REPLACE VIEW exchangeflo_analytics AS
SELECT 
    pr.submission_id,
    pr.timestamp as ping_timestamp,
    pr.ping_count,
    pr.status as ping_status,
    por.timestamp as post_timestamp,
    por.status as post_status,
    por.total_value,
    por.successful_posts,
    CASE 
        WHEN por.submission_id IS NOT NULL THEN 'completed'
        WHEN pr.status = 'success' THEN 'ping_only'
        ELSE 'failed'
    END as flow_status
FROM exchangeflo_ping_requests pr
LEFT JOIN exchangeflo_post_requests por ON pr.submission_id = por.submission_id
ORDER BY pr.timestamp DESC; 