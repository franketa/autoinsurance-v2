-- Clean Database Schema for ExchangeFlo Ping/Post Logging
-- This script creates simplified, focused tables for logging API requests

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS smartautoinsider_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE smartautoinsider_db;

-- Drop existing tables to start fresh (be careful in production!)
-- DROP TABLE IF EXISTS exchangeflo_ping_requests;
-- DROP TABLE IF EXISTS exchangeflo_post_requests;
-- DROP VIEW IF EXISTS exchangeflo_analytics;

-- Simple, focused ping requests table
CREATE TABLE IF NOT EXISTS ping_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    submission_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'unknown',
    ping_count INT DEFAULT 0,
    total_value DECIMAL(10,2) DEFAULT 0.00,
    request_data JSON,
    response_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_timestamp (timestamp),
    INDEX idx_submission_id (submission_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Simple, focused post requests table
CREATE TABLE IF NOT EXISTS post_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    submission_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'unknown',
    total_value DECIMAL(10,2) DEFAULT 0.00,
    ping_count INT DEFAULT 0,
    successful_posts INT DEFAULT 0,
    request_data JSON,
    response_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_timestamp (timestamp),
    INDEX idx_submission_id (submission_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Simple view for analytics
CREATE OR REPLACE VIEW request_analytics AS
SELECT 
    'ping' as request_type,
    id,
    timestamp,
    submission_id,
    status,
    total_value,
    ping_count,
    0 as successful_posts,
    created_at
FROM ping_requests
UNION ALL
SELECT 
    'post' as request_type,
    id,
    timestamp,
    submission_id,
    status,
    total_value,
    ping_count,
    successful_posts,
    created_at
FROM post_requests
ORDER BY created_at DESC;

-- Show table structures
DESCRIBE ping_requests;
DESCRIBE post_requests;

-- Test database connection
SELECT 'Database setup completed successfully' as status, NOW() as timestamp; 