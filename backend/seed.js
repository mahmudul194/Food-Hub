const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const categories = ['Pizza', 'Burgers', 'Sushi', 'Asian', 'Desserts', 'Healthy', 'Drinks'];

const restaurantData = {
    'Pizza': [
        { name: 'Napoli Pizza Co.', image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600&auto=format&fit=crop', desc: 'Authentic Neapolitan Pizza' },
        { name: 'Crust & Crumbs', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop', desc: 'Gourmet Sourdough Pizzas' },
        { name: 'Slice of Heaven', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop', desc: 'New York Style Huge Slices' },
        { name: 'Firebaked Pizzeria', image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=600&auto=format&fit=crop', desc: 'Woodfired Artisan Pies' },
        { name: 'The Cheesy Corner', image: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?q=80&w=600&auto=format&fit=crop', desc: 'Deep Dish Comfort Food' }
    ],
    'Burgers': [
        { name: 'Smash Hit Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', desc: 'Premium Smash Burgers' },
        { name: 'Burger Joint', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop', desc: 'Classic American Diner' },
        { name: 'The Angus Block', image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?q=80&w=600&auto=format&fit=crop', desc: '100% Black Angus Beef' },
        { name: 'Veggie Patty Co.', image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=600&auto=format&fit=crop', desc: 'Plant-Based Gourmet Burgers' },
        { name: 'Brioche & Beef', image: 'https://images.unsplash.com/photo-1594212848116-b8db20ec3f30?q=80&w=600&auto=format&fit=crop', desc: 'Loaded Specialty Burgers' }
    ],
    'Sushi': [
        { name: 'Tokyo Bites', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop', desc: 'Fresh Sushi & Sashimi' },
        { name: 'Sushi Zen', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=600&auto=format&fit=crop', desc: 'Artisan Sushi Rolls' },
        { name: 'Ocean Catch Sushi', image: 'https://images.unsplash.com/photo-1583623025817-d180a2221dce?q=80&w=600&auto=format&fit=crop', desc: 'Premium Seafood Sushi' },
        { name: 'Sashimi Express', image: 'https://images.unsplash.com/photo-1563612116625-3012372fcec4?q=80&w=600&auto=format&fit=crop', desc: 'Quick & Delicious Rolls' },
        { name: 'The Rolling Rice', image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=600&auto=format&fit=crop', desc: 'Creative Fusion Maki' }
    ],
    'Asian': [
        { name: 'Wok Star', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&auto=format&fit=crop', desc: 'Authentic Chinese Wok' },
        { name: 'Dragon Noodles', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=600&auto=format&fit=crop', desc: 'Hand-pulled Noodles & Bowls' },
        { name: 'Spicy Thai Kitchen', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=600&auto=format&fit=crop', desc: 'Curries & Pad Thai' },
        { name: 'Seoul BBQ Station', image: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=600&auto=format&fit=crop', desc: 'Korean BBQ & Bibimbap' },
        { name: 'Dim Sum Delights', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=600&auto=format&fit=crop', desc: 'Traditional Dim Sum Baskets' }
    ],
    'Desserts': [
        { name: 'Sweet Tooth Bakery', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop', desc: 'Cakes & Pastries' },
        { name: 'Ice Cream Parlor', image: 'https://images.unsplash.com/photo-1563805042-7684c8e9e533?q=80&w=600&auto=format&fit=crop', desc: 'Artisanal Gelato & Shakes' },
        { name: 'The Donut Hole', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=600&auto=format&fit=crop', desc: 'Glazed & Filled Donuts' },
        { name: 'Choco Bliss', image: 'https://images.unsplash.com/photo-1511381939415-e440c05231e2?q=80&w=600&auto=format&fit=crop', desc: 'Decadent Chocolate Desserts' },
        { name: 'Crepe Corner', image: 'https://images.unsplash.com/photo-1519676860058-324335c77eba?q=80&w=600&auto=format&fit=crop', desc: 'French Crepes & Waffles' }
    ],
    'Healthy': [
        { name: 'Green Bowl Goodness', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop', desc: 'Fresh Salads & Quinoa' },
        { name: 'Smoothie Life', image: 'https://images.unsplash.com/photo-1556481023-455a2ea1295e?q=80&w=600&auto=format&fit=crop', desc: 'Acai Bowls & Smoothies' },
        { name: 'Fit Foodies', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop', desc: 'Macro-Tracked Clean Meals' },
        { name: 'Vegan Delight', image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?q=80&w=600&auto=format&fit=crop', desc: '100% Plant Based Bowls' },
        { name: 'Wrap It Up', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop', desc: 'Healthy Wraps & Soups' }
    ],
    'Drinks': [
        { name: 'Coffee Roasters', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop', desc: 'Specialty Coffee & Espressos' },
        { name: 'Boba Bubble', image: 'https://images.unsplash.com/photo-1558857563-b37103387ca3?q=80&w=600&auto=format&fit=crop', desc: 'Milk Teas & Boba' },
        { name: 'Juice Master', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=600&auto=format&fit=crop', desc: 'Cold Pressed Juices' },
        { name: 'The Matcha Bar', image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=600&auto=format&fit=crop', desc: 'Matcha Lattes & Refreshers' },
        { name: 'Tropical Smoothies', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&auto=format&fit=crop', desc: 'Island Inspired Drinks' }
    ]
};

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
        await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
        await pool.query('DELETE FROM OrderItems');
        await pool.query('DELETE FROM Orders');
        await pool.query('DELETE FROM Users'); // clear previous
        const hashedAdminPw = await bcrypt.hash('admin123', 10);
        await pool.query(
            `INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
            ['Admin User', 'admin@foodhub.com', hashedAdminPw, 'admin']
        );
        const hashedUserPw = await bcrypt.hash('password123', 10);
        await pool.query(
            `INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
            ['John Doe', 'john@example.com', hashedUserPw, 'customer']
        );

        console.log('Seeding Restaurants...');
        await pool.query('DELETE FROM Restaurants');
        await pool.query('DELETE FROM MenuItems');
        
        for (const category of categories) {
            const restaurants = restaurantData[category];
            for (const r of restaurants) {
                // Determine a random rating between 4.0 and 4.9
                const rating = (Math.random() * 0.9 + 4.0).toFixed(1);
                // Delivery time
                const delivery_time = '20-35 min';

                const [resResult] = await pool.query(
                    'INSERT INTO Restaurants (name, rating, delivery_time, image_url, description, min_order) VALUES (?, ?, ?, ?, ?, ?)',
                    [r.name, rating, delivery_time, r.image, `${r.desc} - ${category}`, 15.00]
                );

                const resId = resResult.insertId;

                // Insert 3 dummy items for each restaurant to keep it populated
                await pool.query('INSERT INTO MenuItems (restaurant_id, name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)', [
                    resId, `${category} Special 1`, 'Our highly recommended signature dish.', (Math.random() * 10 + 5).toFixed(2), 'Popular', r.image
                ]);
                await pool.query('INSERT INTO MenuItems (restaurant_id, name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)', [
                    resId, `${category} Special 2`, 'A classic favorite among regulars.', (Math.random() * 10 + 5).toFixed(2), 'Popular', r.image
                ]);
                await pool.query('INSERT INTO MenuItems (restaurant_id, name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)', [
                    resId, `${category} Combo`, 'Perfect for sharing.', (Math.random() * 15 + 10).toFixed(2), 'Starters', r.image
                ]);
            }
            console.log(`Seeded category ${category} with ${restaurants.length} restaurants!`);
        }

        await pool.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}
// After the process...
// called seedDB function.
seedDB();

