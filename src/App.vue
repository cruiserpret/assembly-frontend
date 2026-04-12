<template>
  <div id="assembly-app">
    <!-- Top nav bar -->
    <nav class="nav">
      <router-link to="/" class="nav-logo">
        <span class="display">ASSEMBLY</span>
        <span class="nav-version mono">v0.1</span>
      </router-link>

      <div class="nav-center" v-if="$route.params.id">
        <span class="mono muted" style="font-size:11px; letter-spacing:0.08em; text-transform:uppercase;">
          SIM #{{ $route.params.id?.slice(0,8) }}
        </span>
      </div>

      <div class="nav-actions">
        <router-link
          v-if="$route.name !== 'home' && $route.params.id"
          :to="`/simulation/${$route.params.id}`"
          class="btn btn-ghost"
          style="font-size:10px; padding:6px 14px;"
        >Debate</router-link>
        <router-link
          v-if="$route.name !== 'home' && $route.params.id"
          :to="`/report/${$route.params.id}`"
          class="btn btn-ghost"
          style="font-size:10px; padding:6px 14px;"
        >Report</router-link>
        <router-link to="/" class="btn btn-primary" style="font-size:10px; padding:6px 16px;">
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
import { useRoute } from 'vue-router'
const $route = useRoute()
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 32px;
  height: 56px;
  background: rgba(6,8,15,0.85);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
}

.nav-logo {
  display: flex;
  align-items: baseline;
  gap: 8px;
  text-decoration: none;
  color: var(--text);
  flex-shrink: 0;
}
.nav-logo .display { font-size: 22px; color: var(--accent); }
.nav-version { font-size: 10px; color: var(--text-dim); }

.nav-center { flex: 1; display: flex; justify-content: center; }

.nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* Page transitions */
.page-enter-active,
.page-leave-active { transition: opacity 200ms ease, transform 200ms ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to  { opacity: 0; transform: translateY(-8px); }
</style>
