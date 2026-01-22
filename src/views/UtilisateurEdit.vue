<template>
  <main class="edit-user-page">
    <header class="edit-user-header">
      <div class="edit-user-header-left">
        <button class="edit-back-btn" @click="goBack">
            <img src="../assets/images/arrow-left.svg" alt="Retour" />
        </button>
        <h1 class="edit-title">Nouvel utilisateur</h1>
      </div>
      <button
        type="button"
        class="edit-save-btn"
        :disabled="!isFormValid"
        @click="saveUser"
      >
        Enregistrer
      </button>
    </header>
    <form class="edit-user-form" @submit.prevent="saveUser">
      <div class="edit-user-info">
        <div class="edit-user-avatar-block">
            <img :src="user.profilePicture || defaultProfile" alt="Photo de profil" class="edit-user-avatar" />
        </div>
        <div class="edit-user-names">
          <input v-model="user.firstName" placeholder="Prénom" class="edit-input first-name" id="firstName" required />
          <input v-model="user.lastName" placeholder="Nom" class="edit-input last-name" id="lastName" required />
        </div>
        <div class="edit-user-roles">
            <button
              type="button"
              class="role-btn role-student"
              :class="{ selected: user.role === 'Étudiant' }"
              @click="user.role = 'Étudiant'"
            >
              <img :src="roleIcons.student" alt="Étudiant" />
              Étudiant
            </button>
            <button
              type="button"
              class="role-btn role-teacher"
              :class="{ selected: user.role === 'Enseignant' }"
              @click="user.role = 'Enseignant'"
            >
              <img :src="roleIcons.teacher" alt="Enseignant" />
              Enseignant
            </button>
            <button
              type="button"
              class="role-btn role-admin"
              :class="{ selected: user.role === 'Admin' }"
              @click="user.role = 'Admin'"
            >
              <img :src="roleIcons.admin" alt="Admin" />
              Admin
            </button>
        </div>
      </div>
      <fieldset class="edit-user-contact">
        <h2>Contact</h2>
        <div class="edit-user-contact-divider">
            <label for="email" class="edit-input-label">Mail</label>
            <input id="email" v-model="user.email" placeholder="Adresse mail" class="edit-input" type="email" required />
        </div>
        <div class="edit-user-contact-divider">
        <label for="password" class="edit-input-label">Mot de passe</label>
        <input id="password" v-model="user.password" placeholder="••••••••••••••••" class="edit-input" type="password" required />
        </div>
      </fieldset>
    </form>
  </main>
</template>

<script>
import defaultProfile from '../assets/images/user-invert.svg'
import studentIcon from '../assets/images/student-blue.svg'
import teacherIcon from '../assets/images/teacher-green.svg'
import adminIcon from '../assets/images/admin-purple.svg'
import { findUserByKey } from '../utils/user-data'

export default {
  name: 'UtilisateurEdit',
  data() {
    return {
      user: {
        profilePicture: '',
        firstName: '',
        lastName: '',
        role: 'Étudiant',
        email: '',
        password: ''
      },
      defaultProfile,
      roleIcons: {
        student: studentIcon,
        teacher: teacherIcon,
        admin: adminIcon
      }
    }
  },
  created() {
    this.loadUser()
  },
  computed: {
    isFormValid() {
      const { firstName, lastName, email, password } = this.user
      return [firstName, lastName, email, password].every(Boolean)
    }
  },
  watch: {
    '$route.query.userKey': 'loadUser'
  },
  methods: {
    loadUser() {
      const key = this.$route.query.userKey
      const target = findUserByKey(key)
      if (!target) {
        this.user = {
          profilePicture: '',
          firstName: '',
          lastName: '',
          role: 'Étudiant',
          email: '',
          password: ''
        }
        return
      }
      const { firstName, lastName } = target
      this.user = {
        profilePicture: target.profilePicture,
        firstName: firstName || target.name.split(' ')[0] || '',
        lastName: lastName || target.name.split(' ').slice(1).join(' ') || '',
        role: target.role,
        email: target.email || '',
        password: ''
      }
    },
    goBack() {
      this.$router.push({ name: 'Utilisateurs' })
    },
    saveUser() {
      if (!this.isFormValid) {
        return
      }
      // À implémenter : sauvegarde
      alert('Utilisateur enregistré (simulation)')
      this.goBack()
    }
  }
}
</script>

<style scoped src="../assets/utilisateur-edit.css"></style>
