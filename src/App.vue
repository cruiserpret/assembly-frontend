<template>
  <div id="assembly-app">
    <nav class="nav" :class="{ 'nav-tall': isReportPage }">
      <router-link to="/" class="nav-logo">
        <span class="display">ASSEMBLY</span>
        <span class="nav-version mono">v0.1</span>
      </router-link>

      <!-- Only show nav actions when NOT on home page -->
      <div class="nav-actions" v-if="$route.path !== '/'">

        <!-- On report page: stack both buttons vertically -->
        <div v-if="isReportPage" class="nav-stack">
          <router-link to="/" class="btn btn-primary" style="font-size:10px;padding:6px 16px;width:100%;justify-content:center;">
            + New Simulation
          </router-link>
          <router-link :to="`/simulation/${$route.params.id}`" class="btn btn-ghost" style="font-size:10px;padding:5px 16px;width:100%;justify-content:center;">
            ← View Debate
          </router-link>
        </div>

        <!-- On other pages: just New Simulation (white/outlined, distinct from lime God's Eye View) -->
        <router-link v-else to="/" class="btn btn-secondary-nav" style="font-size:10px;padding:6px 16px;">
          + New Simulation
        </router-link>

      </div>
    </nav>

    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const $route = useRoute()
const isReportPage = computed(() => $route.path.startsWith('/report/'))
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  height: 52px;
  background: rgba(6,8,15,0.92);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
  transition: height var(--transition);
}

/* Taller nav on report page to fit stacked buttons */
.nav.nav-tall {
  height: 72px;
  align-items: center;
}

.nav-logo {
  display: flex;
  align-items: baseline;
  gap: 8px;
  text-decoration: none;
  color: var(--text);
  flex-shrink: 0;
  flex: 1;
}
.nav-logo .display { font-size: 22px; color: var(--accent); }
.nav-version { font-size: 10px; color: var(--text-dim); }

.nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* Stacked buttons for report page */
.nav-stack {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: stretch;
  width: 160px;
}

/* White/outlined style for non-report pages — distinct from lime btn-primary */
.btn-secondary-nav {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 7px 16px;
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.06);
  color: var(--text);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition);
  display: inline-flex;
  align-items: center;
}
.btn-secondary-nav:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.3);
  color: #fff;
}

.page-enter-active, .page-leave-active { transition: opacity 200ms ease, transform 200ms ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to  { opacity: 0; transform: translateY(-8px); }

@media (max-width: 600px) {
  .nav-actions { display: none; }
}
</style>