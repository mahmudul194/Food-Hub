const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initDB() {
    try {
        const dbConfig = process.env.DATABASE_URL ? {
            uri: process.env.DATABASE_URL
        } : {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'foodhub'
        };

        console.log('Connecting to database...');
        const connection = await mysql.createConnection({
            ...(dbConfig.uri ? { uri: dbConfig.uri } : dbConfig),
            ssl: { rejectUnauthorized: false }
        });

        console.log('Creating Users table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('customer', 'admin') DEFAULT 'customer',
                phone VARCHAR(20),
                address TEXT,
                profile_picture LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Creating Restaurants table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Restaurants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                rating DECIMAL(3, 1) DEFAULT 0.0,
                delivery_time VARCHAR(50),
                min_order DECIMAL(10, 2) DEFAULT 0.00,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Creating MenuItems table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS MenuItems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                restaurant_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category VARCHAR(50),
                image_url TEXT,
                FOREIGN KEY (restaurant_id) REFERENCES Restaurants(id) ON DELETE CASCADE
            );
        `);

        console.log('Creating Orders table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                restaurant_id INT NOT NULL,
                status ENUM('pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
                total_amount DECIMAL(10, 2) NOT NULL,
                delivery_address TEXT NOT NULL,
                payment_method VARCHAR(50) DEFAULT 'Credit/Debit Card',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id),
                FOREIGN KEY (restaurant_id) REFERENCES Restaurants(id)
            );
        `);

        console.log('Creating OrderItems table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS OrderItems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                menu_item_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
                FOREIGN KEY (menu_item_id) REFERENCES MenuItems(id)
            );
        `);

        console.log('Database initialization completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initDB();

