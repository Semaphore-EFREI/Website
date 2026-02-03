import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Connexion.vue'
import Calendar from '../views/Calendrier.vue'
import CalendarDetail from '../views/CalendrierDetail.vue'
import NouveauCours from '../views/NouveauCours.vue'
import Users from '../views/Utilisateurs.vue'
import UtilisateurEdit from '../views/UtilisateurEdit.vue'
import UtilisateurDetail from '../views/UtilisateurDetail.vue'
import RoleUsers from '../views/RoleUsers.vue'
import GroupesClasses from '../views/GroupesClasses.vue'
import GroupesClassesDetail from '../views/GroupesClassesDetail.vue'
import Ecole from '../views/Ecole.vue'
import EcoleSection from '../views/EcoleSection.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: { name: 'Connexion' } },
  { path: '/connexion', name: 'Connexion', component: Login },
  { path: '/calendrier', name: 'Calendrier', component: Calendar },
  { path: '/calendrier/nouveau', name: 'NouveauCours', component: NouveauCours },
  { path: '/calendrier/:id', name: 'CalendrierDetail', component: CalendarDetail, props: true },
  { path: '/utilisateurs', name: 'Utilisateurs', component: Users },
  { path: '/utilisateurs/:id', name: 'UtilisateurDetail', component: UtilisateurDetail, props: true },
  { path: '/utilisateurs/modifier', name: 'UtilisateurEdit', component: UtilisateurEdit },
  { path: '/etudiants', name: 'Etudiants', component: RoleUsers, props: { role: 'Étudiant', title: 'Étudiants' } },
  { path: '/enseignants', name: 'Enseignants', component: RoleUsers, props: { role: 'Enseignant', title: 'Enseignants' } },
  { path: '/admins', name: 'Admins', component: RoleUsers, props: { role: 'Admin', title: 'Admins' } },
  { path: '/groupes-classes', name: 'GroupesClasses', component: GroupesClasses },
  { path: '/groupes-classes/:groupName', name: 'GroupesClassesDetail', component: GroupesClassesDetail, props: true },
  { path: '/ecole', name: 'Ecole', component: Ecole },
  { path: '/ecole/:section', name: 'EcoleSection', component: EcoleSection, props: true },
  { path: '/:pathMatch(.*)*', redirect: { name: 'Connexion' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navigation - Rediriger vers la connexion si pas authentifié
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Les routes publiques (connexion)
  const publicRoutes = ['Connexion']

  if (publicRoutes.includes(to.name)) {
    next()
  } else if (!auth.isAuthenticated) {
    next({ name: 'Connexion' })
  } else {
    next()
  }
})

export default router
