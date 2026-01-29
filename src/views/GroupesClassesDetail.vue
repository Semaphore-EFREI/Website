<template>
  <main class="edit-user-page group-detail-page">
    <header class="edit-user-header">
      <div class="edit-user-header-left">
        <button class="edit-back-btn" type="button" @click="goBack">
          <img src="../assets/images/arrow-left.svg" alt="Retour" />
        </button>
        <div>
          <h1 class="edit-title">{{ groupName }}</h1>
        </div>
      </div>
      <button class="role-add-btn" type="button" @click="addUser">
        <img src="../assets/images/plus-sign-white.svg" alt="Ajouter" class="plus-icon" />
        Ajouter un étudiant
      </button>
    </header>

    <section class="role-users-grid">
      <div class="user-cards">
        <article v-for="user in students" :key="user.id || user.key" class="user-card" @click="openUser(user)">
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
              :key="`${selectedUser.id || selectedUser.key}-group-${index}`"
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
import { mapActions, mapState } from 'pinia'
import defaultProfile from '../assets/images/user-invert.svg'
import { useUsersStore, useGroupsStore, useAuthStore } from '../stores'

export default {
  name: 'GroupesClassesDetail',
  props: {
    groupName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      selectedUser: null,
      defaultProfile
    }
  },
  computed: {
    ...mapState(useUsersStore, ['users']),
    ...mapState(useGroupsStore, ['groups']),
    ...mapState(useAuthStore, { currentUser: 'user' }),
    schoolId() {
      return this.currentUser?.schoolId || this.currentUser?.school_id || this.currentUser?.school?.id || null
    },
    group() {
      return this.groups.find(g => g.name === this.groupName) || null
    },
    students() {
      if (!this.group) return []
      const ids = this.group.studentIds || []
      return this.users
        .filter(user => ['Étudiant', 'student'].includes(user.role))
        .filter(user => ids.includes(user.id))
    }
  },
  created() {
    Promise.all([this.fetchGroups({ schoolId: this.schoolId }), this.fetchUsers()]).catch(() => {})
  },
  methods: {
    ...mapActions(useUsersStore, ['fetchUsers']),
    ...mapActions(useGroupsStore, ['fetchGroups']),
    goBack() {
      this.$router.push({ name: 'GroupesClasses' })
    },
    openUser(user) {
      this.selectedUser = user
    },
    closeUser() {
      this.selectedUser = null
    },
    addUser() {
      alert('Ajout d\'un étudiant à venir')
    },
    editUser(user) {
      if (!user) return
      this.$router.push({ name: 'UtilisateurEdit', query: { id: user.id } })
    },
    roleIcon(role) {
      const map = {
        Étudiant: new URL('../assets/images/student-blue.svg', import.meta.url).href
      }
      return map[role] || new URL('../assets/images/user.svg', import.meta.url).href
    },
    roleClass(role) {
      if (role === 'Étudiant') return 'role-student'
      return ''
    }
  },
  beforeUnmount() {
    document.body.style.overflow = ''
  }
}
</script>

<style scoped src="../assets/groupes-classes-detail.css"></style>
