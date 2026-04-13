# 🚀 FoodHub Full-Stack Deployment Guide

Welcome! Since this is your first time deploying a full-stack project, this guide will walk you through every step—from concepts to a live website.

## 🏗️ 1. Core Concepts
Before we start, let's understand how your app will live on the internet:
- **Frontend:** The HTML/CSS/JS files that users see in their browser. 
- **Backend:** The Node.js server (`server.js`) that handles login, orders, and talks to the database.
- **Database:** A separate cloud server (MySQL) that saves your users and menu data permanently.
- **Environment Variables:** Secret settings (like passwords) that we don't upload to GitHub for security.

---

## 🌎 2. Phase 1: The Database (MySQL)
Your local database won't work on the internet. We need a cloud-hosted MySQL database.

### 🛠️ Recommended: [TiDB Cloud](https://tidbcloud.com/) (Free Tier)
1.  **Sign Up:** Create a free account on TiDB Cloud.
2.  **Create Cluster:** Choose the **"Starter"** (Free) tier and pick a region close to you.
3.  **Get Connection String:** 
    - Click **Connect**.
    - Choose **Standard Connection**.
    - It will look like: `mysql://username:password@host:port/database`
    - **IMPORTANT:** Save this string. You will need it later.

### 📥 3. Prepare the Database Tables
Once you have your cloud connection string:
1.  Open your `.env` file locally.
2.  Change `DB_HOST`, `DB_USER`, etc., or just use a single `DATABASE_URL` if your code supports it.
3.  Run the migration script to create tables on the cloud:
    ```bash
    node backend/migrate.js
    ```
4.  (Optional) Seed some initial data:
    ```bash
    node backend/seed_restaurants.js
    ```

---

## 📦 4. Phase 2: Prepare for Cloud Hosting
We will use **Render.com** to host your code. Render will take your code from GitHub and run it.

### 📤 Push to GitHub
1.  Make sure you have a `.gitignore` file that includes `.env`. **Never upload your passwords!**
2.  Commit and push:
    ```bash
    git add .
    git commit -m "Prepare for cloud deployment"
    git push origin main
    ```

---

## 🚀 5. Phase 3: Deploy to Render
1.  **Login:** Go to [Render](https://dashboard.render.com).
2.  **New Web Service:** Click **New +** > **Web Service**.
3.  **Connect GitHub:** Select your FoodHub repository.
4.  **Settings:**
    - **Name:** `foodhub-live`
    - **Environment:** `Node`
    - **Build Command:** `cd backend && npm install`
    - **Start Command:** `cd backend && npm start`
5.  **Environment Variables (CRITICAL):**
    Click the **Environment** tab and add these keys:
    - `DATABASE_URL`: paste your TiDB connection string here.
    - `NODE_ENV`: `production`
    - `API_PORT`: `10000` (Render's default port)

---

## 🔍 6. How it all fits together
In this setup, your Backend is the **"Host"**:
- When someone visits your URL, the Backend sends them the `frontend/index.html` file.
- When the UI needs data (like the menu), it calls the Backend's `/api/...` routes.
- The Backend fetches that data from your **TiDB Cloud Database**.

---

## ⚠️ Troubleshooting (Common Newbie Issues)
- **"Server is sleeping":** On the free tier, Render puts your app to sleep after 15 mins of inactivity. The first person to visit it after that will wait ~30 seconds for it to "wake up".
- **Database Connection Error:** Double-check your `DATABASE_URL`. Make sure you didn't include `<...>` brackets from the TiDB instructions.
- **Port Error:** Ensure your `server.js` uses `process.env.API_PORT || 5000`.

---
*Created with ❤️ by Antigravity to help you launch your first project!*

