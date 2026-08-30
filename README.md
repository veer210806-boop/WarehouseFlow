# WarehouseFlow — Smart Inventory & Warehouse Management System 🚀

WarehouseFlow is a full-stack web application for managing warehouse operations, inventory tracking, stock movements, and supplier management. Built with **React.js**, **Node.js**, **Express.js**, and **MongoDB**.

---

## 🌟 Key Features

### 1. 🗺️ Interactive 2D Warehouse Map (Floor Plan)
- **Visual Floor Plan**: Color-coded shelves (Green for in-stock, Yellow for low-stock, Red for empty).
- **Product Locator**: Search any item and see its exact shelf location light up on the map.
- **Shelf Inspector**: Click any shelf to view stored items and perform quick stock movements.

### 2. ⏳ Expiry Date & Batch Tracker
- Track batch numbers, manufacturing dates, and expiration countdowns.
- Automatic alert for items nearing expiration so the oldest stock gets sold first.
- Helps prevent food and packaged goods spoilage.

### 3. ⭐ Supplier Reliability Scorecard
- Simple 1 to 5 star rating for suppliers based on:
  - On-time delivery arrival.
  - Damaged or defective goods inspection.
  - Consistent wholesale pricing.
- Quality inspection form to log shipment arrivals.

### 4. 📦 Stock Management & History
- **Stock In**: Record incoming stock from suppliers.
- **Stock Out**: Record outgoing orders for customers.
- **Stock Adjustment**: Update counts during physical stock checks.
- Complete activity log of every transaction with timestamps and user names.

### 5. 🛒 Orders & Invoices (₹ INR)
- Create purchase orders for suppliers.
- Automatic calculation of subtotals and GST.
- Printable purchase order invoices.

### 6. 📊 Analytics Dashboard
- Overview of total products, low stock alerts, and inventory value in Indian Rupees (₹).
- Visual charts for category distribution and stock trends.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), CSS3, Lucide Icons, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens) & bcrypt

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js installed on your computer
- MongoDB running locally (or MongoDB Atlas connection URI)

### 1. Start the Backend Server
```bash
cd server
npm install
npm run seed     # Loads initial demo data
npm run dev      # Runs server on http://localhost:5000
```

### 2. Start the Frontend Client
```bash
cd client
npm install
npm run dev      # Runs frontend on http://localhost:5173
```

---

## 🔑 Demo Login

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@warehouseflow.com` | `admin123` |
| **Warehouse Manager** | `manager@warehouseflow.com` | `admin123` |
