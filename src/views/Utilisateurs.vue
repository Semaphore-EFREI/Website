<template>
  <main class="users-page">
    <div class="users-header">
      <img src="../assets/images/user-background.svg" alt="background" class="header-bg" />
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
            <button class="modal-btn danger" @click="deleteUser(selectedUser)"><img src="../assets/images/delete.svg" alt="delete" class="btn-icon" /></button>
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
            <span v-for="(group, index) in selectedUser.groups" :key="`${selectedUser.id || selectedUser.key}-group-${index}`" class="chip">{{ group }}</span>
          </div>
          <div v-else class="group-empty">Aucun groupe</div>
        </div>
      </div>
    </div>
  </div>
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
      selectedUser: null,
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
    this.fetchUsers().catch(() => {})
  },
  methods: {
    ...mapActions(useUsersStore, { fetchUsers: 'fetchUsers', removeUser: 'deleteUser' }),
    openUser(user) {
      this.selectedUser = user
    },
    closeUser() {
      this.selectedUser = null
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
      if (!user) return
      this.deleteUserAction(user)
    },
    async deleteUserAction(user) {
      try {
        await this.removeUser(user.id)
        await this.fetchUsers()
        this.selectedUser = null
      } catch (error) {
        console.error('Unable to delete user', error)
      }
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