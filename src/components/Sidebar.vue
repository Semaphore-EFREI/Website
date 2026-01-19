<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-top">
      <button class="sidebar-toggle" type="button" @click="toggleSidebar" aria-label="Réduire la barre latérale">
        <span v-if="!collapsed"><img src="../assets/images/sidebar.svg" alt="sidebar open"/></span>
        <span v-else><img src="../assets/images/sidebar.svg" alt="sidebar closed" /></span>
      </button>

      <nav class="sidebar-nav">
        <div v-for="item in navItems" :key="item.label" class="nav-item-wrapper">
          <div class="nav-item-row">
            <button
              class="nav-link"
              :class="{ active: isActive(item) }"
              type="button"
              @click="handleNav(item)"
            >
              <img v-if="item.icon" :src="getIcon(item.icon)" class="nav-icon" :alt="item.label" />
              <span class="link-label">{{ item.label }}</span>
            </button>
            <button
              v-if="item.children"
              class="expand-btn"
              :class="{ expanded: isGroupExpanded(item.label) }"
              type="button"
              @click="toggleGroup(item.label)"
              aria-label="Expand/collapse"
            >
              <img src="../assets/images/arrow-left.svg" style="transform: rotate(90deg);" alt="toggle" class="sidebar-btn" />
            </button>
          </div>

          <div v-if="item.children && isGroupExpanded(item.label)" class="sub-items">
            <button
              v-for="child in item.children"
              :key="child.label"
              class="nav-link sub-link"
              type="button"
            >
              <img v-if="child.icon" :src="getIcon(child.icon)" class="nav-icon" :alt="child.label" />
              <span class="link-label">{{ child.label }}</span>
            </button>
          </div>
        </div>
      </nav>
    </div>

    <div class="sidebar-user">
      <div class="user-avatar">{{ userInitials }}</div>
      <div class="user-info">
        <div class="user-name">{{ user.name }}</div>
        <button class="logout-link" type="button" @click="logout">Déconnexion</button>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  emits: ['collapsed-change'],
  data() {
    return {
      collapsed: false,
      expandedGroups: ['Utilisateurs', "L'école"],
      navItems: [
        { label: 'Calendrier', routeName: 'Calendrier', icon: 'calendrier_black' },
        { label: 'Utilisateurs', routeName: 'Utilisateurs', icon: 'user' ,
          children: [
            { label: 'Étudiants' },
            { label: 'Enseignants' },
            { label: 'Administrateurs' }
          ]},
        { label: 'Groupes et Classes', icon: 'group' },
        {
          label: "L'école",
          icon: 'school',
          children: [
            { label: 'Salles' },
            { label: 'Balises' },
            { label: 'Paramètres' }
          ]
        }
      ],
      user: {
        name: 'Jean Lassalle'
      }
    }
  },
  computed: {
    userInitials() {
      return this.user.name
        .split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    }
  },
  methods: {
    getIcon(name) {
      try {
        return new URL(`../assets/images/${name}.svg`, import.meta.url).href
      } catch (e) {
        return ''
      }
    },
    toggleSidebar() {
      this.collapsed = !this.collapsed
      this.$emit('collapsed-change', this.collapsed)
    },
    toggleGroup(label) {
      const index = this.expandedGroups.indexOf(label)
      if (index > -1) {
        this.expandedGroups.splice(index, 1)
      } else {
        this.expandedGroups.push(label)
      }
    },
    isGroupExpanded(label) {
      return this.expandedGroups.includes(label)
    },
    isActive(item) {
      if (!item.routeName) return false
      if (item.routeName === 'Calendrier' && this.$route.name === 'CalendrierDetail') return true
      if (item.routeName === 'Utilisateurs' && this.$route.name === 'UtilisateurEdit') return true
      return this.$route.name === item.routeName
    },
    handleNav(item) {
      if (!item.routeName) return
      if (this.$route.name === item.routeName) return
      this.$router.push({ name: item.routeName }).catch(() => {})
    },
    logout() {
      this.$router.push({ name: 'Connexion' })
    }
  }
}
</script>

<style scoped src="../assets/sidebar.css"></style>
