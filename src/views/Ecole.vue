<template>
  <main class="users-page">
    <div class="users-header">
      <picture>
        <source
          type="image/avif"
          srcset="../assets/images/school-background-w640.avif 640w,
                  ../assets/images/school-background-w960.avif 960w,
                  ../assets/images/school-background-w1280.avif 1280w,
                  ../assets/images/school-background-w1920.avif 1920w,
                  ../assets/images/school-background-w2560.avif 2560w"
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcset="../assets/images/school-background-w640.webp 640w,
                  ../assets/images/school-background-w960.webp 960w,
                  ../assets/images/school-background-w1280.webp 1280w,
                  ../assets/images/school-background-w1920.webp 1920w,
                  ../assets/images/school-background-w2560.webp 2560w"
          sizes="100vw"
        />
        <img
          src="../assets/images/school-background-w1280.webp"
          alt="background"
          class="header-bg"
          decoding="async"
          fetchpriority="high"
        />
      </picture>

      <div class="header-buttons-empty">
        <!-- No buttons needed here -->
      </div>
      <div class="header-content">
        <img src="../assets/images/school-white.svg" alt="École" class="userG-icon" />
        <h1 class="header-title">École</h1>
      </div>
    </div>

    <div class="users-content school-content">
      <h1 class="school-name">{{ schoolName }}</h1>
      <section class="role-cta">
        <button
          v-for="section in sections"
          :key="section.label"
          class="card"
          type="button"
          @click="openSection(section.section)"
        >
          <img :src="section.icon" :alt="section.label" class="icon student-icon" />
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
import { useSchoolsStore } from '../stores/schools'
import { useAuthStore } from '../stores/auth'
import roomsIcon from '../assets/images/rooms.svg'
import balisesIcon from '../assets/images/balises.svg'
import settingsIcon from '../assets/images/settings.svg'

export default {
  name: 'Ecole',
  data() {
    return {
      sections: [
        { label: 'Salles', section: 'salles', icon: roomsIcon },
        { label: 'Balises', section: 'balises', icon: balisesIcon },
        { label: 'Paramètres', section: 'parametres', icon: settingsIcon }
      ],
      schoolsStore: useSchoolsStore(),
      authStore: useAuthStore()
    }
  },
  computed: {
    schoolName() {
      return this.schoolsStore.selectedSchool?.name || 'EFREI Paris'
    }
  },
  async mounted() {
    const schoolId = this.authStore.user?.schoolId || this.authStore.user?.schoolID || this.authStore.user?.school?.id
    if (schoolId) {
      this.schoolsStore.selectSchool(schoolId)
      try {
        await this.schoolsStore.fetchSchool(schoolId)
      } catch (_err) {
        // Swallow error; UI will keep fallback name
      }
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
