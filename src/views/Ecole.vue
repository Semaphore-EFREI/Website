<template>
  <main class="users-page">
    <div class="users-header">
      <img src="../assets/images/school-background.svg" alt="background" class="header-bg" />
      <div class="header-buttons-empty">
        <!-- No buttons needed here -->
      </div>
      <div class="header-content">
        <img src="../assets/images/school-white.svg" alt="École" class="userG-icon" />
        <h1 class="header-title">École</h1>
      </div>
    </div>

    <div class="users-content school-content">
      <h1>EFREI Paris</h1>
      <section class="role-cta">
        <button
          v-for="section in sections"
          :key="section.label"
          class="card"
          type="button"
          @click="openSection(section.section)"
        >
          <img :src="section.icon" :alt="section.label" class="student-icon" />
          <div class="card-text">
            <div class="label">{{ section.label }}</div>
            <img src="../assets/images/arrow-right.svg" alt="arrow" class="arrow-icon" />
          </div>
        </button>
      </section>
    </div>
  </main>
</template>

<script>
export default {
  name: 'Ecole',
  data() {
    return {
      sections: [
        { label: 'Salles', section: 'salles', icon: 'src/assets/images/rooms.svg' },
        { label: 'Balises', section: 'balises', icon: 'src/assets/images/balises.svg' },
        { label: 'Paramètres', section: 'parametres', icon: 'src/assets/images/settings.svg' }
      ]
    }
  },
  methods: {
    openSection(section) {
      if (!section) return
      this.$router.push({ name: 'EcoleSection', params: { section } }).catch(() => {})
    }
  }
}
</script>

<style scoped src="../assets/utilisateurs.css"></style>
