const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedDB() {
    try {
        const dbConfig = process.env.DATABASE_URL ? {
            uri: process.env.DATABASE_URL
        } : {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'foodhub'
        };

        const pool = mysql.createPool({
            ...(dbConfig.uri ? { uri: dbConfig.uri } : dbConfig),
            ssl: { rejectUnauthorized: false }
        });

        console.log('Seeding Users...');
        await pool.query('DELETE FROM Users'); // clear previous
        const hashedAdminPw = await bcrypt.hash('admin123', 10);
        await pool.query(
            `INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
            ['Admin User', 'admin@foodiehub.com', hashedAdminPw, 'admin']
        );
        const hashedUserPw = await bcrypt.hash('password123', 10);
        await pool.query(
            `INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
            ['John Doe', 'john@example.com', hashedUserPw, 'customer']
        );

        console.log('Seeding Restaurants...');
        await pool.query('DELETE FROM Restaurants');
        const [restRes] = await pool.query(
            `INSERT INTO Restaurants (name, description, rating, delivery_time, min_order, image_url) VALUES 
            ('Pizza Palace', 'Authentic Italian Pizzas', 4.8, '25-35 min', 15.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400'),
            ('Burger Blast', 'Juicy American Burgers', 4.5, '15-25 min', 10.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400'),
            ('Zen Sushi', 'Premium Sushi and Asian Cuisine', 4.9, '30-45 min', 20.00, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400')
            `
        );
        
        const pizzaPalaceId = restRes.insertId;

        console.log('Seeding Menu Items...');
        await pool.query('DELETE FROM MenuItems');
        await pool.query(
            `INSERT INTO MenuItems (restaurant_id, name, description, price, category, image_url) VALUES 
            (?, 'Classic Margherita', 'San Marzano tomato sauce, fresh buffalo mozzarella, basil.', 14.99, 'Pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600'),
            (?, 'Double Pepperoni', 'Loaded with spicy pepperoni, mozzarella.', 16.99, 'Pizza', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600'),
            (?, 'Carbonara', 'Egg yolk, pecorino, pancetta.', 14.00, 'Pasta', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=200')
            `,
            [pizzaPalaceId, pizzaPalaceId, pizzaPalaceId]
        );

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDB();
