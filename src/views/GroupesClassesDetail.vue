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
        <img src="../assets/images/plus-sign-white.svg" alt="Selection" class="plus-icon" />
        Sélectionner des étudiants
      </button>
    </header>

    <section class="role-users-grid">
      <div class="user-cards">
        <article v-for="user in students" :key="user.id || user.key" class="user-card" @click="openUser(user)">
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
          <img
            :src="selectedUser.profilePicture || defaultProfile"
            alt="Photo de profil"
            width="96"
            height="96"
            loading="lazy"
            decoding="async"
          />
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

  <div v-if="showStudentModal" class="group-student-modal" @click.self="closeStudentModal">
    <div class="group-student-modal__panel">
      <header class="group-student-modal__header">
        <div class="group-student-modal__row">
          <div class="group-student-modal__back">
            <button class="group-student-modal__btn group-student-modal__btn--ghost" type="button" @click="closeStudentModal">
              <img src="../assets/images/arrow-left.svg" alt="Retour" />
            </button>
          </div>
          <h3>Sélection des étudiants</h3>
          <div class="group-student-modal__save">
            <button
              class="group-student-modal__btn group-student-modal__btn--primary"
              type="button"
              :aria-busy="isSavingStudents"
              :disabled="isSavingStudents"
              @click="saveStudentSelection"
            >
              <img src="../assets/images/check-white.svg" alt="Valider" />
            </button>
          </div>
        </div>
        <div class="group-student-modal__search">
          <div class="group-student-modal__search-wrapper">
            <input
              v-model="studentSearch"
              type="search"
              placeholder="Marc DUPONT"
              class="group-student-modal__search-input"
            />
            <button class="group-student-modal__search-icon" type="button" aria-label="Rechercher">
              <img src="../assets/images/search.svg" alt="" />
            </button>
          </div>
        </div>
      </header>
      <div class="group-student-modal__grid">
        <div class="group-student-modal__group">
          <p>Étudiants</p>
          <div class="group-student-modal__pillgrid">
            <button
              v-for="student in filteredStudentOptions"
              :key="student.id"
              type="button"
              class="group-student-modal__pill"
              :class="{ active: studentDraft.includes(String(student.id)) }"
              @click="toggleStudentDraft(student.id)"
            >
              <span>{{ student.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import defaultProfile from '../assets/images/user-invert.svg'
import { useUsersStore, useGroupsStore, useAuthStore } from '../stores'
import { request } from '../stores/apiClient'

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
      defaultProfile,
      showStudentModal: false,
      studentSearch: '',
      studentDraft: [],
      isSavingStudents: false
    }
  },
  computed: {
    ...mapState(useUsersStore, ['users']),
    ...mapState(useGroupsStore, ['groups']),
    ...mapState(useAuthStore, { currentUser: 'user' }),
    schoolId() {
      return this.currentUser?.schoolId || this.currentUser?.school_id || this.currentUser?.school?.id || null
    },
    groupId() {
      return this.$route?.query?.id || null
    },
    group() {
      if (this.groupId) {
        return this.groups.find(g => String(g.id) === String(this.groupId)) || null
      }
      return this.groups.find(g => g.name === this.groupName) || null
    },
    groupStudentIds() {
      if (!this.group) return []
      const fromObjects = Array.isArray(this.group.students)
        ? this.group.students.map((s) => s?.id || s?.studentId || s?.userId).filter(Boolean)
        : []
      const fromIds = Array.isArray(this.group.studentIds) ? this.group.studentIds : []
      return [...new Set([...fromIds, ...fromObjects])].filter(Boolean)
    },
    studentOptions() {
      return this.users
        .filter(user => ['Étudiant', 'student'].includes(user.role))
        .map((user) => ({ id: user.id, name: user.name || `${user.firstName || user.firstname || ''} ${user.lastName || user.lastname || ''}`.trim() }))
        .filter((u) => u.name)
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    filteredStudentOptions() {
      const q = this.studentSearch.trim().toLowerCase()
      return this.studentOptions.filter((opt) => !q || opt.name.toLowerCase().includes(q))
    },
    students() {
      if (!this.group) return []
      const ids = this.groupStudentIds
      return this.users
        .filter(user => ['Étudiant', 'student'].includes(user.role))
        .filter(user => ids.includes(user.id))
    }
  },
  created() {
    this.initialize()
  },
  methods: {
    ...mapActions(useUsersStore, ['fetchUsers', 'fetchUserProfile']),
    ...mapActions(useGroupsStore, ['fetchGroups', 'fetchGroup']),
    async initialize() {
      try {
        await this.fetchUsers()
      } catch (error) {
        console.error('Unable to fetch users', error)
      }

      try {
        if (this.groupId) {
          await this.fetchGroup(this.groupId, { include: 'students' })
        } else {
          await this.fetchGroups({ schoolId: this.schoolId })
        }
      } catch (error) {
        console.error('Unable to fetch group', error)
      }
    },
    goBack() {
      this.$router.push({ name: 'GroupesClasses' })
    },
    async openUser(user) {
      try {
        const enrichedUser = await this.fetchUserProfile(user.id, user.role)
        this.selectedUser = enrichedUser
      } catch (error) {
        console.error('Unable to load user profile:', error)
        this.selectedUser = user
      }
    },
    closeUser() {
      this.selectedUser = null
    },
    addUser() {
      this.studentDraft = [...this.groupStudentIds]
      this.studentSearch = ''
      this.showStudentModal = true
    },
    closeStudentModal() {
      this.showStudentModal = false
    },
    toggleStudentDraft(id) {
      const strId = String(id)
      if (this.studentDraft.includes(strId)) {
        this.studentDraft = this.studentDraft.filter((sid) => sid !== strId)
      } else {
        this.studentDraft = [...this.studentDraft, strId]
      }
    },
    async saveStudentSelection() {
      if (!this.groupId) return
      const current = this.groupStudentIds.map(String)
      const next = this.studentDraft.map(String)
      const added = next.filter((id) => !current.includes(id))
      const removed = current.filter((id) => !next.includes(id))
      if (!added.length && !removed.length) {
        this.showStudentModal = false
        return
      }
      this.isSavingStudents = true
      try {
        if (added.length) {
          await request(`/studentGroup/${this.groupId}/students`, { method: 'POST', data: { studentsIds: added } })
        }
        if (removed.length) {
          await Promise.all(
            removed.map((id) => request(`/studentGroup/${this.groupId}/student/${id}`, { method: 'DELETE' }))
          )
        }
        await this.fetchGroup(this.groupId, { include: 'students' })
        this.showStudentModal = false
      } catch (error) {
        console.error('Unable to update students', error)
      } finally {
        this.isSavingStudents = false
      }
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
