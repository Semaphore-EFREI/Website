<template>
  <main class="edit-user-page">
    <header class="edit-user-header">
      <div class="edit-user-header-left">
        <button class="edit-back-btn" type="button" @click="goBack">
          <img src="../assets/images/arrow-left.svg" alt="Retour" />
        </button>
        <div>
          <h1 class="edit-title">{{ title }}</h1>
        </div>
      </div>
      <button class="role-add-btn" type="button" @click="createUser">
        <img src="../assets/images/plus-sign-black.svg" alt="Ajouter" class="plus-icon" />
      </button>
    </header>

    <section class="role-users-grid">
      <section class="search-section">
        <label class="search-label" for="role-search">Recherche</label>
        <div class="search-input-wrapper">
          <input
            id="role-search"
            v-model="searchQuery"
            type="search"
            placeholder="Mark DUPONT"
            class="search-input"
            aria-label="Rechercher un utilisateur"
          />
        </div>
      </section>
      <div class="user-cards">
        <article v-for="user in filteredUsers" :key="user.id || user.key" class="user-card" @click="openUser(user)">
          <img :src="user.profilePicture || defaultProfile" alt="Photo de profil" class="user-avatar" />
          <div class="name">{{ user.name }}</div>
          <div class="role" :class="roleClass(user.role)">
            <img :src="roleIcon(user.role)" :alt="user.role" class="role-icon" />
            <div class="role-value">{{ user.role }}</div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import defaultProfile from '../assets/images/user-invert.svg'
import { useUsersStore } from '../stores'

export default {
  name: 'RoleUsers',
  props: {
    role: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      defaultProfile,
      searchQuery: ''
    }
  },
  computed: {
    ...mapState(useUsersStore, ['users']),
    filteredUsers() {
      const query = this.searchQuery.trim().toLowerCase()
      const roleTargets = {
        Étudiant: ['Étudiant', 'student'],
        Enseignant: ['Enseignant', 'teacher'],
        Admin: ['Admin', 'admin']
      }
      const acceptedRoles = roleTargets[this.role] || [this.role]
      return this.users
        .filter(user => acceptedRoles.includes(user.role))
        .filter(user => !query || (user.name || '').toLowerCase().includes(query))
    }
  },
  created() {
    this.fetchUsers().catch(() => {})
  },
  methods: {
    ...mapActions(useUsersStore, ['fetchUsers']),
    goBack() {
      this.$router.push({ name: 'Utilisateurs' })
    },
    async openUser(user) {
      if (!user) return
      const fromRole = this.$route.name
      this.$router.push({ name: 'UtilisateurDetail', params: { id: user.id || user.key }, query: { fromRole } })
    },
    createUser() {
      this.$router.push({ name: 'UtilisateurEdit' })
    },
    editUser(user) {
      if (!user) return
      this.$router.push({ name: 'UtilisateurEdit', query: { id: user.id } })
    },
    roleIcon(role) {
      const map = {
        Étudiant: new URL('../assets/images/student-blue.svg', import.meta.url).href,
        Enseignant: new URL('../assets/images/teacher-green.svg', import.meta.url).href,
        Admin: new URL('../assets/images/admin-purple.svg', import.meta.url).href
      }
      return map[role] || new URL('../assets/images/user.svg', import.meta.url).href
    },
    roleClass(role) {
      if (role === 'Étudiant') return 'role-student'
      if (role === 'Enseignant') return 'role-teacher'
      if (role === 'Admin') return 'role-admin'
      return ''
    }
  },
  beforeUnmount() {}
}
</script>

<style scoped src="../assets/role-users.css"></style>
