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
          <div class="user-card" v-for="user in filteredUsers" :key="user.key">
            <img src="../assets/images/user-grey.svg" alt="user" class="user-icon" />
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
import groupsData from '../assets/json/groupes.json'
import attendanceTeachers from '../assets/json/attendance-teachers.json'
import adminsData from '../assets/json/admins.json'

export default {
  name: 'Utilisateurs',
  data() {
    return {
      searchQuery: ''
    }
  },
  computed: {
    users() {
      const students = Object.values(groupsData)
        .flat()
        .map(student => ({
          key: `student-${student.id}`,
          name: `${student.firstName} ${student.lastName}`,
          role: 'Étudiant'
        }))

      const teachers = Array.from(
        new Set(attendanceTeachers.map(t => t.teacher))
      ).map((teacher, index) => ({
        key: `teacher-${index}`,
        name: teacher,
        role: 'Enseignant'
      }))

      const admins = (adminsData?.administrators || []).map((admin, index) => ({
        key: `admin-${index}`,
        name: admin,
        role: 'Admin'
      }))

      return [...students, ...teachers, ...admins]
    },
    filteredUsers() {
      const query = this.searchQuery.trim().toLowerCase()
      if (!query) return this.users
      return this.users.filter(user => user.name.toLowerCase().includes(query))
    }
  },
  methods: {
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
  }
}
</script>


<style scoped src="../assets/utilisateurs.css"></style>