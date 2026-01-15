import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Calendar from '../views/Calendar.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/calendar', name: 'Calendar', component: Calendar }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
