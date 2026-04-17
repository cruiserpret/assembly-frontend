import { createRouter, createWebHistory } from 'vue-router'

const DTCHomeView       = () => import('../views/DTCHomeView.vue')
const DTCSimulationView = () => import('../views/DTCSimulationView.vue')
const DTCReportView     = () => import('../views/DTCReportView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',                      redirect: '/dtc' },
    { path: '/dtc',                   name: 'dtc-home',       component: DTCHomeView },
    { path: '/dtc/simulation/:id',    name: 'dtc-simulation', component: DTCSimulationView, props: true },
    { path: '/dtc/report/:id',        name: 'dtc-report',     component: DTCReportView,     props: true },
    { path: '/:pathMatch(.*)*',       redirect: '/dtc' },
  ],
  scrollBehavior() { return { top: 0 } },
})

export default router
