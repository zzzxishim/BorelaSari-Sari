# Complete Deployment Guide: Vercel + Render

This is a detailed, step-by-step guide to deploy your Sari-Sari Store app to production.

**What we are deploying:**
- **Frontend** (React + Vite) → Vercel (free hosting)
- **Backend** (Node.js + Express + SQLite + Socket.io) → Render (free tier)

**Before you start:** Make sure your code is pushed to a GitHub repository.

---

# PART A: PRE-DEPLOYMENT CHECKLIST

Do these BEFORE going to any hosting website.

## Step 1: Push Code to GitHub

If you haven't already, push your project to GitHub:

```bash
# From your project root (c:/Users/LLED/Downloads/BorelaSari-Sari)
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
# Create a new repo on https://github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

**Verify:** Go to `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME` and confirm all files are there, including:
- `backend/` folder
- `src/` folder
- `vercel.json`
- `render.yaml`
- `.gitignore`

---

# PART B: DEPLOY BACKEND TO RENDER

## Step 2: Create a Render Account

1. Open your browser and go to **https://render.com**
2. Click the **"Get Started for Free"** button (usually purple)
3. Click **"Continue with GitHub"**
4. Authorize Render to access your GitHub account
5. You will land on the Render Dashboard

## Step 3: Create a New Web Service on Render

1. On the Render Dashboard, click the big **"New +"** button (top right)
2. From the dropdown, click **"Web Service"**
3. You will see a list of your GitHub repositories
4. Find and click your repository name (e.g., `YOUR_REPO_NAME`)
5. Click **"Connect"**

## Step 4: Configure the Web Service

You will see a form. Fill in EXACTLY as follows:

| Field | What to Enter |
|-------|---------------|
| **Name** | `sari-sari-backend` (or any name you want) |
| **Region** | `Oregon (US West)` (recommended, or closest to you) |
| **Branch** | `main` |
| **Root Directory** | `backend` ← VERY IMPORTANT |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Select **"Free"** |

**Advanced Settings:**
- Click **"Advanced"** to expand
- Leave everything default

Now click the **"Create Web Service"** button at the bottom.

## Step 5: Wait for First Deploy

- Render will start building your backend. This takes 2-3 minutes.
- You will see logs streaming in the dashboard.
- Wait until you see a green checkmark and **"Your service is live"** message.

**IMPORTANT:** The first deploy may fail because the database isn't seeded yet. That's OK — we will fix it in the next steps.

## Step 6: Add Environment Variables on Render

1. On your service page, click the **"Environment"** tab (next to Logs)
2. Click **"Add Environment Variable"**
3. Add these two variables one by one:

**First variable:**
- Key: `PORT`
- Value: `10000`
- Click **"Add"**

**Second variable:**
- Key: `CORS_ORIGIN`
- Value: `*` (we will update this later after Vercel deploy)
- Click **"Add"**

4. After adding both, scroll down and click **"Save Changes"**
5. Render will automatically redeploy with the new environment variables

## Step 7: Seed the Database on Render

The database starts empty. We need to add the starter data.

1. On your service page, click the **"Shell"** tab
2. You will see a terminal interface
3. Run this command exactly:

```bash
node dist/seed.js
```

4. You should see output: `Database seeded successfully!`
5. If you get "module not found" error, run this first:

```bash
npm install && npm run build
```

Then run the seed command again.

## Step 8: Test Your Backend URL

1. On your service page, look at the top — you will see a URL like:
   ```
   https://sari-sari-backend-xxxxx.onrender.com
   ```
2. Click it or open in a new tab
3. You should see a blank page (that's normal — there's no frontend at this URL)
4. Test the API by adding `/api/products` to the URL:
   ```
   https://sari-sari-backend-xxxxx.onrender.com/api/products
   ```
5. You should see JSON data with your products. If you see data, your backend is LIVE!

**WRITE DOWN THIS URL.** You will need it for the frontend.

---

# PART C: DEPLOY FRONTEND TO VERCEL

## Step 9: Create a Vercel Account

1. Open your browser and go to **https://vercel.com**
2. Click **"Get Started"**
3. Click **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. You will land on the Vercel Dashboard

## Step 10: Import Your Repository

1. On the Vercel Dashboard, click **"Add New Project"** (big button)
2. You will see a list of your GitHub repositories
3. Find and click **"Import"** next to your repository name
4. Vercel will auto-detect your framework (should say "Vite")

## Step 11: Configure Build Settings

You will see a form. Verify these settings:

| Field | Should Say |
|-------|------------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `./` (leave as default) |
| **Build Command** | `npm run build` (auto-filled) |
| **Output Directory** | `dist` (auto-filled) |
| **Install Command** | `npm install` (auto-filled) |

## Step 12: Add Environment Variables on Vercel

Before clicking Deploy, you MUST add environment variables.

1. Scroll down to **"Environment Variables"**
2. Click **"Add"** to add each variable:

**First variable:**
- Name: `VITE_API_URL`
- Value: `https://YOUR-BACKEND-URL.onrender.com/api`
  - Replace `YOUR-BACKEND-URL` with your actual Render URL from Step 8
  - **MUST end with `/api`**
