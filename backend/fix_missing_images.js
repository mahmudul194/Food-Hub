const db = require('./config/db');

async function fix() {
    try {
        console.log('Fixing Burger images');
        await db.query("UPDATE Restaurants SET image_url = 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop' WHERE image_url LIKE '%1594212848116%'");
        await db.query("UPDATE MenuItems SET image_url = 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop' WHERE image_url LIKE '%1594212848116%'");

        console.log('Fixing Sushi images');
        const sushiFallback = 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop';
        await db.query(`UPDATE Restaurants SET image_url = '${sushiFallback}' WHERE image_url LIKE '%1583623025817%'`);
        await db.query(`UPDATE MenuItems SET image_url = '${sushiFallback}' WHERE image_url LIKE '%1583623025817%'`);
        await db.query(`UPDATE Restaurants SET image_url = '${sushiFallback}' WHERE image_url LIKE '%1563612116625%'`);
        await db.query(`UPDATE MenuItems SET image_url = '${sushiFallback}' WHERE image_url LIKE '%1563612116625%'`);

        console.log('Fixing Dessert images');
        const dessertFallback = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop';
        for (const bad of ['1563805042', '1511381939415', '1519676860058']) {
            await db.query(`UPDATE Restaurants SET image_url = '${dessertFallback}' WHERE image_url LIKE '%${bad}%'`);
            await db.query(`UPDATE MenuItems SET image_url = '${dessertFallback}' WHERE image_url LIKE '%${bad}%'`);
        }

        console.log('Fixing Healthy and Drink images');
        await db.query("UPDATE Restaurants SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop' WHERE image_url LIKE '%1556481023%'");
        await db.query("UPDATE MenuItems SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop' WHERE image_url LIKE '%1556481023%'");
        await db.query("UPDATE Restaurants SET image_url = 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop' WHERE image_url LIKE '%1558857563%'");
        await db.query("UPDATE MenuItems SET image_url = 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop' WHERE image_url LIKE '%1558857563%'");

        console.log('All missing 404 images updated in DB.');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
fix();

