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
import { useAuthStore } from '../stores'

const routes = [
  { path: '/', redirect: { name: 'Connexion' } },
  { path: '/connexion', name: 'Connexion', component: Login, meta: { requiresAuth: false } },
  { path: '/calendrier', name: 'Calendrier', component: Calendar, meta: { requiresAuth: true } },
  { path: '/calendrier/nouveau', name: 'NouveauCours', component: NouveauCours, meta: { requiresAuth: true } },
  { path: '/calendrier/:id', name: 'CalendrierDetail', component: CalendarDetail, props: true, meta: { requiresAuth: true } },
  { path: '/utilisateurs', name: 'Utilisateurs', component: Users, meta: { requiresAuth: true } },
  { path: '/utilisateurs/:id', name: 'UtilisateurDetail', component: UtilisateurDetail, props: true, meta: { requiresAuth: true } },
  { path: '/utilisateurs/modifier', name: 'UtilisateurEdit', component: UtilisateurEdit, meta: { requiresAuth: true } },
  { path: '/etudiants', name: 'Etudiants', component: RoleUsers, props: { role: 'Étudiant', title: 'Étudiants' }, meta: { requiresAuth: true } },
  { path: '/enseignants', name: 'Enseignants', component: RoleUsers, props: { role: 'Enseignant', title: 'Enseignants' }, meta: { requiresAuth: true } },
  { path: '/admins', name: 'Admins', component: RoleUsers, props: { role: 'Admin', title: 'Admins' }, meta: { requiresAuth: true } },
  { path: '/groupes-classes', name: 'GroupesClasses', component: GroupesClasses, meta: { requiresAuth: true } },
  { path: '/groupes-classes/:groupName', name: 'GroupesClassesDetail', component: GroupesClassesDetail, props: true, meta: { requiresAuth: true } },
  { path: '/ecole', name: 'Ecole', component: Ecole, meta: { requiresAuth: true } },
  { path: '/ecole/:section', name: 'EcoleSection', component: EcoleSection, props: true, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: { name: 'Connexion' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navigation - Rediriger vers la connexion si pas authentifié
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  const requiresAuth = to.meta?.requiresAuth !== false && to.name !== 'Connexion'

  // Routes publiques (connexion)
  if (!requiresAuth) return true

  // Si aucun token, redirect immédiat
  if (!auth.hasToken) {
    return { name: 'Connexion' }
  }

  // Si on a un token mais pas de user (ou session pas hydratée), on tente de le charger; en cas d'échec on déconnecte
  if ((!auth.user || !auth.hydrated) && !auth.loading) {
    try {
      await auth.fetchCurrentUser()
    } catch (_err) {
      await auth.logout()
      return { name: 'Connexion' }
    }
  }

  // Si après hydratation on n'est toujours pas authentifié, on redirige
  if (!auth.isAuthenticated) {
    return { name: 'Connexion' }
  }

  if (!auth.canAccessAdmin) {
    await auth.logout()
    return { name: 'Connexion' }
  }

  return true
})

export default router