- Click **"Add"**

**Second variable:**
- Name: `VITE_SOCKET_URL`
- Value: `https://YOUR-BACKEND-URL.onrender.com`
  - Replace `YOUR-BACKEND-URL` with your actual Render URL
  - **NO `/api` at the end**
- Click **"Add"**

**Example with a real URL:**
- `VITE_API_URL` = `https://sari-sari-backend-abc123.onrender.com/api`
- `VITE_SOCKET_URL` = `https://sari-sari-backend-abc123.onrender.com`

## Step 13: Deploy Frontend

1. Scroll down and click the **"Deploy"** button
2. Vercel will build your frontend. This takes 1-2 minutes.
3. Wait for the green checkmark and "Congratulations!" message
4. You will see your frontend URL:
   ```
   https://your-project-name.vercel.app
   ```

**WRITE DOWN THIS URL.**

## Step 14: Update CORS on Render (CRITICAL)

Your frontend needs permission to talk to your backend. This is a security feature called CORS.

1. Go back to Render Dashboard: https://dashboard.render.com
2. Click your `sari-sari-backend` service
3. Click the **"Environment"** tab
4. Find `CORS_ORIGIN`
5. Click the pencil icon to edit it
6. Change the value from `*` to your EXACT Vercel URL:
   ```
   https://your-project-name.vercel.app
   ```
7. Click **"Save Changes"**
8. Render will redeploy automatically (takes ~1 minute)

**Why this matters:** Without this, your browser will block API calls with a CORS error.

---

# PART D: VERIFY EVERYTHING WORKS

## Step 15: Open Your Live App

1. Open your Vercel URL in a browser:
   ```
   https://your-project-name.vercel.app
   ```

2. You should see your Sari-Sari Store homepage

## Step 16: Test Each Page

### Test Products Page
1. Click **"Products"** in the sidebar
2. You should see the 12 seeded products
3. Try adding a new product:
   - Click **"Add Product"**
   - Fill in: Name = `Test Product`, Category = `Staples`, Price = `100`, Stock = `50`, Unit = `pc`, Threshold = `10`
   - Click **"Add Product"**
4. The product should appear in the list

### Test Sales Page
1. Click **"Sales"** in the sidebar
2. You should see the 8 seeded sales
3. Try adding a sale:
   - Click **"Add Sale"**
   - Select any product
   - Quantity = `2`
   - Price auto-fills
   - Click **"Add Sale"**
4. The sale should appear AND the product stock should decrease

### Test Expenses Page
1. Click **"Expenses"** in the sidebar
2. You should see the 4 seeded expenses
3. Try adding an expense:
   - Click **"Add Expense"**
   - Category = `Supplies`
   - Amount = `500`
   - Description = `Test expense`
   - Click **"Add Expense"**

