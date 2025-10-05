# 🚀 Quick Start - View Admin Dashboard

## Step 1: Server is Running! ✅

The development server should now be running at:
**http://localhost:8080** (or the port shown in your terminal)

## Step 2: Access the Dashboard

### Option A: Mock Login (Fastest)

1. **Open your browser**: http://localhost:8080
2. **Click "Admin Login"** or navigate to: http://localhost:8080/login/admin
3. **Enter any credentials** (the mock auth accepts anything)
   - Username: `admin`
   - Password: `admin123`
4. **Click "Login"**
5. **You'll see the Admin landing page** with a "Community Dashboard" card
6. **Click "View Community Dashboard"** button
7. **🎉 You should now see the full dashboard with:**
   - 3 KPI cards at the top
   - Hour selector with slider
   - Energy routing table
   - Community trend chart
   - Home snapshot table with all 10 homes

### Option B: Direct URL

If you're already logged in, go directly to:
**http://localhost:8080/admin/community**

## Step 3: Explore the Dashboard

### What You'll See:

**KPI Cards:**
- Total Production: ~1,776 kWh
- Microgrid Shared: ~4.0 kWh
- Grid Import: ~202 kWh

**Hour Selector:**
- Use the slider or dropdown to select different hours
- The routing table below updates in real-time
- Default: Hour with microgrid activity (around 9 AM)

**Routing Table:**
- Shows which homes are sending energy to which homes
- Example: H001 → H003: 0.140 kWh
- If you see "No local routing", try selecting morning hours (7-10 AM)

**Trend Chart:**
- Yellow line: Solar production (peaks at noon)
- Green line: Microgrid sharing (local energy)
- Blue line: Grid import (external utility)
- See clear day/night cycles!

**Home Snapshots:**
- All 10 homes (H001-H010)
- Battery SOC with colored progress bars
- Credits balance (green = surplus, red = deficit)
- Net period kWh for the 5-day simulation

## Step 4: Refresh Data (Optional)

Want to generate new data with different parameters?

```bash
# In a new terminal (keep the dev server running):
cd /Users/himeshduddala/Downloads/neighbor-grid-flow
./run_generate_community_data.sh --days 7 --start 2025-10-15

# Then refresh your browser to see the new data
```

## Troubleshooting

### "Cannot GET /admin/community"
- Make sure you're logged in first
- Go to http://localhost:8080/login/admin and login
- Then navigate to the community dashboard

### "Failed to fetch community data"
- The CSV files should be at: `public/data/community_*.csv`
- Check if they exist: `ls public/data/`
- If missing, regenerate: `./run_generate_community_data.sh --days 5`

### Page is blank
- Check browser console (F12) for errors
- Make sure the dev server is running (check terminal)
- Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### Port already in use
- The server might be on a different port
- Check your terminal output for the actual URL
- It might say: "Local: http://localhost:5173"

## Features to Try

1. **Hour Selection**: Use the slider to scrub through all 120 hours
2. **Find Peak Activity**: Look for hours 9-10 AM for most routing activity
3. **Night vs Day**: Compare midnight (no solar) vs noon (peak solar)
4. **Home Comparison**: See which homes are net producers vs consumers
5. **Trend Analysis**: Watch how production follows the sun across days

## Next Steps

- Read [ADMIN_DASHBOARD_GUIDE.md](./ADMIN_DASHBOARD_GUIDE.md) for detailed features
- Experiment with different simulation parameters
- Try modifying the community configuration in `neighborgrid/src/run_multi.py`
- Add your own custom features!

---

**Enjoy exploring the NeighborGrid Community Dashboard!** 🎉

