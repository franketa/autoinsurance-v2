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

-- Add ExchangeFlo ping request logging table (MySQL syntax)
CREATE TABLE IF NOT EXISTS exchangeflo_ping_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submission_id VARCHAR(255),
    status VARCHAR(50),
    ping_count INT DEFAULT 0,
    request_data JSON,
    response_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ping_submission_id (submission_id),
    INDEX idx_ping_timestamp (timestamp),
    INDEX idx_ping_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add ExchangeFlo post request logging table (MySQL syntax)
CREATE TABLE IF NOT EXISTS exchangeflo_post_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submission_id VARCHAR(255),
    status VARCHAR(50),
    total_value DECIMAL(10,2) DEFAULT 0,
    ping_count INT DEFAULT 0,
    successful_posts INT DEFAULT 0,
    request_data JSON,
    response_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_post_submission_id (submission_id),
    INDEX idx_post_timestamp (timestamp),
    INDEX idx_post_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add ping comparison table for tracking QuoteWizard vs ExchangeFlo results
CREATE TABLE IF NOT EXISTS ping_comparison (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quotewizard_success BOOLEAN DEFAULT FALSE,
    quotewizard_value DECIMAL(10,2) DEFAULT 0,
    quotewizard_error TEXT,
    exchangeflo_success BOOLEAN DEFAULT FALSE,
    exchangeflo_value DECIMAL(10,2) DEFAULT 0,
    exchangeflo_error TEXT,
    winner VARCHAR(50),
    total_comparison_value DECIMAL(10,2) GENERATED ALWAYS AS (quotewizard_value + exchangeflo_value) STORED,
    request_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_comparison_timestamp (timestamp),
    INDEX idx_comparison_winner (winner),
    INDEX idx_comparison_total_value (total_comparison_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a view for combined ping/post analysis
CREATE OR REPLACE VIEW exchangeflo_analytics AS
SELECT 
    pr.submission_id,
    pr.timestamp as ping_timestamp,
    pr.ping_count,
    pr.status as ping_status,
    pr.request_data,
    pr.response_data as ping_response_data,
    por.timestamp as post_timestamp,
    por.status as post_status,
    por.total_value,
    por.successful_posts,
    por.response_data as post_response_data,
    CASE 
        WHEN por.submission_id IS NOT NULL THEN 'completed'
        WHEN pr.status = 'success' THEN 'ping_only'
        ELSE 'failed'
    END as flow_status,
    -- Extract useful JSON fields for easier querying
    JSON_EXTRACT(pr.request_data, '$.profile.zip') as zip_code,
    JSON_EXTRACT(pr.request_data, '$.profile.auto_coverage_type') as coverage_type,
    JSON_EXTRACT(pr.request_data, '$.profile.vehicle_count') as vehicle_count,
    JSON_EXTRACT(pr.response_data, '$.pings') as pings_data
FROM exchangeflo_ping_requests pr
LEFT JOIN exchangeflo_post_requests por ON pr.submission_id = por.submission_id
ORDER BY pr.timestamp DESC; 