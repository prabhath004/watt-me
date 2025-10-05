# 👤 User Live Dashboard - Complete Guide

## 🎉 User Dashboard is Now LIVE!

Your user dashboard now connects to the **live simulator** and shows real-time energy data for your specific home!

---

## 🚀 How to Access

### **Step 1: Open Your Browser**
```
http://localhost:8080
```

### **Step 2: Login as a User**

**Option A: Use the Login Page**
1. Click "User Login" or go to: `http://localhost:8080/login/user`
2. Enter any credentials:
   - **Email:** `user@demo.com`
   - **Password:** `demo123`
   - **Home ID:** `H001` (or any from H001-H020)
3. Click "Login"

**Option B: Quick Access (if already logged in)**
```
http://localhost:8080/app/live
```

---

## 📊 What You'll See

### **1. Live Status Cards (Top Row)**

**Solar Production**
- 🟡 Current solar power generation
- Updates every 0.5 seconds
- Shows "Generating power" or "No sunlight"

**Consumption**
- 🟠 Current home load
- Real-time usage tracking
- Always updating

**Net Flow**
- 🟢 Green if surplus (producing more than consuming)
- 🔴 Red if deficit (consuming more than producing)
- Shows exact +/- kW value

---

### **2. Battery Status Card**

**Visual Display:**
- Large progress bar showing SOC %
- Color-coded: 
  - Green: >60%
  - Yellow: 30-60%
  - Red: <30%
- Badge showing "Charging" or "Discharging"

**Details:**
- Current SOC percentage
- Battery capacity (kWh)
- Current energy stored

---

### **3. Community Sharing Status**

**Two Cards:**

**Sharing with Community (Green)**
- Shows when YOU are helping neighbors
- Displays kW being shared
- Shows credits earned per tick
- Message: "You're helping your neighbors! 🌟"

**Receiving from Community (Blue)**
- Shows when NEIGHBORS are helping you
- Displays kW being received
- Shows credits used per tick
- Message: "Your neighbors are helping you! 💙"

---

### **4. Grid Interaction Card**

Shows when you're:
- **Importing** (red) - Pulling from utility grid
- **Exporting** (blue) - Sending surplus to grid

Only appears when active!

---

### **5. Live Energy Chart** 📊

**The Main Feature!**

**Three Lines:**
1. 🟡 **Solar** (Yellow area) - Your solar production
2. 🔴 **Consumption** (Red area) - Your home load
3. 🟣 **Battery** (Purple line, right axis) - Battery SOC %

**Features:**
- ✅ Updates every 0.5 seconds
- ✅ Shows last 60 data points (30 seconds of history)
- ✅ Auto-scrolling timeline
- ✅ Dual Y-axis (kW on left, SOC% on right)
- ✅ Beautiful gradient fills
- ✅ Interactive hover tooltips

**What to Look For:**
- When solar > consumption: Battery charging, may share excess
- When consumption > solar: Battery discharging, may need grid
- Battery line shows SOC changing in real-time

---

### **6. Fair-Rate Credits**

**Three Metrics:**
- **Credits Balance**: Your current credit balance (kWh)
- **Fair Rate**: 18¢/kWh (community rate)
- **This Tick**: $ earned or spent this moment

**Understanding Credits:**
- Positive (+): You're a net producer, earning credits
- Negative (-): You're a net consumer, using credits
- Changes in real-time as you share/receive

---

## 🎮 Live Simulation Features

### **What Happens Over Time**

**Morning (6-8 AM):**
- Solar starts rising
- Consumption high (morning activities)
- Battery charging begins
- May receive from neighbors

**Midday (10 AM - 2 PM):**
- Solar at peak
- Consumption moderate
- Battery fully charged
- Likely sharing with community or exporting to grid

**Evening (6-9 PM):**
- Solar declining
- Consumption spikes (dinner, lights, devices)
- Battery discharging
- May need from community or grid

**Night (10 PM - 5 AM):**
- Zero solar production
- Low consumption (baseline load)
- Battery slowly discharging
- Minimal grid interaction

---

## 📈 Chart Interpretation

### **Scenario 1: Sunny Day**
```
Solar (yellow) peaks above consumption (red)
→ Battery charges
→ SOC (purple) rises to 90%
→ Excess shared with community
```

### **Scenario 2: Cloudy/Night**
```
Solar (yellow) drops to zero
→ Consumption (red) continues
→ Battery (purple) discharges
→ SOC drops over time
```

### **Scenario 3: High Usage**
```
Consumption (red) spikes above solar (yellow)
→ Battery discharges faster
→ May receive from community (blue card appears)
→ Or import from grid (red card appears)
```

---

## 🎯 Features You Can Try

### **1. Watch Battery Behavior**
- Morning: Watch SOC rise as solar charges it
- Evening: Watch SOC fall as you use stored energy

### **2. Monitor Community Sharing**
- Green card appears when you share
- Blue card appears when you receive
- See exact kW flows

### **3. Track Credits**
- Earn credits when sharing
- Spend credits when receiving
- Balance updates in real-time

### **4. View Different Homes**
Logout and login with different home IDs to see varied patterns:
- `H001` - Large solar (8 kW), big battery
- `H009` - Small solar (3.5 kW), high consumption
- `H018` - Large producer
- `H006` - Net consumer

