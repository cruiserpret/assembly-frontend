import { createRouter, createWebHistory } from 'vue-router'
import HomeView       from '../views/HomeView.vue'
import SimulationView from '../views/SimulationView.vue'
import ReportView     from '../views/ReportView.vue'
import AgentView      from '../views/AgentView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',                    component: HomeView },
    { path: '/simulation/:id',      component: SimulationView, props: true },
    { path: '/report/:id',          component: ReportView,     props: true },
    { path: '/agent/:id',           component: AgentView,      props: true },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
