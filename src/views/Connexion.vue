<template>
  <div class="login-page">
    <div class="login-background">
      <img src="../assets/images/login_background.svg" alt="background" />
    </div>

    <div class="login-card">
      <h1 class="login-title">Sémaphore</h1>
      
      <form @submit.prevent="handleLogin" class="form-group">
        <div class="form-subgroup">
          <label for="username">Identifiant</label>
          <input id="username" v-model="username" type="text" placeholder="etudiant@semaphore.com" required />
        </div>

        <div class="form-subgroup">
          <label for="password">Mot de passe</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••••••••••" required />
        </div>

        <button type="submit" class="login-button">Se Connecter</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    handleLogin() {
      console.log('Login attempt', this.username, this.password)
      // Pour l'instant, juste une redirection fake vers le calendrier
      this.$router.push('/calendrier')
    }
  }
}
</script>


<style scoped src="../assets/connexion.css"></style>