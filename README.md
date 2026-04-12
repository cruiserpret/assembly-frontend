# Assembly Frontend

Vue 3 + Vite frontend for the Assembly debate simulation engine.

## Stack
- **Vue 3** (Composition API)
- **Vue Router** (SPA routing)
- **Chart.js** (sentiment wave chart)
- **Vite** (dev server + build)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env

# 3. Start dev server (make sure Pransh's backend is running on :5001)
npm run dev
```

App runs at **http://localhost:3000**

Vite automatically proxies `/api` → `http://localhost:5001` so no CORS issues locally.

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomeView | Topic input + launch |
| `/simulation/:id` | SimulationView | Live debate dashboard |
| `/report/:id` | ReportView | God's Eye View report |
| `/agent/:id` | AgentView | Cross-simulation agent memory |

---

## Connecting to Pransh's Backend

### Local development
The `vite.config.js` proxy handles this automatically. Just make sure Pransh's server is running:
```bash
# In Pransh's terminal:
python -m backend.main
```

### Production (Render)
1. Deploy Pransh's backend to Render as a **Web Service**
2. Copy the Render URL (e.g. `https://assembly-backend.onrender.com`)
3. Set in your `.env`:
   ```
   VITE_API_URL=https://assembly-backend.onrender.com
   ```
4. Update `src/api/assembly.js` line 4:
   ```js
   const BASE = import.meta.env.VITE_API_URL
     ? `${import.meta.env.VITE_API_URL}/api`
     : '/api'
   ```
5. Deploy frontend to Render as a **Static Site**:
   - Build command: `npm run build`
   - Publish directory: `dist`

---

## API Endpoints Used

| Method | Endpoint | Used in |
|--------|----------|---------|
| POST | `/api/simulation/start` | HomeView |
| GET | `/api/simulation/:id/debate` | SimulationView |
| GET | `/api/report/:id` | ReportView |
| GET | `/api/sentiment/history/:id` | SimulationView (chart) |
| POST | `/api/inject` | SimulationView (inject panel) |
| POST | `/api/branch` | SimulationView (branch panel) |
| GET | `/api/agent/:id/memory` | AgentView |

---

## File Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── src/
    ├── main.js          # App entry
    ├── App.vue          # Root + nav
    ├── api/
    │   └── assembly.js  # All API calls
    ├── router/
    │   └── index.js     # Routes
    ├── views/
    │   ├── HomeView.vue       # Landing page
    │   ├── SimulationView.vue # Debate dashboard
    │   ├── ReportView.vue     # God's Eye View
    │   └── AgentView.vue      # Agent memory
    └── assets/
        └── main.css     # Design system + global styles
```

---

Built for Y Combinator. Let's go. 🚀
