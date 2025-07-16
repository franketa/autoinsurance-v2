-- Consolidated Database Schema for Auto Insurance Quote Application
-- This script creates all necessary tables for our single-server architecture
-- Supports both QuoteWizard and ExchangeFlo dual ping system

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS smartautoinsider_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE smartautoinsider_db;

-- ============================================================================
-- CORE LOGGING TABLES
-- ============================================================================

-- General ping requests table (supports all providers)
CREATE TABLE IF NOT EXISTS ping_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    submission_id VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'unknown',
    status VARCHAR(50) DEFAULT 'unknown',
    ping_count INT DEFAULT 0,
    total_value DECIMAL(10,2) DEFAULT 0.00,
    request_data JSON,
    response_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_ping_timestamp (timestamp),
    INDEX idx_ping_submission_id (submission_id),
    INDEX idx_ping_provider (provider),
    INDEX idx_ping_status (status),
    INDEX idx_ping_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- General post requests table (supports all providers) 
CREATE TABLE IF NOT EXISTS post_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    submission_id VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'unknown',
    status VARCHAR(50) DEFAULT 'unknown',
    total_value DECIMAL(10,2) DEFAULT 0.00,
    ping_count INT DEFAULT 0,
    successful_posts INT DEFAULT 0,
    request_data JSON,
    response_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_post_timestamp (timestamp),
    INDEX idx_post_submission_id (submission_id),
    INDEX idx_post_provider (provider),
    INDEX idx_post_status (status),
    INDEX idx_post_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DUAL PING COMPARISON SYSTEM
-- ============================================================================

-- Ping comparison table for QuoteWizard vs ExchangeFlo head-to-head comparisons
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
    
    -- Indexes for performance and analytics
    INDEX idx_comparison_timestamp (timestamp),
    INDEX idx_comparison_winner (winner),
    INDEX idx_comparison_total_value (total_comparison_value),
    INDEX idx_comparison_qw_success (quotewizard_success),
    INDEX idx_comparison_ef_success (exchangeflo_success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- LEGACY COMPATIBILITY (for any existing code)
-- ============================================================================

-- Legacy insurance_ping table for backward compatibility
CREATE TABLE IF NOT EXISTS insurance_ping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    data LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- Comprehensive analytics view combining all request types
CREATE OR REPLACE VIEW request_analytics AS
SELECT 
    'ping' as request_type,
    id,
    timestamp,
    submission_id,
    provider,
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
    provider,
    status,
    total_value,
    ping_count,
    successful_posts,
    created_at
FROM post_requests
ORDER BY created_at DESC;

-- Dual ping comparison analytics
CREATE OR REPLACE VIEW comparison_analytics AS
SELECT 
    timestamp,
    winner,
    quotewizard_success,
    quotewizard_value,
    exchangeflo_success,
    exchangeflo_value,
    total_comparison_value,
    CASE 
        WHEN quotewizard_success AND exchangeflo_success THEN 'both_success'
        WHEN quotewizard_success AND NOT exchangeflo_success THEN 'qw_only'
        WHEN NOT quotewizard_success AND exchangeflo_success THEN 'ef_only'
        ELSE 'both_failed'
    END as success_pattern,
    CASE
        WHEN winner = 'quotewizard' THEN quotewizard_value
        WHEN winner = 'exchangeflo' THEN exchangeflo_value
        ELSE 0
    END as winning_value,
    JSON_EXTRACT(request_data, '$.zipcode') as zip_code,
    JSON_EXTRACT(request_data, '$.state') as state,
    JSON_EXTRACT(request_data, '$.coverageType') as coverage_type,
    JSON_EXTRACT(request_data, '$.vehicles') as vehicles_data
FROM ping_comparison
ORDER BY timestamp DESC;

-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_ping_provider_status_timestamp 
ON ping_requests (provider, status, timestamp);

CREATE INDEX IF NOT EXISTS idx_post_provider_status_timestamp 
ON post_requests (provider, status, timestamp);

CREATE INDEX IF NOT EXISTS idx_comparison_winner_timestamp 
ON ping_comparison (winner, timestamp);

-- ============================================================================
-- VERIFICATION AND TESTING
-- ============================================================================

-- Show table structures for verification
DESCRIBE ping_requests;
DESCRIBE post_requests;
DESCRIBE ping_comparison;
DESCRIBE insurance_ping;

-- Test database connection and show successful setup
SELECT 
    'Database setup completed successfully' as status, 
    NOW() as timestamp,
    'Single consolidated server architecture' as architecture_type,
    'QuoteWizard + ExchangeFlo dual ping system' as features; 