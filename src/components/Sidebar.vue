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
              <span
                v-if="item.icon && processedIcons[item.icon]"
                class="nav-icon"
                v-html="processedIcons[item.icon]"
                :aria-label="item.label"
              ></span>
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
              :class="{ active: isActive(child) }"
              type="button"
              @click="handleNav(child)"
            >
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
import calendrierIcon from '../assets/images/calendrier_black.svg?raw'
import userAltIcon from '../assets/images/useralt-black.svg?raw'
import groupIcon from '../assets/images/group.svg?raw'
import schoolIcon from '../assets/images/school.svg?raw'
import userIcon from '../assets/images/user.svg?raw'
import studentIcon from '../assets/images/student.svg?raw'
import teacherIcon from '../assets/images/teacher.svg?raw'
import adminIcon from '../assets/images/admin.svg?raw'

export default {
  name: 'Sidebar',
  emits: ['collapsed-change'],
  data() {
    return {
      collapsed: false,
      expandedGroups: ['Utilisateurs', "L'école"],
      rawIcons: {
        calendrier_black: calendrierIcon,
        'useralt-black': userAltIcon,
        group: groupIcon,
        school: schoolIcon,
        user: userIcon,
        'student-blue': studentIcon,
        'teacher-green': teacherIcon,
        'admin-purple': adminIcon
      },
      navItems: [
        { label: 'Calendrier', routeName: 'Calendrier', icon: 'calendrier_black' },
        {
          label: 'Utilisateurs',
          routeName: 'Utilisateurs',
          icon: 'useralt-black',
          children: [
            { label: 'Étudiants', routeName: 'Etudiants', icon: 'student-blue' },
            { label: 'Enseignants', routeName: 'Enseignants', icon: 'teacher-green' },
            { label: 'Admins', routeName: 'Admins', icon: 'admin-purple' }
          ]
        },
        { label: 'Groupes et Classes', routeName: 'GroupesClasses', icon: 'group' },
        {
          label: "L'école",
          routeName: 'Ecole',
          icon: 'school',
          children: [
            { label: 'Salles', routeName: 'EcoleSection', params: { section: 'salles' } },
            { label: 'Balises', routeName: 'EcoleSection', params: { section: 'balises' } },
            { label: 'Paramètres', routeName: 'EcoleSection', params: { section: 'parametres' } }
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
    },
    processedIcons() {
      const sanitize = (svg) =>
        svg
          .replace(/fill="[^"]*"/gi, 'fill="currentColor"')
          .replace(/stroke="[^"]*"/gi, 'stroke="currentColor"')
          .replace(/style="[^"]*"/gi, '')
      return Object.fromEntries(
        Object.entries(this.rawIcons).map(([key, value]) => [key, sanitize(value)])
      )
    }
  },
  watch: {
    collapsed(value) {
      this.syncBodyClass(value)
    }
  },
  mounted() {
    this.syncBodyClass(this.collapsed)
  },
  beforeUnmount() {
    document.body.classList.remove('sidebar-expanded', 'sidebar-collapsed')
  },
  methods: {
    syncBodyClass(collapsed) {
      document.body.classList.toggle('sidebar-expanded', !collapsed)
      document.body.classList.toggle('sidebar-collapsed', collapsed)
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
      if (!item?.routeName) return false
      if (item.routeName === 'Calendrier' && this.$route.name === 'CalendrierDetail') return true
      if (item.routeName === 'Utilisateurs' && this.$route.name === 'UtilisateurEdit') return true
      if (item.routeName === 'GroupesClasses' && this.$route.name === 'GroupesClassesDetail') return true
      if (item.routeName === 'EcoleSection' && this.$route.name === 'EcoleSection') {
        if (!item.params) return true
        return Object.entries(item.params).every(([key, value]) => this.$route.params[key] === value)
      }
      return this.$route.name === item.routeName
    },
    handleNav(item) {
      if (!item.routeName) return
      if (this.$route.name === item.routeName) {
        if (!item.params) return
        const matches = Object.entries(item.params).every(([key, value]) => this.$route.params[key] === value)
        if (matches) return
      }
      const route = { name: item.routeName }
      if (item.params) {
        route.params = { ...item.params }
      }
      this.$router.push(route).catch(() => {})
    },
    logout() {
      this.$router.push({ name: 'Connexion' })
    }
  }
}
</script>

<style scoped src="../assets/sidebar.css"></style>