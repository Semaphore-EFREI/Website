<template>
  <div class="connexion-page">
    <div class="connexion-background">
      <picture>
        <source
          type="image/avif"
          srcset="../assets/images/connexion_background-w640.avif 640w,
                  ../assets/images/connexion_background-w960.avif 960w,
                  ../assets/images/connexion_background-w1280.avif 1280w,
                  ../assets/images/connexion_background-w1920.avif 1920w,
                  ../assets/images/connexion_background-w2560.avif 2560w"
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcset="../assets/images/connexion_background-w640.webp 640w,
                  ../assets/images/connexion_background-w960.webp 960w,
                  ../assets/images/connexion_background-w1280.webp 1280w,
                  ../assets/images/connexion_background-w1920.webp 1920w,
                  ../assets/images/connexion_background-w2560.webp 2560w"
          sizes="100vw"
        />
        <img
          src="../assets/images/connexion_background-w1280.webp"
          alt="background"
          class="connexion-bg"
          decoding="async"
          fetchpriority="high"
        />
      </picture>

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
        this.errorMessage = this.formatLoginError(error)
      }
    },
    formatLoginError(error) {
      const msg = error?.message || ''
      const raw = typeof error === 'string' ? error : (error?.error || '')
      const text = [msg, raw].join(' ').toLowerCase()

      if (text.includes('invalid_credentials') || text.includes('invalid credentials')) {
        return 'Identifiants incorrects'
      }

      return msg || 'Impossible de se connecter'
    }
  }
}
</script>


<style scoped src="../assets/connexion.css"></style>
