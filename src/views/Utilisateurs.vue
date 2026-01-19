<template>
  <main class="users-page">
    <div class="users-header">
      <img src="../assets/images/user-background.svg" alt="background" class="header-bg" />
      <div class="header-buttons">
        <button class="btn-new-course">
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
        <button class="card">
          <img src="../assets/images/student.svg" alt="student" class="student-icon" />
          <div class="card-text">
            <div class="label">Étudiants</div>
            <img src="../assets/images/arrow-right.svg" alt="arrow" class="arrow-icon" />
          </div>
        </button>
        <button class="card">
          <img src="../assets/images/teacher.svg" alt="teacher" class="teacher-icon" />
          <div class="card-text">
            <div class="label">Enseignants</div>
            <img src="../assets/images/arrow-right.svg" alt="arrow" class="arrow-icon" />
          </div>
        </button>
        <button class="card">
          <img src="../assets/images/admin.svg" alt="admin" class="admin-icon" />
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
          <div class="user-card" v-for="user in filteredUsers" :key="user.key" @click="openUser(user)">
              <img :src="user.profilePicture || defaultProfile" alt="Photo de profil" class="user-avatar" />
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

  <div v-if="selectedUser" class="user-modal-overlay" @click.self="closeUser">
    <div class="user-modal">
      <header class="user-modal__header">
        <div class="user-modal__header-content">
          <div class="modal-back">
            <button class="modal-btn ghost" @click="closeUser">
              <img src="../assets/images/arrow-left.svg" alt="arrow" class="btn-icon" />
            </button>
          </div>
          <div class="modal-actions">
            <button class="modal-btn secondary" @click="editUser(selectedUser)"><img src="../assets/images/modify-black.svg" alt="modify" class="btn-icon" /></button>
            <button class="modal-btn danger" disabled><img src="../assets/images/delete.svg" alt="delete" class="btn-icon" /></button>
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
            <span v-for="(group, index) in selectedUser.groups" :key="`${selectedUser.key}-group-${index}`" class="chip">{{ group }}</span>
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
  name: 'Utilisateurs',
  data() {
    return {
      searchQuery: '',
      selectedUser: null,
      defaultProfile
    }
  },
  computed: {
    users() {
      return getUsers()
    },
    filteredUsers() {
      const query = this.searchQuery.trim().toLowerCase()
      if (!query) return this.users
      return this.users.filter(user => user.name.toLowerCase().includes(query))
    }
  },
  methods: {
    openUser(user) {
      this.selectedUser = user
      document.body.style.overflow = 'hidden'
    },
    closeUser() {
      this.selectedUser = null
      document.body.style.overflow = ''
    },
    editUser(user) {
      if (!user) return
      this.$router.push({
        name: 'UtilisateurEdit',
        query: { userKey: user.key }
      })
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


<style scoped src="../assets/utilisateurs.css"></style>