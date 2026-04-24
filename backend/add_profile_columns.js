const db = require('./config/db');

async function migrate() {
    try {
        console.log('Checking for missing columns in Users table...');
        
        const [columns] = await db.query('SHOW COLUMNS FROM Users');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('address')) {
            console.log('Adding address column to Users table...');
            await db.query('ALTER TABLE Users ADD COLUMN address TEXT');
            console.log('address column added successfully.');
        } else {
            console.log('address column already exists.');
        }

        if (!columnNames.includes('profile_picture')) {
            console.log('Adding profile_picture column to Users table...');
            await db.query('ALTER TABLE Users ADD COLUMN profile_picture LONGTEXT');
            console.log('profile_picture column added successfully.');
        } else {
            console.log('profile_picture column already exists.');
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}
// After process .........................;
// Call migrate function..........
migrate();


