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