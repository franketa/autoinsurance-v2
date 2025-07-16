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
    status VARCHAR(50) DEFAULT 'unknown',
    ping_count INT DEFAULT 0,
    total_value DECIMAL(10,2) DEFAULT 0.00,
    request_data JSON,
    response_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add missing columns to existing ping_requests table (safely)
SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_requests' 
           AND COLUMN_NAME = 'provider'),
    'SELECT "Provider column already exists in ping_requests" as message',
    'ALTER TABLE ping_requests ADD COLUMN provider VARCHAR(50) DEFAULT "unknown" AFTER submission_id'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- General post requests table (supports all providers) 
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add missing columns to existing post_requests table (safely)
SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'post_requests' 
           AND COLUMN_NAME = 'provider'),
    'SELECT "Provider column already exists in post_requests" as message',
    'ALTER TABLE post_requests ADD COLUMN provider VARCHAR(50) DEFAULT "unknown" AFTER submission_id'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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
    request_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add computed column safely
SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_comparison' 
           AND COLUMN_NAME = 'total_comparison_value'),
    'SELECT "Column already exists" as message',
    'ALTER TABLE ping_comparison ADD COLUMN total_comparison_value DECIMAL(10,2) GENERATED ALWAYS AS (quotewizard_value + exchangeflo_value) STORED'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- LEGACY COMPATIBILITY (for any existing code)
-- ============================================================================

-- Legacy insurance_ping table for backward compatibility
CREATE TABLE IF NOT EXISTS insurance_ping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    data LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INDEXES (Create safely using conditional SQL)
-- ============================================================================

-- Basic indexes for ping_requests
SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_requests' 
           AND INDEX_NAME = 'idx_ping_timestamp'),
    'SELECT "Index idx_ping_timestamp already exists" as message',
    'CREATE INDEX idx_ping_timestamp ON ping_requests (timestamp)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_requests' 
           AND INDEX_NAME = 'idx_ping_submission_id'),
    'SELECT "Index idx_ping_submission_id already exists" as message',
    'CREATE INDEX idx_ping_submission_id ON ping_requests (submission_id)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_requests' 
           AND INDEX_NAME = 'idx_ping_status'),
    'SELECT "Index idx_ping_status already exists" as message',
    'CREATE INDEX idx_ping_status ON ping_requests (status)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_requests' 
           AND INDEX_NAME = 'idx_ping_created_at'),
    'SELECT "Index idx_ping_created_at already exists" as message',
    'CREATE INDEX idx_ping_created_at ON ping_requests (created_at)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Provider index (only if column exists)
SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_requests' 
           AND COLUMN_NAME = 'provider')
    AND NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
                   WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
                   AND TABLE_NAME = 'ping_requests' 
                   AND INDEX_NAME = 'idx_ping_provider'),
    'CREATE INDEX idx_ping_provider ON ping_requests (provider)',
    'SELECT "Provider column missing or index already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Basic indexes for post_requests
SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'post_requests' 
           AND INDEX_NAME = 'idx_post_timestamp'),
    'SELECT "Index idx_post_timestamp already exists" as message',
    'CREATE INDEX idx_post_timestamp ON post_requests (timestamp)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'post_requests' 
           AND INDEX_NAME = 'idx_post_submission_id'),
    'SELECT "Index idx_post_submission_id already exists" as message',
    'CREATE INDEX idx_post_submission_id ON post_requests (submission_id)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'post_requests' 
           AND INDEX_NAME = 'idx_post_status'),
    'SELECT "Index idx_post_status already exists" as message',
    'CREATE INDEX idx_post_status ON post_requests (status)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'post_requests' 
           AND INDEX_NAME = 'idx_post_created_at'),
    'SELECT "Index idx_post_created_at already exists" as message',
    'CREATE INDEX idx_post_created_at ON post_requests (created_at)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Provider index for post_requests (only if column exists)
SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'post_requests' 
           AND COLUMN_NAME = 'provider')
    AND NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
                   WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
                   AND TABLE_NAME = 'post_requests' 
                   AND INDEX_NAME = 'idx_post_provider'),
    'CREATE INDEX idx_post_provider ON post_requests (provider)',
    'SELECT "Provider column missing or index already exists in post_requests" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Indexes for ping_comparison
SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_comparison' 
           AND INDEX_NAME = 'idx_comparison_timestamp'),
    'SELECT "Index idx_comparison_timestamp already exists" as message',
    'CREATE INDEX idx_comparison_timestamp ON ping_comparison (timestamp)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_comparison' 
           AND INDEX_NAME = 'idx_comparison_winner'),
    'SELECT "Index idx_comparison_winner already exists" as message',
    'CREATE INDEX idx_comparison_winner ON ping_comparison (winner)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_comparison' 
           AND INDEX_NAME = 'idx_comparison_qw_success'),
    'SELECT "Index idx_comparison_qw_success already exists" as message',
    'CREATE INDEX idx_comparison_qw_success ON ping_comparison (quotewizard_success)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_comparison' 
           AND INDEX_NAME = 'idx_comparison_ef_success'),
    'SELECT "Index idx_comparison_ef_success already exists" as message',
    'CREATE INDEX idx_comparison_ef_success ON ping_comparison (exchangeflo_success)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Total value index (only if column exists)
SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_comparison' 
           AND COLUMN_NAME = 'total_comparison_value')
    AND NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
                   WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
                   AND TABLE_NAME = 'ping_comparison' 
                   AND INDEX_NAME = 'idx_comparison_total_value'),
    'CREATE INDEX idx_comparison_total_value ON ping_comparison (total_comparison_value)',
    'SELECT "Total comparison value column missing or index already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Legacy table indexes
SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'insurance_ping' 
           AND INDEX_NAME = 'idx_action'),
    'SELECT "Index idx_action already exists" as message',
    'CREATE INDEX idx_action ON insurance_ping (action)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'insurance_ping' 
           AND INDEX_NAME = 'idx_created_at'),
    'SELECT "Index idx_created_at already exists" as message',
    'CREATE INDEX idx_created_at ON insurance_ping (created_at)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- COMPOSITE INDEXES (Create safely)
-- ============================================================================

-- Composite indexes for common query patterns (only if all columns exist)
SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_requests' 
           AND COLUMN_NAME = 'provider')
    AND NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
                   WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
                   AND TABLE_NAME = 'ping_requests' 
                   AND INDEX_NAME = 'idx_ping_provider_status_timestamp'),
    'CREATE INDEX idx_ping_provider_status_timestamp ON ping_requests (provider, status, timestamp)',
    'SELECT "Skipping composite index - provider column missing or index exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'post_requests' 
           AND COLUMN_NAME = 'provider')
    AND NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
                   WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
                   AND TABLE_NAME = 'post_requests' 
                   AND INDEX_NAME = 'idx_post_provider_status_timestamp'),
    'CREATE INDEX idx_post_provider_status_timestamp ON post_requests (provider, status, timestamp)',
    'SELECT "Skipping composite index - provider column missing or index exists in post_requests" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS(SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = 'smartautoinsider_db' 
           AND TABLE_NAME = 'ping_comparison' 
           AND INDEX_NAME = 'idx_comparison_winner_timestamp'),
    'SELECT "Index idx_comparison_winner_timestamp already exists" as message',
    'CREATE INDEX idx_comparison_winner_timestamp ON ping_comparison (winner, timestamp)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- ANALYTICS VIEWS (Recreate safely)
-- ============================================================================

-- Drop existing views before recreating
DROP VIEW IF EXISTS request_analytics;
DROP VIEW IF EXISTS comparison_analytics;

-- Comprehensive analytics view combining all request types
CREATE VIEW request_analytics AS
SELECT 
    'ping' as request_type,
    id,
    timestamp,
    submission_id,
    COALESCE(provider, 'unknown') as provider,
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
    COALESCE(provider, 'unknown') as provider,
    status,
    total_value,
    ping_count,
    successful_posts,
    created_at
FROM post_requests
ORDER BY created_at DESC;

-- Dual ping comparison analytics
CREATE VIEW comparison_analytics AS
SELECT 
    timestamp,
    winner,
    quotewizard_success,
    quotewizard_value,
    exchangeflo_success,
    exchangeflo_value,
    COALESCE(quotewizard_value + exchangeflo_value, 0) as total_comparison_value,
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
-- VERIFICATION AND TESTING
-- ============================================================================

-- Show successful setup message
SELECT 
    'Database schema update completed successfully' as status, 
    NOW() as timestamp,
    'Single consolidated server architecture' as architecture_type,
    'QuoteWizard + ExchangeFlo dual ping system' as features,
    'Schema migration handled existing tables gracefully' as migration_notes; 