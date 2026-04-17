<template>
  <div id="app" :class="{ 'mode-market': isDTCMode }">

    <!-- ── NAV ── -->
    <nav class="nav" :style="isReportPage ? 'height:72px' : ''">
      <div class="nav-inner">

        <!-- Logo -->
        <router-link to="/" class="nav-logo">
          <span class="nav-logo-bracket mono">[</span>
          <span class="display nav-logo-text">ASSEMBLY</span>
          <span class="nav-logo-bracket mono">]</span>
          <!-- Mode badge -->
          <span v-if="isDTCMode" class="nav-mode-badge mono">MARKET</span>
        </router-link>

        <!-- Right nav actions -->
        <div class="nav-actions">

          <!-- On DTC simulation/report pages -->
          <template v-if="isDTCSimOrReport">
            <div class="nav-stacked">
              <router-link to="/dtc" class="btn btn-ghost btn-sm mono">+ New Market Sim</router-link>
              <router-link
                v-if="isDTCReportPage"
                :to="`/dtc/simulation/${currentSimId}`"
                class="btn btn-secondary btn-sm mono"
              >← View Market Debate</router-link>
            </div>
          </template>

          <!-- On Tier 1 simulation/report pages -->
          <template v-else-if="isSimOrReport">
            <div class="nav-stacked">
              <router-link to="/" class="btn btn-ghost btn-sm mono">+ New Simulation</router-link>
              <router-link
                v-if="isReportPage"
                :to="`/simulation/${currentSimId}`"
                class="btn btn-secondary btn-sm mono"
              >← View Debate</router-link>
              <router-link
                v-if="isSimulationPage"
                :to="`/report/${currentSimId}`"
                class="btn btn-primary btn-sm mono"
              >God's Eye View →</router-link>
            </div>
          </template>

          <!-- On home pages — show mode switcher hint -->
          <template v-else>
            <router-link
              v-if="!isDTCMode"
              to="/dtc"
              class="nav-dtc-link mono"
            >
              Switch to Market Mode →
            </router-link>
          </template>

        </div>
      </div>
    </nav>

    <!-- ── MAIN ── -->
    <main class="main">
      <router-view />
    </main>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isDTCMode        = computed(() => route.path.startsWith('/dtc'))
const isDTCSimOrReport = computed(() => route.path.startsWith('/dtc/simulation') || route.path.startsWith('/dtc/report'))
const isDTCReportPage  = computed(() => route.path.startsWith('/dtc/report'))

const isSimOrReport    = computed(() => route.path.startsWith('/simulation') || route.path.startsWith('/report'))
const isSimulationPage = computed(() => route.path.startsWith('/simulation'))
const isReportPage     = computed(() => route.path.startsWith('/report') || route.path.startsWith('/dtc/report'))

const currentSimId = computed(() => route.params.id || '')
</script>

<style>
/* ── Global reset & tokens ─────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #09090b;
  --bg-2:      #111114;
  --surface:   #141417;
  --surface-2: #1c1c21;
  --border:    rgba(255,255,255,0.07);
  --text:      #e4eaf5;
  --text-muted: #8a94a6;
  --text-dim:  #4a5568;
  --accent:    #c8ff57;
  --for:       #3ee8a0;
  --against:   #ff4d6d;
  --neutral:   #7a8ba6;
  --radius:    6px;
  --radius-lg: 12px;
  --transition: 0.15s ease;
  --body:      'Instrument Sans', 'DM Sans', system-ui, sans-serif;
  --display:   'Bebas Neue', 'Impact', sans-serif;
  --mono:      'JetBrains Mono', 'Fira Code', monospace;
}

/* Market mode — subtle tint shift */
.mode-market {
  --accent: #c8ff57;
  --surface: #131416;
}

html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--body);
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Font loading */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@300;400;500&family=Instrument+Sans:wght@300;400;500;600&display=swap');

.display { font-family: var(--display); letter-spacing: 0.02em; }
.mono    { font-family: var(--mono); }
.muted   { color: var(--text-muted); }
.accent  { color: var(--accent); }

/* ── Nav ── */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 52px;
  background: rgba(9,9,11,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  transition: height 0.2s ease;
}
.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-logo {
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
}
.nav-logo-bracket { font-size: 14px; color: var(--accent); opacity: 0.5; }
.nav-logo-text    { font-size: 20px; color: var(--text); letter-spacing: 0.04em; line-height: 1; }
.nav-mode-badge {
  font-size: 8px;
  letter-spacing: 0.12em;
  padding: 2px 6px;
  border-radius: 100px;
  background: rgba(200,255,87,0.12);
  border: 1px solid rgba(200,255,87,0.25);
  color: var(--accent);
  margin-left: 8px;
}
.nav-actions { display: flex; align-items: center; gap: 8px; }
.nav-stacked { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.nav-dtc-link {
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--text-dim);
  text-decoration: none;
  transition: color var(--transition);
  text-transform: uppercase;
}
.nav-dtc-link:hover { color: var(--accent); }

/* ── Main ── */
.main { min-height: calc(100vh - 52px); }

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--transition);
  white-space: nowrap;
}
.btn-sm { padding: 5px 12px; font-size: 10px; }
.btn-primary {
  background: var(--accent);
  color: #09090b;
  font-weight: 600;
}
.btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(200,255,87,0.3); }
.btn-secondary {
  background: transparent;
  border-color: rgba(255,255,255,0.15);
  color: var(--text-muted);
}
.btn-secondary:hover { border-color: rgba(255,255,255,0.3); color: var(--text); }
.btn-ghost {
  background: transparent;
  border-color: var(--border);
  color: var(--text-muted);
}
.btn-ghost:hover { border-color: rgba(200,255,87,0.3); color: var(--accent); }

/* ── Inputs & textareas ── */
.input, .textarea {
  width: 100%;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  color: var(--text);
  font-size: 13px;
  font-family: var(--body);
  transition: border-color var(--transition);
  resize: vertical;
}
.input:focus, .textarea:focus {
  outline: none;
  border-color: rgba(200,255,87,0.4);
}
.input::placeholder, .textarea::placeholder { color: var(--text-dim); }
.input:disabled, .textarea:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Divider ── */
.divider { height: 1px; background: var(--border); width: 100%; }

/* ── Live dot ── */
.live-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.8); }
}

/* ── Spinner ── */
.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(0,0,0,0.3);
  border-top-color: #09090b;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Tags ── */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 100px;
}
.tag-for     { background: rgba(62,232,160,0.15);  color: var(--for);     border: 1px solid rgba(62,232,160,0.3); }
.tag-against { background: rgba(255,77,109,0.15);  color: var(--against); border: 1px solid rgba(255,77,109,0.3); }
.tag-neutral { background: rgba(122,139,166,0.15); color: var(--neutral); border: 1px solid rgba(122,139,166,0.2); }

/* ── Delta ── */
.delta-positive { color: var(--for); font-family: var(--mono); font-size: 10px; }
.delta-negative { color: var(--against); }

/* ── Fade-up animations ── */
.fade-up { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
.fade-up-1 { animation-delay: 0.1s; }
.fade-up-2 { animation-delay: 0.2s; }
.fade-up-3 { animation-delay: 0.3s; }
.fade-up-4 { animation-delay: 0.4s; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>