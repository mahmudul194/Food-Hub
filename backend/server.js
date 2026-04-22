const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./config/db');
const compression = require('compression');
const morgan = require('morgan');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 5000;

// Middleware
app.use(compression());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/ui', express.static(path.join(__dirname, '../ui')));
app.use('/', express.static(path.join(__dirname, '../frontend')));

// Auth API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
        
        // Exclude password hash
        const { password_hash, ...userData } = user;
        res.json({ message: 'Login successful', user: userData });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body; // Add role override specifically for admin setup via UI if allowed, though typically fixed. We'll default to customer.
    try {
        const [existing] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });

        const hashedPw = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPw, role || 'customer']
        );
        
        res.json({ message: 'Registration successful', userId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Simple in-memory cache
const cache = {
    restaurants: { data: null, lastFetched: 0 },
    ttl: 10 * 60 * 1000 // 10 minutes cache
};

// Restaurants API
app.get('/api/restaurants', async (req, res) => {
    try {
        const now = Date.now();
        if (cache.restaurants.data && (now - cache.restaurants.lastFetched < cache.ttl)) {
            return res.json(cache.restaurants.data);
        }

        const [rows] = await db.query('SELECT * FROM Restaurants');
        cache.restaurants.data = rows;
        cache.restaurants.lastFetched = now;
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/restaurants/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Restaurants WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/restaurants/:id/menu', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM MenuItems WHERE restaurant_id = ?', [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Orders API
app.post('/api/orders', async (req, res) => {
    const { userId, restaurantId, items, totalAmount, deliveryAddress, paymentMethod } = req.body;
    try {
        const [orderResult] = await db.query(
            'INSERT INTO Orders (user_id, restaurant_id, total_amount, status, delivery_address, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, restaurantId, totalAmount, 'pending', deliveryAddress, paymentMethod || 'Credit/Debit Card']
        );
        const orderId = orderResult.insertId;

        for (let item of items) {
            await db.query(
                'INSERT INTO OrderItems (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.price]
            );
        }
        res.json({ message: 'Order placed successfully', orderId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

app.get('/api/orders/user/:id', async (req, res) => {
    try {
        const [orders] = await db.query(
            'SELECT o.*, r.name as restaurant_name, r.image_url as restaurant_image FROM Orders o JOIN Restaurants r ON o.restaurant_id = r.id WHERE o.user_id = ? ORDER BY o.created_at DESC',
            [req.params.id]
        );
        
        for (let order of orders) {
            const [items] = await db.query(
                'SELECT oi.*, m.name FROM OrderItems oi JOIN MenuItems m ON oi.menu_item_id = m.id WHERE oi.order_id = ?',
                [order.id]
            );
            order.items = items;
        }
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin Dashboard APIs
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [[revenueRow]] = await db.query('SELECT SUM(total_amount) as total FROM Orders');
        const [[ordersRow]] = await db.query('SELECT COUNT(*) as count FROM Orders');
        const [[usersRow]] = await db.query('SELECT COUNT(*) as count FROM Users WHERE role="customer"');
        
        const [popularItems] = await db.query(`
            SELECT m.name, m.category, m.image_url as img, COUNT(oi.id) as orders, SUM(oi.price * oi.quantity) as revenue
            FROM MenuItems m
            LEFT JOIN OrderItems oi ON m.id = oi.menu_item_id
            GROUP BY m.id
            ORDER BY orders DESC
            LIMIT 5
        `);

        res.json({
            revenue: revenueRow.total || 0,
            orders: ordersRow.count || 0,
            avgOrder: ordersRow.count > 0 ? (revenueRow.total / ordersRow.count) : 0,
            customers: usersRow.count || 0,
            popularItems: popularItems.map(i => ({
                ...i,
                status: i.orders > 10 ? 'BEST SELLER' : (i.orders > 0 ? 'TRENDING' : 'NORMAL')
            }))
        });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin Manage Endpoints
app.post('/api/admin/menu', async (req, res) => {
    const { restaurant_id, name, description, price, category, image_url } = req.body;
    try {
        await db.query(
            'INSERT INTO MenuItems (restaurant_id, name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [restaurant_id, name, description, price, category, image_url]
        );
        res.json({ message: 'Menu item added' });
    } catch (err) {
        console.error('Error adding menu item:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/admin/menu/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM MenuItems WHERE id = ?', [req.params.id]);
        res.json({ message: 'Menu item deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin Comprehensive Getters
app.get('/api/admin/orders', async (req, res) => {
    try {
        // Fetch all orders with user and restaurant names
        const [orders] = await db.query(`
            SELECT o.*, u.name as customer_name, r.name as restaurant_name 
            FROM Orders o 
            JOIN Users u ON o.user_id = u.id 
            JOIN Restaurants r ON o.restaurant_id = r.id 
            ORDER BY o.created_at DESC
        `);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
    try {
        await db.query('UPDATE Orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
        res.json({ message: 'Order status updated' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, phone, created_at FROM Users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/admin/users/:id/role', async (req, res) => {
    try {
        await db.query('UPDATE Users SET role = ? WHERE id = ?', [req.body.role, req.params.id]);
        res.json({ message: 'User role updated' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});


app.put('/api/users/:id', async (req, res) => {
    const { name, email, phone, address, profile_picture } = req.body;
    try {
        await db.query(
            'UPDATE Users SET name = ?, email = ?, phone = ?, address = ?, profile_picture = COALESCE(?, profile_picture) WHERE id = ?', 
            [name, email, phone, address, profile_picture, req.params.id]
        );
        
        // Return updated user data (excluding password)
        const [rows] = await db.query('SELECT id, name, email, role, phone, address, profile_picture FROM Users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Profile updated', user: rows[0] });
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ error: 'Database error' });
    }
});
// After that........;
// Start Server........
app.listen(PORT, () => {
    console.log(`Food Hub backend server running on port ${PORT}`);
});


