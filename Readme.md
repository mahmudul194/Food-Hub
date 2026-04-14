# 🍔 FoodHub - Full Stack Food Delivery System

FoodHub is a modern full-stack food delivery web application that enables users to explore restaurants, browse menus, and order food seamlessly from the comfort of their homes.

Designed with a clean UI and efficient backend, FoodHub delivers a smooth and user-friendly experience for both customers and administrators.

---

## 🌐 Project Overview

FoodHub simplifies the food ordering process by combining restaurant discovery, menu browsing, and order management into one platform. Users can quickly find their favorite meals, while admins can efficiently manage the system.

---

## 🖼️ UI Preview

![FoodHub Preview](./assets/preview.png)


---

## 🚀 Features

### 👤 User Features

* 🔐 User Authentication (Register/Login)
* 🍽️ Browse Restaurants
* 📋 View Food Menus
* 🔎 Search Food Items
* 🛒 Add to Cart
* 📦 Place Orders
* 📜 Order History
* 📍 Order Tracking (Optional)

### 🛠️ Admin Features

* 📊 Admin Dashboard
* 👥 Manage Users
* 🍔 Manage Food Items (Add / Update / Delete)
* 🏪 Manage Restaurants
* 📦 Manage Orders

---

## 🧑‍💻 Tech Stack

### 🎨 Frontend

* HTML5
* CSS3
* JavaScript

### ⚙️ Backend

* Node.js
* Express.js

### 🗄️ Database

* MySQL

---

## 🏗️ Project Structure

```bash
Food-Hub/
│
├── frontend/
│   ├── index.html
│   ├── styles/
│   ├── scripts/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│
├── database/
│   ├── schema.sql
│
├── assets/
│   └── preview.png
│
├── .env
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/mahmudul194/Food-Hub.git
cd Food-Hub
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=foodhub
JWT_SECRET=your_secret_key
```

---

### 4️⃣ Setup Database

* Create a MySQL database named `foodhub`
* Import the SQL schema file

---

### 5️⃣ Run the Application

```bash
npm start
```

---

### 6️⃣ Open in Browser

```
http://localhost:3000
```

---

## 🔌 API Endpoints (Sample)

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| POST   | /api/auth/register | Register user       |
| POST   | /api/auth/login    | Login user          |
| GET    | /api/restaurants   | Get all restaurants |
| GET    | /api/menu/:id      | Get menu items      |
| POST   | /api/order         | Place order         |

---

## 🎯 Key Highlights

* ✨ Clean and modern UI design
* ⚡ Fast and responsive performance
* 🔒 Secure authentication system
* 🧩 Modular backend architecture
* 📦 Scalable project structure

---

## 🚀 Future Enhancements

* 💳 Payment Gateway Integration (Stripe / SSLCommerz)
* 🔐 JWT Authentication & Role-Based Access Control (Admin/User)
* 🔔 Real-time Notifications (WebSockets / Socket.io)
* ⭐ Ratings & Reviews System
* 🧾 Order Invoice & Download (PDF Generation)
* 📊 Advanced Admin Analytics Dashboard (Sales, Users, Orders)
* 🌍 Multi-language Support (i18n)
* 📍 Live Order Tracking with Map Integration
* ❤️ Wishlist / Favorite Items Feature
* 🧠 AI-based Food Recommendation System
* 🧪 Unit & Integration Testing (Jest / Mocha)
* ⚡ Performance Optimization (Lazy Loading, Caching)
* 🔎 SEO Optimization for better visibility
* 📱 Progressive Web App (PWA) Support

---

## ✅ Current Status

* 🚀 Successfully Deployed on Render
* 📱 Fully Responsive Design (Mobile + Desktop)
* ⚡ Smooth UI/UX with optimized performance


---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to GitHub
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Mahmudul Hoque Rifat**
🔗 https://github.com/mahmudul194

---

## ⭐ Support

If you like this project, please ⭐ the repository and share it!
