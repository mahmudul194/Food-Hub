const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function init() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'foodhub'
        });
        
        await db.query("ALTER TABLE Orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Credit/Debit Card'");
        console.log('payment_method added successfully');
        
        await db.query("ALTER TABLE Restaurants ADD COLUMN status ENUM('active','inactive') DEFAULT 'active'");
        
        process.exit(0);
    } catch (err) {
        console.log(err.message);
        process.exit(0);
    }
}
init();