### Test Dashboard
1. Click **"Dashboard"** in the sidebar
2. You should see:
   - Total Income (sum of all sales)
   - Total Expenses (sum of all expenses)
   - Net Profit (income minus expenses)
   - Top Seller product
   - Revenue chart
   - Recent sales list

## Step 17: Test Real-Time Sync

This is the coolest feature — multiple users see updates instantly.

1. Open your Vercel URL in **Chrome**
2. Open the SAME URL in **Firefox** (or an Incognito window)
3. In Chrome, go to **Sales** and add a new sale
4. In Firefox, watch the Sales page — the new sale appears **automatically** without refreshing!
5. Try the same with adding a product or expense

If real-time sync works, your Socket.io is configured correctly.

---

# PART E: TROUBLESHOOTING

## Problem: "CORS Error" in Browser Console

**Symptom:** Console shows `Access-Control-Allow-Origin` errors
**Fix:**
1. Go to Render Dashboard → Environment
2. Make sure `CORS_ORIGIN` is exactly your Vercel URL
3. NOT `*` (must be exact match for production)
4. Redeploy and hard-refresh browser (Ctrl+F5)

## Problem: "API 404 Not Found"

**Symptom:** Pages show no data, network tab shows 404
**Fix:**
1. Check `VITE_API_URL` in Vercel
2. MUST end with `/api`
3. Example: `https://backend.onrender.com/api` ✓
4. Wrong: `https://backend.onrender.com` ✗ (missing `/api`)

## Problem: "Socket Connection Failed"

**Symptom:** Real-time sync doesn't work
**Fix:**
1. Check `VITE_SOCKET_URL` in Vercel
2. Must NOT have `/api` at the end
3. Example: `https://backend.onrender.com` ✓
4. Wrong: `https://backend.onrender.com/api` ✗

## Problem: "Database is Empty"

**Symptom:** No products, sales, or expenses show up
**Fix:**
1. Go to Render → Shell
2. Run: `node dist/seed.js`
3. If that fails, run: `npm run build && node dist/seed.js`

## Problem: "Build Failed" on Vercel

**Symptom:** Vercel shows red X on deploy
**Fix:**
1. Check Vercel logs (click the failed deploy)
2. Common fix: Make sure `vercel.json` is in your repo:
   ```json
   {
     "framework": "vite",
     "buildCommand": "npm run build",
     "outputDirectory": "dist"
   }
   ```

## Problem: "Page Not Found" on Vercel Refresh

**Symptom:** Refreshing a page like `/products` shows 404
**Fix:** This is already handled by `vercel.json` rewrites. If not working, add this to `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

# PART F: MAINTENANCE

## Restart Backend After Code Changes

If you update backend code:
1. Push changes to GitHub
2. Render auto-deploys (wait 2-3 minutes)
3. If database changes, re-seed: `node dist/seed.js`

## Restart Frontend After Code Changes

If you update frontend code:
1. Push changes to GitHub
2. Vercel auto-deploys (wait 1 minute)

## Backup Your Database

Your data lives in `data.sqlite` on Render. To backup:

1. Render Dashboard → Shell
2. Run:
   ```bash
   cat data.sqlite | base64 > backup.txt
   ```
3. Or use Render's "Files" feature to download

## Free Tier Limitations

| Limit | What it means |
|-------|---------------|
| Render sleeps after 15 min | First request after idle takes ~30 seconds |
| Vercel free = unlimited | Static sites have no limits |
| SQLite on Render | Data persists across deploys, but backup regularly |

To avoid the "sleep" delay, upgrade Render to Starter ($7/mo) or ping your backend every 10 minutes with a cron job.

---

# QUICK REFERENCE

| What | URL |
|------|-----|
| Your Frontend | `https://your-project.vercel.app` |
| Your Backend | `https://sari-sari-backend-xxxxx.onrender.com` |
| API Test | `https://sari-sari-backend-xxxxx.onrender.com/api/products` |
| Render Dashboard | https://dashboard.render.com |
| Vercel Dashboard | https://vercel.com/dashboard |

---

Deploy and enjoy your live Sari-Sari Store!

