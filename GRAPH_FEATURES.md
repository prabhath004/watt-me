# 📊 Graph Visualization Features

## ✨ Enhanced Community Trend Chart - Now Live!

Your admin dashboard now features a **fully interactive, professional-grade energy visualization chart** with multiple view modes!

---

## 🎨 What You'll See

### **Location in Dashboard**
Navigate to: **Admin → Community Dashboard** → Scroll to the **"Community Energy Trends"** section

### **Chart Features**

#### 🔹 **Dual View Modes**

**1. Line Chart Mode (Default)**
- Clean, precise line visualization
- **Yellow Line**: Solar Production (peaks at noon)
- **Green Line**: Microgrid Sharing (local energy exchange)
- **Blue Line**: Grid Import (utility usage)
- Perfect for identifying trends and patterns
- Hover on lines to see exact values

**2. Area Chart Mode**
- Beautiful gradient-filled areas
- Stacked visualization showing energy proportions
- Color-coded with semi-transparent gradients
- Better for understanding total energy volumes
- Click the "Area" button to switch

#### 🔹 **Interactive Elements**

**Toggle Buttons (Top Right)**
- 📈 **Line Button**: Switch to line chart
- 📊 **Area Button**: Switch to area/gradient chart

**Hover Tooltips**
- Shows exact timestamp (date + time)
- All three values displayed with color dots
- Formatted as: `Production: 45.20 kWh`

**Legend**
- Click legend items to show/hide lines
- Useful for focusing on specific metrics

#### 🔹 **Summary Stats**

Below the chart, you'll see three color-coded totals:
- **Yellow Number**: Total Production across all hours
- **Green Number**: Total Microgrid Shared
- **Blue Number**: Total Grid Import

---

## 🎨 Color Scheme

| Metric | Color | Meaning |
|--------|-------|---------|
| **Production** | 🟡 Warm Yellow | Solar energy generated |
| **Microgrid** | 🟢 Green | Locally shared energy |
| **Grid Import** | 🔵 Blue | External utility usage |

---

## 📈 What the Graph Shows

### **Daily Patterns You'll Notice:**

1. **Sunrise (6-8 AM)**
   - Production line starts rising
   - Grid import still high (morning usage)
   - Microgrid sharing begins

2. **Midday (10 AM - 2 PM)**
   - Production peaks (yellow line highest)
   - Grid import drops to minimum
   - Some microgrid activity from diverse orientations

3. **Evening (5-8 PM)**
   - Production drops sharply
   - Grid import spikes (peak demand)
   - Microgrid helps reduce grid dependency

4. **Night (10 PM - 5 AM)**
   - Zero production (flat yellow line)
   - Minimal grid import (low usage)
   - Batteries discharging

### **Multi-Day View**
- You'll see 5 repeating daily cycles
- Each day slightly different due to random variations
- Clear day/night rhythm

---

## 🎯 How to Use the Graph

### **Find Peak Solar Hours**
Look for the highest point on the yellow line (usually around noon)

### **Identify Grid Dependency**
Blue line shows when you're pulling from utility grid

### **See Community Sharing Success**
Green line shows when neighbors are helping neighbors

### **Compare Days**
Scrub across the X-axis to see how patterns repeat

### **Switch Views**
- Use **Line mode** for precise analysis
- Use **Area mode** for visual impact

---

## 🚀 Interactive Features

### **1. Switch Chart Types**
```
Top right corner buttons:
[Line] [Area]
```
Click to toggle between views instantly!

### **2. Hover for Details**
Move your mouse over any point on the chart to see:
- Exact timestamp
- Precise kWh values
- Color-coded metric labels

### **3. Read Summary Stats**
Below the chart, three large numbers show totals:
- Quick overview without analyzing the graph
- Color-matched to chart lines

---

## 🎨 Technical Details

### **Built With**
- **Recharts**: Industry-standard React charting library
- **Responsive Design**: Auto-adjusts to screen size
- **Custom Tooltips**: Themed to match your dashboard
- **Gradient Fills**: Beautiful area chart styling

### **Data Points**
- **120 hours** of data (5 days × 24 hours)
- **10 homes** aggregated per hour
- Updates in real-time as you change data

### **Chart Dimensions**
- Height: 400px
- Width: 100% responsive
- Margins optimized for labels

---

## 🔧 Customization Options

Want to modify the chart? Here are key settings in `CommunityTrendChart.tsx`:

```typescript
// Chart height
height={400}

// Line thickness
strokeWidth={2.5}

// Show/hide dots on lines
dot={false}

// Colors
Production: "hsl(45 93% 58%)"  // Yellow
Microgrid: "hsl(158 74% 40%)"  // Green
Grid Import: "hsl(218 100% 62%)" // Blue
```

---

## 📊 Example Insights You Can Derive

### **Community Performance**
- "We shared 4 kWh locally, avoiding grid import"
- "Peak production reached 80 kWh at noon"
- "Grid import reduced by 22% during day"

### **Solar Effectiveness**
- "East-facing panels peak at 10 AM"
- "West-facing panels peak at 2 PM"
- "South-facing panels peak at noon"

### **Optimization Opportunities**
- "High grid import at 6 PM → add batteries"
- "Low microgrid sharing → adjust timing"
- "Excess production at noon → add storage"

---

## 🎉 What Makes This Special

✨ **Professional Quality**: Enterprise-grade visualization  
✨ **Interactive**: Responds to user input instantly  
✨ **Beautiful**: Gradient fills, smooth animations  
✨ **Informative**: Multiple data streams in one view  
✨ **Responsive**: Works on mobile, tablet, desktop  
✨ **Accessible**: Color-blind friendly palette  

---

## 🚀 Next Steps

1. **Open the dashboard** at http://localhost:8080/admin/community
2. **Scroll to the chart** (below the routing table)
3. **Try both view modes** (Line and Area)
4. **Hover over the lines** to see exact values
5. **Analyze the patterns** to understand your community's energy flow

---

## 💡 Pro Tips

- **Best View**: Use Line mode for precise analysis, Area mode for presentations
- **Find Anomalies**: Look for unusual spikes or dips in the pattern
- **Compare Days**: Notice how each day follows similar patterns
- **Hour Selector**: Change the hour above to see routing details for that specific time
- **Export Data**: Right-click chart → Save Image (in most browsers)

---

**Your graph visualization is now fully functional and ready to explore!** 🎊

Navigate to the dashboard and experience the interactive energy visualization in action!

