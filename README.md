# WarehouseFlow — Smart Warehouse & Inventory Management System 🚀

A full-stack, enterprise-grade inventory operating platform built with **React.js (Vite)**, **Node.js**, **Express.js**, and **MongoDB**. Engineered with **Object-Oriented Programming (OOP)** service architecture, **Data Structures & Algorithms (DSA)** for search & sorting, and tailored specifically for everyday Indian retail and FMCG godowns.

---

## 🌟 Key Highlights & Features

### 1. 🗺️ Interactive 2D Visual Warehouse Map (Floor Plan)
- Visual color-coded godown floor plan:
  - 🟢 **Green Shelf**: Full / Healthy stock buffer.
  - 🟡 **Yellow Shelf**: Low stock warning.
  - 🔴 **Red Shelf**: Critical / Empty shelf needing replenishment.
  - ⚪ **Empty Slot**: Available rack space.
- **Live Product Locator**: Search any item (e.g. *Basmati Rice*, *boAt Cable*) and watch the exact shelf pulse with a glowing beacon.
- **Shelf Inspector**: Click any shelf rack to view all stored items, with 1-click Quick Stock In and Quick Dispatch.

### 2. ⏳ Expiry Date & Batch Tracker (Sell Oldest Stock First)
- Assigns batch numbers (e.g. `BATCH-2026-AUG-01`), manufacturing dates, and best-before expiry countdowns.
- **Priority Queue**: Highlights earliest expiring batches to pick and sell today so perishable goods (*Tata Tea*, *Basmati Rice*, *Dettol*) never spoil.
- **Smart Dispatch**: Automatically deducts units from the oldest expiring batch first.

### 3. ⭐ Supplier Quality & Reliability Scorecard
- Automatically evaluates and grades suppliers (1 to 5 Stars ⭐) based on:
  - ⏰ **On-Time Delivery Rate (%)**: Punctual truck arrival vs promised lead times.
  - 📦 **Damaged Goods Rate (%)**: Defect and damaged package inspection upon unloading.
  - 💰 **Price Stability Score (%)**: Tracks price consistency vs unexpected hikes.
- **Performance Grades**: 🏆 Grade A+ (Top Tier), ⭐ Grade A (Reliable), 🟡 Grade B (Moderate), 🔴 Grade C (High Risk).
- **Quality Audit Tool**: Log shipment arrival audits to dynamically recalculate vendor ratings in real time.

### 4. 🧠 Smart Reorder Recommendation Engine
Eliminates stockout guesswork using automated mathematical replenishment:
$$\text{Daily Sales Velocity } (V_d) = \frac{\text{Weekly Sales}}{7}$$
$$\text{Lead Time Demand } (LTD) = V_d \times \text{Supplier Lead Time (Days)}$$
$$\text{Reorder Point } (ROP) = LTD + \text{Safety Stock}$$
$$\text{Days Until Stockout} = \frac{\text{Current Stock}}{V_d}$$
$$\text{Suggested Replenishment Qty} = (V_d \times 30) + \text{Safety Stock} - \text{Current Stock}$$

### 5. 📦 Stock Movements & Audit Ledger
- **Stock In / Receiving**: Inward receipts with vendor invoice cross-referencing and automatic cost updating.
- **Stock Out / Dispatch**: Sales order fulfillment with negative stock prevention.
- **Cycle Count Adjustment**: Physical audit reconciliation with signed deltas.
- **Real-Time Audit Trail**: Chronological immutable ledger tracking user, timestamp, quantity, and reason.

### 6. 📊 Real-Time Analytics & Financial Metrics
- Real-time valuation in **₹ (INR)** across inventory cost value and retail value.
- Chart.js visual analytics: category stock share, fast-moving items, and inbound vs outbound volume flows.

---

## 🏗️ Technical Architecture & OOP Design

The backend is organized cleanly with Object-Oriented service layers:
- `server/oop/BaseService.js`: Base class providing generic CRUD operations and automated audit logging.
- `server/oop/ReorderEngine.js`: Mathematical replenishment heuristics and priority ranking.
- `server/oop/FIFOManager.js`: Batch sorting and oldest-stock priority allocation algorithm.
- `server/oop/SupplierScorecardEngine.js`: Automated 3-pillar vendor rating calculations.
- `server/oop/InventoryManager.js`: Atomic inventory mutations and stock validation.
- `server/oop/OrderManager.js`: Purchase order state machine and receiving workflows.
- `server/oop/SearchAndSortDSA.js`: Binary search on sorted SKU indexes and quicksort comparator pipelines.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- Local MongoDB or MongoDB Atlas instance

### 1. Server Setup
```bash
cd server
npm install
npm run seed     # Seeds realistic everyday products, batches, and suppliers
npm run dev      # Runs backend on http://localhost:5000
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev      # Launches frontend on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Default User |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@warehouseflow.com` | `admin123` | **Veer Goel (Admin)** |
| **Warehouse Manager** | `manager@warehouseflow.com` | `admin123` | **Rohan Gupta (Warehouse Mgr)** |

---

## 🐙 Publishing to GitHub

```bash
# 1. Initialize git repository
git init

# 2. Add all files (node_modules and .env are automatically ignored)
git add .

# 3. Commit changes
git commit -m "feat: complete WarehouseFlow Smart Inventory OS with 2D Map, Batch Tracker & Supplier Scorecard"

# 4. Link your remote GitHub repository
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# 5. Push to GitHub
git push -u origin main
```
