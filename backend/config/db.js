const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Database configuration
const dbConfig = process.env.DATABASE_URL || process.env.DB_URL ? {
    uri: process.env.DATABASE_URL || process.env.DB_URL
} : {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'foodhub'
};

const pool = mysql.createPool({
    ...(dbConfig.uri ? { uri: dbConfig.uri } : dbConfig),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false // Required for most cloud MySQL providers
    }
});

module.exports = pool;
