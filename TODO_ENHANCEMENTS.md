# Enhancement Implementation TODO

## Backend Changes
- [x] Update sales.ts route: Add PUT /:id (edit sale), add date filtering to GET
- [x] Add stock validation: Cannot sell more than available stock
- [x] Improve GET /sales with query params: startDate, endDate, productId

## Frontend Changes
### UnifiedDashboard.tsx
- [x] Add Calendar Filter component (date/month/year/custom)
- [x] Add Edit Sale functionality with modal
- [x] Make Recent Sales reactive to date filter
- [x] Update KPI cards and summary based on filter

### Products.tsx
- [x] Add Search Bar (name/category filtering)
- [x] Add "Record Sale" button per product with modal
- [x] Stock validation before sale

### Sales.tsx
- [x] Add Edit Sale modal
- [x] Add Delete Sale button
- [x] Improve filtering with calendar (Today/Week/Month/All/Custom)

### Reports.tsx
- [x] Add filter controls (Today/Week/Month/Year/Custom)
- [x] Add calendar picker for custom range
- [x] Dynamic summary cards (Revenue, Expenses, Profit, Transactions)
- [x] Top products section

## Shared Components
- [x] Add toast notifications (use existing sonner)
- [x] ToastProvider component created and integrated in App.tsx

## State Management
- [x] Ensure automatic refetch after mutations via Socket.io
- [x] Add loading states to all pages

