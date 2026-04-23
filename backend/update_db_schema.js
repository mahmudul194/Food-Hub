const db = require('./config/db');

async function updateSchema() {
    try {
        console.log('Checking for payment_method column in Orders table...');
        const [columns] = await db.query('SHOW COLUMNS FROM Orders LIKE "payment_method"');
        
        if (columns.length === 0) {
            console.log('Adding payment_method column to Orders table...');
            await db.query('ALTER TABLE Orders ADD COLUMN payment_method VARCHAR(50) DEFAULT "Credit/Debit Card"');
            console.log('Column added successfully!');
        } else {
            console.log('payment_method column already exists.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}
// After the process..........
//called updateSchema function.......
updateSchema();
