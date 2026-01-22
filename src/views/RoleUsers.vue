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
        <article v-for="user in filteredUsers" :key="user.key" class="user-card" @click="openUser(user)">
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

  <div v-if="selectedUser" class="user-modal-overlay" @click.self="closeUser">
    <div class="user-modal">
      <header class="user-modal__header">
        <div class="user-modal__header-content">
          <div class="modal-back">
            <button class="modal-btn ghost" type="button" @click="closeUser">
              <img src="../assets/images/arrow-left.svg" alt="arrow" class="btn-icon" />
            </button>
          </div>
          <div class="modal-actions">
            <button class="modal-btn secondary" type="button" @click="editUser(selectedUser)">
              <img src="../assets/images/modify-black.svg" alt="modify" class="btn-icon" />
            </button>
            <button class="modal-btn danger" type="button" disabled>
              <img src="../assets/images/delete.svg" alt="delete" class="btn-icon" />
            </button>
          </div>
        </div>
      </header>
      <div class="user-modal__body">
        <div class="user-modal__avatar">
          <img :src="selectedUser.profilePicture || defaultProfile" alt="Photo de profil" />
        </div>
        <div class="user-modal__infos">
          <h3 class="user-modal__name">{{ selectedUser.name }}</h3>
          <div class="user-modal__email">{{ selectedUser.email || 'Non renseigné' }}</div>
        </div>
        <div class="user-modal__role" :class="roleClass(selectedUser.role)">
          <img :src="roleIcon(selectedUser.role)" :alt="selectedUser.role" class="role-icon" />
          <span>{{ selectedUser.role }}</span>
        </div>
        <div class="user-modal__groups">
          <div class="group-chips" v-if="selectedUser.groups && selectedUser.groups.length">
            <span
              v-for="(group, index) in selectedUser.groups"
              :key="`${selectedUser.key}-group-${index}`"
              class="chip"
            >
              {{ group }}
            </span>
          </div>
          <div v-else class="group-empty">Aucun groupe</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import defaultProfile from '../assets/images/user-invert.svg'
import { getUsers } from '../utils/user-data'

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
      selectedUser: null,
      defaultProfile,
      searchQuery: ''
    }
  },
  computed: {
    filteredUsers() {
      const query = this.searchQuery.trim().toLowerCase()
      return getUsers()
        .filter(user => user.role === this.role)
        .filter(user => !query || user.name.toLowerCase().includes(query))
    }
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'Utilisateurs' })
    },
    openUser(user) {
      this.selectedUser = user
      document.body.style.overflow = 'hidden'
    },
    closeUser() {
      this.selectedUser = null
      document.body.style.overflow = ''
    },
    createUser() {
      this.$router.push({ name: 'UtilisateurEdit' })
    },
    editUser(user) {
      if (!user) return
      this.$router.push({ name: 'UtilisateurEdit', query: { userKey: user.key } })
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
    document.body.style.overflow = ''
  }
}
</script>

<style scoped src="../assets/role-users.css"></style>