---

## 🔍 Understanding Your Home's Role

### **Net Producer Homes**
- More solar than typical consumption
- Often sharing with community
- Positive credit balance
- Examples: H001, H002, H003, H008, H018

**What you'll see:**
- Green "Sharing" cards frequently
- Battery stays high (80-90%)
- Grid export during peak sun

### **Net Consumer Homes**
- Higher consumption relative to solar
- Often receiving from community
- Negative or neutral credits
- Examples: H004, H006, H007, H009, H019

**What you'll see:**
- Blue "Receiving" cards frequently
- Battery used more heavily
- Grid import during peak usage

---

## 🎨 UI Elements Explained

### **Badge Colors**
- 🟢 **Green "LIVE"**: Connected to simulator
- ⚫ **Gray "Offline"**: Connection lost

### **Card Borders**
- Green border: Sharing active
- Blue border: Receiving active
- No border: Self-sufficient or using battery

### **Number Colors**
- Yellow: Solar production
- Orange: Consumption
- Green: Surplus/earning credits
- Red: Deficit/using credits
- Purple: Battery SOC
- Blue: Grid export
- Red: Grid import

---

## 📱 Responsive Design

The dashboard works perfectly on:
- 💻 **Desktop**: All cards in grid layout
- 📱 **Tablet**: 2-column grid
- 📱 **Mobile**: Single column, scrollable

---

## 🎭 Demo Scenarios

### **Try These from Admin Dashboard:**

**1. Trigger Cloudburst** (from `/admin/live`)
- Your solar production will DROP to 40%
- Chart will show yellow line dropping
- Battery may start discharging
- You might start receiving from community

**2. Trigger Heatwave**
- Your consumption will INCREASE by 15%
- Red line rises on chart
- Battery drains faster
- More grid import needed

**3. Trigger EV Surge** (evening only)
- Extra 3 kW load added
- Massive consumption spike
- Battery discharges rapidly
- Community sharing or grid import kicks in

**4. Trigger Outage**
- No grid import/export available
- Completely autonomous
- Battery is your only backup
- Unserved load if battery depleted

---

## 🔧 Customization

### **Change Your Home**

Just logout and login with a different Home ID:
- H001-H010: Original 10 homes (from CSV data)
- H011-H020: Live simulator homes

### **See Real-Time Updates**

The simulator is running continuously, so:
- Leave the page open
- Watch numbers change every 0.5 seconds
- See the chart grow in real-time
- Monitor your battery SOC

---

## 💡 Understanding the Data

### **What "Share" Means**
- You have excess solar after:
  1. Covering your own load
  2. Charging your battery
  3. Exporting to grid (if allowed)
- Community members in deficit receive your excess
- You earn fair-rate credits (18¢/kWh)

### **What "Receive" Means**
- You need more power than you have:
  1. Solar + Battery not enough
  2. Before importing from grid
- Community members with surplus help you
- You spend fair-rate credits (18¢/kWh)

### **Credits are Zero-Sum**
- Total credits in community = 0 always
- Your gain = someone else's contribution
- Your use = someone else's earning
- Fair and balanced!

---

## 🎊 Success Indicators

**Your dashboard is working if you see:**

✅ 🟢 **"LIVE" badge** in top right  
✅ **Numbers updating** every 0.5 seconds  
✅ **Chart growing** with new data points  
✅ **Battery SOC changing** as sun/load varies  
✅ **Cards appearing/disappearing** based on activity  
✅ **Smooth animations** on all elements  

---

## 🐛 Troubleshooting

### "Connection lost" Error

**Cause:** Backend simulator not running

**Fix:**
```bash
cd simulator-backend
npm run dev
```

### "Offline" Badge

**Cause:** SSE connection failed

**Fix:**
1. Check simulator is running at http://localhost:3001
2. Test: `curl http://localhost:3001/stream`
3. Refresh browser page

### No Data Showing

**Cause:** Wrong home ID

**Fix:**
- Make sure you logged in with H001-H020
- Default is H001 if not specified

### Chart Not Updating

**Cause:** Browser cache or SSE blocked

**Fix:**
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
- Clear browser cache
- Try different browser

---

## 🎯 Quick Test Checklist

After opening the dashboard, verify:

- [ ] "LIVE" badge is green
- [ ] Solar and Consumption numbers are showing
- [ ] Battery SOC is between 0-100%
- [ ] Chart has at least a few data points
- [ ] Numbers change every 0.5 seconds
- [ ] Chart scrolls as new data arrives
- [ ] Sharing/Receiving cards appear when active

---

## 🚀 You're All Set!

**Open your user dashboard now:**

```
http://localhost:8080/login/user
```

**Login with:**
- Home ID: `H001` (or any H001-H020)
- Email/Password: anything

**You'll see your home's live energy data streaming in real-time!** 🎉

---

## 📚 Related Guides

- [IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md) - Technical details
- [HOW_I_BUILT_IT.md](./HOW_I_BUILT_IT.md) - Implementation process
- [GRAPH_FEATURES.md](./GRAPH_FEATURES.md) - Chart features
- [LIVE_SIMULATOR_GUIDE.md](./LIVE_SIMULATOR_GUIDE.md) - Backend simulator

---

**Your personal home energy dashboard is now fully operational!** 🏠⚡

