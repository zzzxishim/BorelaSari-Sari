# BorelaSari-Sari Store Management System — User Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Navigation](#navigation)
4. [Home Page](#home-page)
5. [Dashboard](#dashboard)
6. [Products](#products)
7. [Expenses](#expenses)
8. [Reports](#reports)
9. [Analytics](#analytics)
10. [Settings](#settings)
11. [Real-Time Sync](#real-time-sync)
12. [Keyboard Shortcuts & Tips](#keyboard-shortcuts--tips)
13. [Troubleshooting](#troubleshooting)

---

## System Overview

**BorelaSari-Sari** is a full-stack web application designed for Philippine sari-sari store owners to manage their business operations. It tracks sales, expenses, inventory, and generates financial reports — all with real-time updates across multiple browser tabs or devices.

### Tech Stack
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + Recharts
- **Backend:** Node.js + Express + Socket.io
- **Database:** SQLite (file-based, zero-config)
- **Real-Time:** WebSocket via Socket.io

### Key Features
- Add/edit/delete sales, expenses, and products
- **Date-filtered KPI cards** on Dashboard (Today / Week / Month / Year / Custom)
- Low-stock alerts
- Pie charts, bar charts, and line graphs
- CSV export
- Light & dark mode
- Toast notifications for all actions
- Real-time cross-tab synchronization

---

## Getting Started

### 1. Start the Backend Server

Open a terminal in the `backend` folder:

```bash
cd backend
npm install        # one-time setup
npm run seed       # one-time: fills database with sample data
npm run dev        # starts API on http://localhost:3001
```

### 2. Start the Frontend

Open a terminal in the project root:

```bash
npm install        # one-time setup
npm run dev        # starts app on http://localhost:5173
```

### 3. Open in Browser

Navigate to `http://localhost:5173`. The app works best in Chrome, Edge, or Firefox.

---

## Navigation

The top navigation bar is always visible and contains:

| Icon | Page | Purpose |
|------|------|---------|
| 🏠 | **Home** | Landing page with quick links |
| 📊 | **Dashboard** | KPIs, sales entry, charts, date filtering |
| 💰 | **Expenses** | Expense tracking & categorization |
| 📦 | **Products** | Inventory management |
| 📄 | **Reports** | Data export & summaries |
| ⚙️ | **Settings** | Theme, data export, about |

- Click any nav item to navigate.
- The active page is highlighted in teal (light mode) or neon green (dark mode).
- On mobile, tap the hamburger menu (☰) to reveal the nav drawer.
- Use the **sun/moon icon** on the far right to toggle between light and dark mode.

---

## Home Page (`/`)

The landing page that welcomes you and provides quick navigation cards.

### Features
- **Welcome Banner** — App name and one-line description.
- **Quick-Link Cards** — Four clickable cards that jump to Dashboard, Expenses, Products, and Reports.
- **Quick Start Guide** — A 4-step guide for new users.

### How to Use
1. Read the welcome message.
2. Click any card to jump directly to that module.
3. Or use the top navigation bar.

---

## Dashboard (`/dashboard`)

The command center of your store. View **date-filtered KPIs**, add/edit sales, and see trend charts — all in one place.

### Date Filter Bar (New!)

At the top-right of the Dashboard, next to the **"Add Sale"** button, you will find:

| Control | Description |
|---------|-------------|
| **📅 Dropdown** | Select: **Today** / **This Week** / **This Month** / **This Year** / **All Time** |
| **Start Date** | Pick a custom start date (optional) |
| **End Date** | Pick a custom end date (optional) |

> **How it works:** When you select a date range, **all 4 KPI cards**, the **charts**, and the **Recent Sales list** update instantly to show only data within that period.

### KPI Cards (Now Date-Filtered!)

| Card | Description |
|------|-------------|
| **Total Income** | Sum of sales revenue for the **selected date range** |
| **Total Expenses** | Sum of expenses for the **selected date range** |
| **Net Profit** | `Income − Expenses` for the **selected date range** |
| **Top Seller** | Product with highest sales for the **selected date range** |

> **Example:** Select "Today" and the cards show only today's income, expenses, profit, and top seller. Select a custom date range (e.g., Jan 1 to Jan 31) to see January's totals.

### Add / Edit Sale

1. Click the **"Add Sale"** button in the top-right.
2. A form appears with three fields:
   - **Product** — Dropdown of all products (shows current stock)
   - **Quantity** — Number of units sold
   - **Price** — Auto-fills with product price; editable
3. Click **"Add Sale"** to record.
4. Stock is automatically deducted from the product.

**To Edit a Sale:**
1. Scroll down to the **Recent Sales** table.
2. Hover over any sale row — edit (✏️) and delete (🗑️) icons appear.
3. Click **✏️ Edit** — the form reopens pre-filled.
4. Change values and click **"Update Sale"**.

### Recent Sales Table

- Shows the last 8 sales for the selected filter period.
- Displays running total: *"Showing X sales — Total: ₱Y"*

### Charts

| Chart | Description |
|-------|-------------|
| **Revenue Trend** | Line chart of daily revenue |
| **Top Products** | Bar chart of best-selling products (filtered by date) |
| **Expense Distribution** | Pie chart of expenses by category |

### Real-Time Behavior
- When a sale is added from any tab/device, Dashboard updates instantly.
- When an expense is added/edited/deleted, Total Expenses and Net Profit update instantly.

---

## Products (`/products`)

Manage your store's inventory. Track stock levels, sales per product, and receive low-stock alerts.

### Product List

**List View (default):** Table with columns:
- Name | Category | Price | Stock | Sold | Revenue | Status | Actions

**Grid View:** Card layout with visual stock indicators.

**Toggle between views** using the Grid (▦) / List (☰) buttons.

### Search
- Type in the **Search** box to filter by product name or category.
- Results update instantly as you type.

### Add a Product

1. Click **"Add Product"**.
2. Fill in all fields:
   - **Product Name** — e.g., "Rice (50kg sack)"
   - **Category** — Staples, Fresh, Frozen, Beverages, etc.
   - **Price (₱)** — Selling price per unit
   - **Stock** — Current quantity on hand
   - **Unit** — e.g., kg, pack, sack, tray, can
   - **Low Stock Threshold** — When stock hits this number, a warning appears
3. Click **"Add Product"**.

### Edit a Product

1. Click the **✏️ Edit** button on any product row/card.
2. The form opens pre-filled with current data.
3. Change any field and click **"Update Product"**.

### Delete a Product

1. Click the **🗑️ Delete** button.
2. Confirm the deletion in the browser dialog.
3. The product is permanently removed.

### Record a Sale (Quick-Sell)

1. Click the **🛒 Sell** button (grid view) or the cart icon (list view).
2. A modal appears showing:
   - Product name and price
   - Available stock
3. Enter the **Quantity Sold**.
4. If you try to sell more than available stock, an error toast appears.
5. Click **"Record Sale"** — stock is deducted and a sale is created.

### Low Stock Alerts

- Products with `stock ≤ lowStockThreshold` show:
  - A red **⚠️ Low Stock** badge in list view
  - A red warning triangle in grid view
  - Red stock numbers

### Real-Time Behavior
- When a sale is recorded from any page, product stock updates here instantly.
- When a product is added/edited/deleted from any tab, the list refreshes.

---

## Expenses (`/expenses`)

Track all business expenses by category. Add, edit, and delete expense records with full date filtering.

### Expense Table

Columns: Title | Category | Amount | Date | Actions

- **Title** — Description of the expense (e.g., "Monthly Rent", "Electricity Bill")
- **Category** — Color-coded badge (Supplies, Rent, Utilities, Transportation, Other)
- **Amount** — Shown in red (expense) with ₱ formatting
- **Date** — When the expense occurred
- **Actions** — ✏️ Edit | 🗑️ Delete

### Add an Expense

1. Click **"Add Expense"** in the top-right.
2. A modal appears with:
   - **Title / Description** — What the expense was for
   - **Category** — Select from dropdown
   - **Amount (₱)** — Must be greater than 0
   - **Date** — Defaults to today; editable
3. Click **"Add Expense"**.
4. A toast confirms: *"Expense added"*

### Edit an Expense

1. Click **✏️ Edit** on any expense row.
2. The modal opens with all fields pre-filled.
3. Change any value.
4. Click **"Update Expense"**.
5. Toast confirms: *"Expense updated"*

### Delete an Expense

1. Click **🗑️ Delete** on any row.
2. Confirm in the browser dialog.
3. Toast confirms: *"Expense deleted"*

### Expense Breakdown Chart

- A **pie chart** showing the percentage share of each expense category.
- Updates dynamically when you change the date filter.

### Date Filters

| Filter | Description |
|--------|-------------|
| **All Time** | Every expense ever recorded |
| **Today** | Expenses from today's date |
| **This Week** | Last 7 days |
| **This Month** | Last 30 days |
| **This Year** | Last 12 months |
| **Custom** | Select any start and end date |

> **Note:** The "Today" filter now works correctly regardless of your timezone. It matches your computer's local date.

### Real-Time Behavior
- Expenses added/edited/deleted from any tab update this page instantly.
- Dashboard's Total Expenses and Net Profit update simultaneously.

---

## Reports (`/reports`)

Generate financial summaries and export data for bookkeeping or tax purposes.

### Summary Cards

| Card | Description |
|------|-------------|
| **Total Revenue** | All sales income for the filtered period |
| **Total Expenses** | All expenses for the filtered period |
| **Net Profit** | `Revenue − Expenses` |
| **Transactions** | Total number of sales |

### Date Filters

Same filter bar as Expenses (Today / Week / Month / Year / Custom).
All summary cards, charts, and tables update reactively.

> **Note:** The "Today" filter now works correctly regardless of your timezone.

### Top Selling Products

- Ranked list of products by revenue.
- Shows rank (#1, #2...), product name, units sold, and total revenue.
- Updates with the selected date filter.

### Quick Stats

| Stat | Description |
|------|-------------|
| **Average Transaction Value** | Total revenue ÷ number of sales |
| **Profit Margin** | (Net profit ÷ Revenue) × 100 |
| **Total Products Sold** | Sum of all quantities sold |

### Period Summary Table

- Monthly breakdown of Revenue, Expenses, Profit, and Margin %.
- **Total row** at the bottom aggregates all periods.
- Updates with the selected date filter.

### Export Data

| Button | Function |
|--------|----------|
| **Import Excel** | Upload a CSV/Excel file to bulk-import data (placeholder) |
| **Export CSV** | Downloads a `.csv` file with the current period summary |
| **Export Excel** | Placeholder for `.xlsx` export |

### Real-Time Behavior
- Reports data updates automatically when sales or expenses change.
- No manual refresh needed.

---

## Analytics (`/analytics`)

Deep-dive visual analytics for business insights.

### Date Range Selector

- **Last 7 Days** | **Last 30 Days** | **Last 12 Months**
- Affects all charts on the page.

### Charts

| Chart | Type | Description |
|-------|------|-------------|
| **Revenue & Expenses Trend** | Line chart | Compares income vs. spending over time |
| **Top Selling Products** | Horizontal bar chart | Ranks products by total sales |
| **Expense Distribution** | Pie chart | Shows where money is going by category |

### Key Metrics Cards

| Metric | Description |
|--------|-------------|
| **Average Daily Sales** | Total revenue ÷ 30 days |
| **Profit Margin** | Percentage of revenue kept as profit |
| **Total Transactions** | Total number of sales recorded |

### How to Use
1. Select a date range from the dropdown.
2. Analyze trends in the line chart.
3. Identify best-sellers from the bar chart.
4. See expense breakdown from the pie chart.
5. Monitor KPI cards for high-level health.

---

## Settings (`/settings`)

Configure the application appearance and manage data.

### Appearance

#### Theme Mode
- Toggle between **Light** and **Dark** mode.
- Light mode: Warm beige background with teal accents.
- Dark mode: Charcoal background with neon green accents.
- Your preference is applied instantly across all pages.

#### Color Palette
- Visual reference showing the app's color scheme for both modes.

### Data Management

#### Export All Data
- Click **Export** to download all sales, expenses, and product data.
- Currently shows a confirmation dialog (CSV export implementation ready).

#### Clear All Data
- **⚠️ Destructive action.**
- Click **Clear** → Confirm in the dialog → All records are permanently deleted.
- Use with caution. There is no undo.

### About

| Field | Value |
|-------|-------|
| **Version** | 1.1.0 |
| **Application** | Sari-Sari Profit Tracker |
| **Purpose** | Manage Philippine retail store operations |

---

## Real-Time Sync

The system uses **WebSockets (Socket.io)** to synchronize data across all open browser tabs and devices connected to the same backend.

### What Updates Instantly?

| Action | Pages Affected |
|--------|---------------|
| Add a sale | Dashboard, Products, Reports, Analytics |
| Edit a sale | Dashboard, Products, Reports, Analytics |
| Delete a sale | Dashboard, Products, Reports, Analytics |
| Add a product | Dashboard, Products, Reports |
| Edit a product | Dashboard, Products |
| Delete a product | Dashboard, Products, Reports |
| Add an expense | Dashboard, Expenses, Reports, Analytics |
| Edit an expense | Dashboard, Expenses, Reports, Analytics |
| Delete an expense | Dashboard, Expenses, Reports, Analytics |

### How It Works
1. User A adds a sale in Tab 1.
2. Backend saves to SQLite database.
3. Backend emits `sale:created` event via WebSocket.
4. All connected clients (Tab 2, Tab 3, mobile, etc.) receive the event.
5. Each page automatically refetches its data.
6. Charts, tables, and KPI cards update without refreshing the browser.

---

## Keyboard Shortcuts & Tips

### General Tips
- **Toast Notifications** — Brief messages appear at the top-right for every action (success, error, warning). They auto-dismiss after a few seconds.
- **Confirm Dialogs** — Deletions always show a browser `confirm()` to prevent accidents.
- **Form Validation** — Required fields are marked; invalid submissions show error toasts.
- **Loading States** — Spinners appear while data loads; buttons disable during submission.

### Data Entry Best Practices
1. **Always set a low-stock threshold** when adding products — this enables automatic alerts.
2. **Use the date picker** when recording back-dated expenses or sales.
3. **Filter before exporting** — Reports CSV reflects the currently selected date range.
4. **Record sales from Products page** — The "Sell" button auto-fills product details and validates stock.
5. **Use Dashboard date filters** to quickly check today's or this week's performance without leaving the main view.

---

## Troubleshooting

### Page Shows Blank / White Screen
1. Open **Developer Tools** (F12) → **Console** tab.
2. Look for red error messages.
3. Check that the backend is running on `http://localhost:3001`.
4. Refresh the page (F5).

### "Failed to load expenses" Toast
- Backend may not be running. Start it with `cd backend && npm run dev`.
- Check that port 3001 is not in use by another application.

### "Today" Filter Shows No Data
- This was a timezone bug that has been fixed.
- If you still see no data, check that your computer's date is correct.
- Try re-seeding the database: `cd backend && npm run seed`

### Data Not Syncing Across Tabs
- Ensure both tabs are connected to the same backend URL.
- Check browser console for WebSocket connection errors.
- Try refreshing both tabs.

### Build Errors
```bash
# Clean install and rebuild
rm -rf node_modules dist backend/node_modules
npm install
cd backend && npm install
cd ..
npm run build
```

### Database Issues
```bash
# Re-seed the database (WARNING: resets all data to defaults)
cd backend
rm data.sqlite*
npm run seed
npm run dev
```

---

*End of User Manual — BorelaSari-Sari v1.1.0*
