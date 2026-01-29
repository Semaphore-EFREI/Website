<template>
  <div class="connexion-page">
    <div class="connexion-background">
      <img src="../assets/images/connexion_background.svg" alt="background" />
    </div>

    <div class="connexion-card">
      <h1 class="connexion-title">Sémaphore</h1>
      
      <form @submit.prevent="handleconnexion" class="form-group">
        <div class="form-subgroup">
          <label for="username">Identifiant</label>
          <input id="username" v-model="username" type="email" placeholder="etudiant@semaphore.com" required />
        </div>

        <div class="form-subgroup">
          <label for="password">Mot de passe</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••••••••••" required />
        </div>

        <button type="submit" class="connexion-button" :disabled="loading">
          <span v-if="loading">Connexion...</span>
          <span v-else>Se Connecter</span>
        </button>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useAuthStore } from '../stores'

export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: null
    }
  },
  computed: {
    ...mapState(useAuthStore, ['loading'])
  },
  methods: {
    ...mapActions(useAuthStore, ['login']),
    async handleconnexion() {
      this.errorMessage = null
      try {
        await this.login({
          email: this.username,
          password: this.password
        })
        this.$router.push({ name: 'Calendrier' })
      } catch (error) {
        this.errorMessage = error?.message || 'Impossible de se connecter'
      }
    }
  }
}
</script>


<style scoped src="../assets/connexion.css"></style>