# NeighborGrid Flow

Community energy sharing platform with advanced dispatch algorithms.

## Project Components

This project consists of two main components:

1. **Frontend Application** - React/TypeScript UI for admin and user dashboards
2. **Dispatch Algorithm** - Python-based energy management system

**Project URL**: https://lovable.dev/projects/8237b455-aced-4339-b8f9-7d8245429c0b

---

## 🔋 Python Dispatch Algorithm

### Single-Home Simulation

For setup and usage of the single-home energy dispatch algorithm, see:

**[📖 NeighborGrid Setup Guide](./NEIGHBORGRID_SETUP.md)**

Quick start:
```bash
# Install Python dependencies
pip3 install pandas numpy pytest

# Run tests
./run_tests.sh

# Run single-home simulation
./run_simulation.sh --hours 24 --solar-kw 6 --battery-kwh 10 --out out_single.csv
```

### Multi-Home Community Simulation

For the complete admin dashboard with 10-home community simulation, see:

**[📊 Admin Dashboard Guide](./ADMIN_DASHBOARD_GUIDE.md)**

Quick start:
```bash
# Generate community data (10 homes × 5 days)
./run_generate_community_data.sh --days 5

# Start frontend
npm run dev

# Login as admin and view Community Dashboard
# http://localhost:8080/login/admin → Admin → Community Dashboard
```

### 🎮 Live Real-Time Simulator (NEW!)

For the **tick-based live simulator** with real-time SSE streaming:

**[🎮 Live Simulator Guide](./LIVE_SIMULATOR_GUIDE.md)**

Quick start:
```bash
# Start live simulator backend (20 homes, accelerated time)
cd simulator-backend
npm install
npm run dev

# Server runs at http://localhost:3001
# SSE stream: http://localhost:3001/stream
# Admin API: http://localhost:3001/state/admin

# Test it
curl http://localhost:3001/state/admin | jq
curl -N http://localhost:3001/stream
```

**Features:**
- ⚡ Real-time simulation (1 min = 0.5s)
- 🏠 20 homes with physics-based dispatch
- 📡 SSE streaming for live updates
- 🌩️ Events: OUTAGE, CLOUDBURST, HEATWAVE, EV_SURGE
- 🔋 Battery management with SOC tracking
- 💰 Fair-rate credits system
- 🌐 Grid import/export/islanding

---

## 🎨 Frontend Application

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8237b455-aced-4339-b8f9-7d8245429c0b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8237b455-aced-4339-b8f9-7d8245429c0b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
