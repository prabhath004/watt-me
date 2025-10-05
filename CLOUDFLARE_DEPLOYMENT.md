# 🚀 Cloudflare Deployment Guide - Current Architecture

## **Your Current Setup:**
- ✅ Express.js server with SSE
- ✅ Always-running simulation
- ✅ Real-time energy data streaming
- ✅ 25 homes simulation

## **Cloudflare Deployment Options:**

---

## **Option 1: Cloudflare Pages Functions (Recommended)**

### **What I've Created:**
- `functions/api/[[path]].js` - Cloudflare Pages Function
- `simulator-backend/wrangler.toml` - Workers configuration

### **Deployment Steps:**

1. **Connect to Cloudflare Pages:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Pages
   - Connect your GitHub repository

2. **Configure Build Settings:**
   ```
   Build command: npm run build
   Output directory: dist
   Root directory: / (leave empty)
   ```

3. **Set Environment Variables:**
   ```
   FRONTEND_URL = https://your-domain.pages.dev
   NODE_ENV = production
   ```

4. **Deploy:**
   - Click "Deploy site"
   - Your simulator will be available at: `https://your-domain.pages.dev/api/`

---

## **Option 2: Cloudflare Workers**

### **Deployment Steps:**

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Build and Deploy:**
   ```bash
   cd simulator-backend
   npm run build
   wrangler deploy
   ```

---

## **Option 3: Cloudflare R2 + Pages (Hybrid)**

### **For Static Data:**
- Store simulation data in Cloudflare R2
- Use Pages Functions for API calls
- Frontend polls for updates instead of SSE

---

## **Important Considerations:**

### **SSE Limitations on Cloudflare:**
- ❌ **No persistent connections** - Cloudflare Pages Functions are stateless
- ❌ **No real-time streaming** - Each request is independent
- ❌ **No continuous simulation** - Simulation runs per request

### **Workarounds:**

1. **Polling Instead of SSE:**
   ```javascript
   // Frontend: Poll every 2 seconds instead of SSE
   setInterval(async () => {
     const response = await fetch('/api/stream');
     const data = await response.json();
     updateDashboard(data);
   }, 2000);
   ```

2. **WebSocket Alternative:**
   - Use Cloudflare Durable Objects for persistent connections
   - More complex but supports real-time streaming

3. **Hybrid Approach:**
   - Use Pages Functions for API calls
   - Use Cloudflare KV for state storage
   - Frontend polls for updates

---

## **Modified Frontend for Cloudflare:**

Update your frontend to work with Cloudflare Pages Functions:

```javascript
// Replace SSE with polling
useEffect(() => {
  const pollData = async () => {
    try {
      const response = await fetch('/api/stream');
      const data = await response.json();
      
      // Find this user's home
      const myHome = data.homes.find(h => h.id === homeId);
      if (myHome) {
        setLiveHome(myHome);
        // Update chart, etc.
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  // Poll every 2 seconds
  const interval = setInterval(pollData, 2000);
  pollData(); // Initial call

  return () => clearInterval(interval);
}, [homeId]);
```

---

## **Deployment Commands:**

### **For Cloudflare Pages:**
```bash
# Build frontend
npm run build

# Deploy to Cloudflare Pages
# (Done through Cloudflare Dashboard)
```

### **For Cloudflare Workers:**
```bash
cd simulator-backend
npm run build
wrangler deploy
```

---

## **Cost Comparison:**

### **Current Architecture:**
- **VPS:** $20-50/month
- **Always running:** High CPU usage
- **SSE:** Persistent connections

### **Cloudflare Pages:**
- **Free tier:** 100k requests/month
- **Pro:** $20/month for 500k requests
- **No persistent connections:** Lower resource usage

### **Cloudflare Workers:**
- **Free tier:** 100k requests/month
- **Paid:** $5/month for 10M requests
- **Global edge:** Fast worldwide

---

## **Migration Steps:**

1. **Deploy to Cloudflare Pages:**
   - Upload your frontend
   - Add the Pages Function
   - Test the API endpoints

2. **Update Frontend:**
   - Replace SSE with polling
   - Update API URLs to `/api/`
   - Test all functionality

3. **Monitor Performance:**
   - Check request limits
   - Monitor response times
   - Verify data accuracy

---

## **Testing Your Deployment:**

### **Test Endpoints:**
```bash
# Health check
curl https://your-domain.pages.dev/api/health

# Admin state
curl https://your-domain.pages.dev/api/state/admin

# User state
curl https://your-domain.pages.dev/api/state/user/H001

# Stream data (single request)
curl https://your-domain.pages.dev/api/stream
```

---

## **🎉 You're Ready to Deploy!**

Your current architecture can work on Cloudflare with these modifications:

✅ **Pages Functions** - Handle API requests  
✅ **Polling** - Replace SSE with periodic requests  
✅ **Global CDN** - Fast worldwide access  
✅ **Cost Effective** - Pay only for requests  

**Next Steps:**
1. Deploy to Cloudflare Pages
2. Update frontend to use polling
3. Test all functionality
4. Monitor performance

Your energy dashboard will be globally accessible and cost-effective! 🚀
