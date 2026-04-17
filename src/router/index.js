import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SimulationView from '../views/SimulationView.vue'
import ReportView from '../views/ReportView.vue'

// ── Tier 2 DTC views (lazy-loaded for performance) ──────────────
const DTCHomeView = () => import('../views/DTCHomeView.vue')
const DTCSimulationView = () => import('../views/DTCSimulationView.vue')
const DTCReportView = () => import('../views/DTCReportView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Tier 1 — Public Opinion ───────────────────────────────
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/simulation/:id',
      name: 'simulation',
      component: SimulationView,
      props: true,
    },
    {
      path: '/report/:id',
      name: 'report',
      component: ReportView,
      props: true,
    },

    // ── Tier 2 — DTC Market ───────────────────────────────────
    {
      path: '/dtc',
      name: 'dtc-home',
      component: DTCHomeView,
    },
    {
      path: '/dtc/simulation/:id',
      name: 'dtc-simulation',
      component: DTCSimulationView,
      props: true,
    },
    {
      path: '/dtc/report/:id',
      name: 'dtc-report',
      component: DTCReportView,
      props: true,
    },

    // ── Catch-all → home ──────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router