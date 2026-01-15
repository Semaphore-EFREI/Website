import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Connexion.vue'
import Calendar from '../views/Calendrier.vue'

const routes = [
  { path: '/', name: 'Connexion', component: Login },
  { path: '/calendrier', name: 'Calendrier', component: Calendar }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
