const db = require('./backend/config/db');
async function addData() { 
    try {
        await db.query("INSERT INTO MenuItems (restaurant_id, name, description, price, category, image_url) VALUES (1, 'Garden Veggie', 'Bell peppers, mushrooms, onions, black olives, and vine-ripened tomatoes.', 15.50, 'Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop');"); 
        await db.query("INSERT INTO MenuItems (restaurant_id, name, description, price, category, image_url) VALUES (1, 'Truffle Mushroom', 'Wild mushrooms, creamy white sauce, fontina cheese, and truffle oil drizzle.', 18.99, 'Pizza', 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=600&auto=format&fit=crop');"); 
        await db.query("INSERT INTO MenuItems (restaurant_id, name, description, price, category, image_url) VALUES (1, 'Penne Arrabbiata', 'Spicy tomato sauce, garlic, chili.', 13.50, 'Pasta', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=600&auto=format&fit=crop');"); 
        console.log('Done'); 
    } catch(e) {
        console.log(e);
    }
    process.exit(0); 
} 
addData();

