<template>
  <div class="app-shell">
    <Sidebar v-if="showSidebar" @collapsed-change="sidebarCollapsed = $event" />
    <BottomNav v-if="showSidebar" />
    <main class="app-main" :class="mainClasses">
      <router-view />
    </main>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import Sidebar from './components/Sidebar.vue'
import BottomNav from './components/BottomNav.vue'
import { useAuthStore } from './stores/auth'

export default {
  components: { Sidebar, BottomNav },
  data() {
    return {
      sidebarCollapsed: false
    }
  },
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated']),
    showSidebar() {
      return this.isAuthenticated && this.$route.name !== 'Connexion'
    },
    mainClasses() {
      return {
        'with-sidebar': this.showSidebar,
        'sidebar-collapsed': this.showSidebar && this.sidebarCollapsed
      }
    }
  },
  created() {
    if (!this.isAuthenticated && this.$route.name !== 'Connexion') {
      this.$router.replace({ name: 'Connexion' }).catch(() => {})
    }
  },
  watch: {
    isAuthenticated(newVal) {
      // Si l'utilisateur se déconnecte (token devient null), rediriger vers connexion
      if (!newVal && this.$route.name !== 'Connexion') {
        this.$router.push({ name: 'Connexion' });
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
  margin-left: 21.75rem;
  transition: margin-left 0.2s ease;
}

.app-main.sidebar-collapsed :deep(.calendrier-all) {
  margin-left: 0;
  max-width: 100%;
  transition: margin-left 0.2s ease, max-width 0.2s ease;
}

/* Same push for calendrier detail page; also reduce available width to prevent overflow */
.app-main.with-sidebar :deep(.detail-page) {
  margin-left: clamp(5.5rem, 18vw, 21.75rem);
  max-width: calc(100% - clamp(5.5rem, 18vw, 21.75rem));
  transition: margin-left 0.2s ease, max-width 0.2s ease;
}

.app-main.sidebar-collapsed :deep(.detail-page),
.app-main.sidebar-collapsed :deep(.edit-user-page) {
  margin-left: 10rem;
  max-width: calc(100% - 10rem);
  transition: margin-left 0.2s ease, max-width 0.2s ease;
}

/* Push only the users content area; keep header full width under the sidebar */
.app-main.with-sidebar :deep(.users-content) {
  margin-left: clamp(5.5rem, 18vw, 21.75rem);
  max-width: calc(100% - clamp(5.5rem, 18vw, 21.75rem));
  transition: margin-left 0.2s ease, max-width 0.2s ease;
}

.app-main.sidebar-collapsed :deep(.users-content) {
  margin-left: 0;
  max-width: 100%;
  transition: margin-left 0.2s ease, max-width 0.2s ease;
}

.app-main.with-sidebar :deep(.edit-user-page) {
  margin-left: clamp(5.5rem, 18vw, 21.75rem);
  max-width: calc(100% - clamp(5.5rem, 18vw, 21.75rem));
  transition: margin 0.2s ease;
}

.app-main.sidebar-collapsed :deep(.edit-user-page) {
  margin-left: 10rem;
  max-width: calc(100% - 10rem);
  transition: margin 0.2s ease;
}

/* Mobile layout adjustments for bottom nav */
@media (max-width: 50rem) {
  .app-main {
    padding-bottom: 5rem;
  }

  .app-main.with-sidebar :deep(.calendrier-all),
  .app-main.with-sidebar :deep(.detail-page),
  .app-main.with-sidebar :deep(.users-content),
  .app-main.with-sidebar :deep(.edit-user-page),
  .app-main.sidebar-collapsed :deep(.calendrier-all),
  .app-main.sidebar-collapsed :deep(.detail-page),
  .app-main.sidebar-collapsed :deep(.users-content),
  .app-main.sidebar-collapsed :deep(.edit-user-page) {
    margin-left: 0;
    max-width: 100%;
  }
}

/* Between mobile (50rem/800px) and desktop - sidebar visible, content should be squeezed */
@media (max-width: 60rem) and (min-width: 50rem) {
  .app-main.with-sidebar :deep(.calendrier-all) {
    margin-left: 21.75rem;
  }

  .app-main.with-sidebar :deep(.detail-page),
  .app-main.with-sidebar :deep(.users-content),
  .app-main.with-sidebar :deep(.edit-user-page) {
    margin-left: 21.75rem;
    max-width: calc(100% - 21.75rem);
  }

  .app-main.sidebar-collapsed :deep(.calendrier-all) {
    margin-left: 0;
    max-width: 100%;
  }

  .app-main.sidebar-collapsed :deep(.detail-page),
  .app-main.sidebar-collapsed :deep(.users-content),
  .app-main.sidebar-collapsed :deep(.edit-user-page) {
    margin-left: 5rem;
    max-width: calc(100% - 5rem);
  }
}

/* Fix overlap where clamp doesn't allocate enough space */
@media (min-width: 800px) and (max-width: 1700px) {
  .app-main.with-sidebar :deep(.detail-page),
  .app-main.with-sidebar :deep(.users-content),
  .app-main.with-sidebar :deep(.edit-user-page) {
    margin-left: 21.75rem;
    max-width: calc(100% - 21.75rem);
  }

  .app-main.sidebar-collapsed :deep(.detail-page),
  .app-main.sidebar-collapsed :deep(.users-content),
  .app-main.sidebar-collapsed :deep(.edit-user-page) {
    margin-left: 5rem;
    max-width: calc(100% - 5rem);
  }
}
</style>
