# Data Storage Limits & Capacity

## Short Answer

**You can store YEARS of sari-sari store data and still be under 50MB.** There is no 100MB limit. SQLite can handle gigabytes, but for your store data you'll never come close.

---

## SQLite Database Limits

SQLite itself has **no practical limit** for a store like yours:

| Metric | SQLite Limit | Your Realistic Usage |
|--------|-------------|---------------------|
| **Max database size** | 281 TB (terabytes) | You'll use ~10-50 MB |
| **Max tables** | 2 billion | You have 3 tables |
| **Max rows per table** | 18 quintillion | You'll have ~10,000-100,000 |
| **Max row size** | 1 GB | Your rows are ~100 bytes |

**Translation: SQLite will NEVER be your bottleneck.**

---

## Real-World Estimate for Your Store

Let's calculate how much data a busy sari-sari store generates:

### Data Size Per Record

| Record Type | Size Each |
|-------------|-----------|
| Product | ~100 bytes |
| Sale | ~150 bytes |
| Expense | ~120 bytes |

### 5 Years of Busy Store Data

| Time Period | Products | Sales | Expenses | Total Size |
|-------------|----------|-------|----------|------------|
| **Year 1** | 50 | 5,000 | 200 | ~1 MB |
| **Year 2** | 80 | 10,000 | 400 | ~2 MB |
| **Year 3** | 100 | 15,000 | 600 | ~3 MB |
| **Year 4** | 120 | 20,000 | 800 | ~4 MB |
| **Year 5** | 150 | 25,000 | 1,000 | ~5 MB |

**After 5 heavy years: approximately 5-10 MB total.**

That's smaller than a single photo on your phone.

---

## Render Free Tier Storage

| Limit | What It Means |
|-------|--------------|
| **Disk Space** | No explicit size limit on the free tier |
| **Data Persistence** | Survives restarts, survives deploys |
| **Data Loss Risk** | ONLY if you delete the service entirely |
| **Sleep Timeout** | After 15 min idle, takes 30s to wake up (data still there) |

**Important:** Render's free tier web service keeps your SQLite file on disk. It won't disappear randomly. Only if you manually delete the service.

---

## When Would You Need More?

You'd only need to upgrade if:

| Scenario | Solution |
|----------|----------|
| You're adding product PHOTOS | Use Cloudinary (free) or AWS S3 for images |
| 10+ years of data with 100,000+ sales | Still fine on SQLite! |
| Multiple stores/locations | Upgrade to Postgres ($7/mo on Render) |
| You accidentally delete the Render service | This deletes data — keep backups |
| Need 99.99% uptime | Upgrade to Render Starter ($7/mo) |

---

## Backup Your Data (Important!)

Since you're on the free tier, here's how to protect your data:

### Option 1: Download the SQLite File
1. Render Dashboard → your service → "Files" tab (if available)
2. Download `data.sqlite`

### Option 2: Add a Backup API Endpoint
Add this to your backend (`backend/src/server.ts` before the listen line):

```typescript
// Backup endpoint — download your database
app.get('/api/backup', (_req, res) => {
  const dbPath = path.join(__dirname, '../data.sqlite');
  res.download(dbPath, `backup-${new Date().toISOString().split('T')[0]}.sqlite`);
});
```

Then visit: `https://your-backend.onrender.com/api/backup` to download your database anytime.

### Option 3: Automated Daily Backup (Free)
Use a free cron service like cron-job.org to hit your backup URL daily.

---

## Summary

| Question | Answer |
|----------|--------|
| Is there a 100MB limit? | **NO.** |
| How much can I store? | **As much as you want.** SQLite handles it. |
| Will my data disappear? | **NO**, unless you delete the Render service. |
| Do I need to upgrade? | **NO**, not for years of store data. |
| Should I backup? | **YES**, monthly or weekly downloads recommended. |

---

## Bottom Line

For a sari-sari store:
- **50 products** × years = tiny
- **10,000 sales** × years = tiny  
- **1,000 expenses** × years = tiny

**Your database in 10 years will probably be under 20MB.**

The free tier is more than enough. Focus on growing your store, not database limits!

---

## Need Even More Security?

If you want your data in a "real" cloud database (not a file), the cheapest upgrade is:

**Render PostgreSQL — Free Tier ($0)**
- 1 GB storage
- 10 simultaneous connections
- Automatic backups
- Upgrade from SQLite to Postgres when you're ready

Switching to Postgres later is easy — just change the database connection string.

