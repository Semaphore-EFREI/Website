import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Connexion.vue'
import Calendar from '../views/Calendrier.vue'
import CalendarDetail from '../views/CalendrierDetail.vue'
import Users from '../views/Utilisateurs.vue'
import UtilisateurEdit from '../views/UtilisateurEdit.vue'

const routes = [
  { path: '/', name: 'Connexion', component: Login },
  { path: '/calendrier', name: 'Calendrier', component: Calendar },
  { path: '/calendrier/:id', name: 'CalendrierDetail', component: CalendarDetail, props: true },
  { path: '/utilisateurs', name: 'Utilisateurs', component: Users },
  { path: '/utilisateurs/modifier', name: 'UtilisateurEdit', component: UtilisateurEdit }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
