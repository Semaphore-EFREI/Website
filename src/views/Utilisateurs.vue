<template>
  <main class="users-page">
    <div class="users-header">
      <picture>
        <source
          type="image/avif"
          srcset="../assets/images/user-background-w640.avif 640w,
                  ../assets/images/user-background-w960.avif 960w,
                  ../assets/images/user-background-w1280.avif 1280w,
                  ../assets/images/user-background-w1920.avif 1920w,
                  ../assets/images/user-background-w2560.avif 2560w"
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcset="../assets/images/user-background-w640.webp 640w,
                  ../assets/images/user-background-w960.webp 960w,
                  ../assets/images/user-background-w1280.webp 1280w,
                  ../assets/images/user-background-w1920.webp 1920w,
                  ../assets/images/user-background-w2560.webp 2560w"
          sizes="100vw"
        />
        <img
          src="../assets/images/user-background-w1280.webp"
          alt="background"
          class="header-bg"
          decoding="async"
          fetchpriority="high"
        />
      </picture>

      <div class="header-buttons">
        <button class="btn-new-course" type="button" @click="createUser">
          <img src="../assets/images/plus-sign.svg" alt="plus" class="plus-icon" />Nouvel utilisateur
        </button>
      </div>
      <div class="header-content">
        <img src="../assets/images/user-white.svg" alt="utilisateurs" class="userG-icon" />
        <h1 class="header-title">Utilisateurs</h1>
      </div>
    </div>


    <div class="users-content">
      <section class="role-cta">
        <button class="card" type="button" @click="openRole('Étudiant')">
          <img src="../assets/images/student.svg" alt="student" class="icon student-icon" />
          <div class="card-text">
            <div class="label">Étudiants</div>
            <img src="../assets/images/arrow-right.svg" alt="arrow" class="arrow-icon" />
          </div>
        </button>
        <button class="card" type="button" @click="openRole('Enseignant')">
          <img src="../assets/images/teacher.svg" alt="teacher" class="icon teacher-icon" />
          <div class="card-text">
            <div class="label">Enseignants</div>
            <img src="../assets/images/arrow-right.svg" alt="arrow" class="arrow-icon" />
          </div>
        </button>
        <button class="card" type="button" @click="openRole('Admin')">
          <img src="../assets/images/admin.svg" alt="admin" class="icon admin-icon" />
          <div class="card-text">
            <div class="label">Admins</div>
            <img src="../assets/images/arrow-right.svg" alt="arrow" class="arrow-icon" />
          </div>
        </button>
      </section>

      <section class="search-section">
        <label class="search-label" for="user-search">Recherche</label>
        <div class="search-input-wrapper">
          <input
            id="user-search"
            v-model="searchQuery"
            type="search"
            placeholder="Mark DUPONT"
            class="search-input"
            aria-label="Rechercher un utilisateur"
          />
        </div>
      </section>

      <section class="all-users">
        <label class="section-title">Tous les utilisateurs</label>
        <div class="user-cards">
          <div class="user-card" v-for="user in filteredUsers" :key="user.id || user.key" @click="openUser(user)">
              <img
                :src="user.profilePicture || defaultProfile"
                alt="Photo de profil"
                class="user-avatar"
                width="64"
                height="64"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
            <div class="name">{{ user.name }}</div>
            <div class="role" :class="roleClass(user.role)">
              <img :src="roleIcon(user.role)" :alt="user.role" class="role-icon" />
              <div class="role-value">{{ user.role }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>

</template>

<script>
import { mapActions, mapState } from 'pinia'
import defaultProfile from '../assets/images/user-invert.svg'
import { useUsersStore } from '../stores'

export default {
  name: 'Utilisateurs',
  data() {
    return {
      searchQuery: '',
      defaultProfile
    }
  },
  computed: {
    ...mapState(useUsersStore, ['users', 'loading']),
    filteredUsers() {
      const query = this.searchQuery.trim().toLowerCase()
      if (!query) return this.users
      return this.users.filter(user => (user.name || '').toLowerCase().includes(query))
    }
  },
  created() {
    if (!this.users.length) {
      this.fetchUsers().catch(() => {})
    }
  },
  methods: {
    ...mapActions(useUsersStore, { fetchUsers: 'fetchUsers' }),
    async openUser(user) {
      if (!user) return
      this.$router.push({ name: 'UtilisateurDetail', params: { id: user.id || user.key } })
    },
    openRole(role) {
      const map = {
        Étudiant: 'Etudiants',
        Enseignant: 'Enseignants',
        Admin: 'Admins'
      }
      const name = map[role]
      if (name) {
        this.$router.push({ name })
      }
    },
    editUser(user) {
      if (!user) return
      this.$router.push({
        name: 'UtilisateurEdit',
        query: { id: user.id }
      })
    },
    createUser() {
      this.$router.push({ name: 'UtilisateurEdit' })
    },
    deleteUser(user) {
      // Deprecated: deletion now handled in detail page
      if (!user) return
      this.$router.push({ name: 'UtilisateurDetail', params: { id: user.id || user.key } })
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
  beforeUnmount() {
  }
}
</script>


<style scoped src="../assets/utilisateurs.css"></style>
