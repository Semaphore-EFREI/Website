<template>
  <main class="edit-user-page">
    <header class="edit-user-header">
      <div class="edit-user-header-left">
        <button class="edit-back-btn" @click="goBack">
            <img src="../assets/images/arrow-left.svg" alt="Retour" />
        </button>
        <h1 class="edit-title">Nouvel utilisateur</h1>
      </div>
      <button class="edit-save-btn" @click="saveUser">Enregistrer</button>
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
            <button type="button" :class="['role-btn', { selected: user.role === 'Étudiant' }]" @click="user.role = 'Étudiant'">Étudiant</button>
            <button type="button" :class="['role-btn', { selected: user.role === 'Enseignant' }]" @click="user.role = 'Enseignant'">Enseignant</button>
            <button type="button" :class="['role-btn', { selected: user.role === 'Admin' }]" @click="user.role = 'Admin'">Admin</button>
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
        <input id="password" v-model="user.password" placeholder="Mot de passe" class="edit-input" type="password" required />
        </div>
      </fieldset>
    </form>
  </main>
</template>

<script>
import defaultProfile from '../assets/images/user-invert.svg'
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
      defaultProfile
    }
  },
  created() {
    this.loadUser()
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
      // À implémenter : sauvegarde
      alert('Utilisateur enregistré (simulation)')
      this.goBack()
    }
  }
}
</script>

<style scoped src="../assets/utilisateur-edit.css"></style>
