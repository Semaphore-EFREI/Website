<template>
  <div class="app-shell">
    <Sidebar v-if="showSidebar" @collapsed-change="sidebarCollapsed = $event" />
    <main class="app-main" :class="mainClasses">
      <router-view />
    </main>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'

export default {
  components: { Sidebar },
  data() {
    return {
      sidebarCollapsed: false
    }
  },
  computed: {
    showSidebar() {
      return this.$route.name !== 'Connexion'
    },
    mainClasses() {
      return {
        'with-sidebar': this.showSidebar,
        'sidebar-collapsed': this.showSidebar && this.sidebarCollapsed
      }
    }
  }
}
</script>

<style scoped>
.app-shell {
  position: relative;
  display: block;
  min-height: 100vh;
  background: var(--Fond-Primaire, #FAF9F6);
}

.app-main {
  min-height: 100vh;
  width: 100%;
}

/* Push only the content area to the right, keep header full width */
.app-main.with-sidebar :deep(.calendrier-all) {
  margin-left: 348px;
  transition: margin-left 0.2s ease;
}

.app-main.sidebar-collapsed :deep(.calendrier-all) {
  margin-left: 88px;
  transition: margin-left 0.2s ease;
}
</style>
