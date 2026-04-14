const db = require('./config/db');

async function checkImages() {
    try {
        console.log("Checking Restaurant Images...");
        const [restaurants] = await db.query('SELECT name, image_url FROM Restaurants');
        let restIssues = 0;
        restaurants.forEach(r => {
            if (!r.image_url || !r.image_url.startsWith('http')) {
                console.log(`[Broken/Missing] Restaurant: ${r.name} - URL: ${r.image_url}`);
                restIssues++;
            }
        });
        console.log(`Total Restaurant Image Issues: ${restIssues}`);

        console.log("\nChecking Menu Item Images...");
        const [menuItems] = await db.query('SELECT name, image_url, restaurant_id FROM MenuItems');
        let menuIssues = 0;
        menuItems.forEach(item => {
            if (!item.image_url || !item.image_url.startsWith('http')) {
                console.log(`[Broken/Missing] Menu Item: ${item.name} (Rest ID: ${item.restaurant_id}) - URL: ${item.image_url}`);
                menuIssues++;
            }
        });
        console.log(`Total Menu Item Image Issues: ${menuIssues}`);

    } catch (err) {
        console.error("Error checking images:", err);
    } finally {
        process.exit();
    }
}

checkImages();
