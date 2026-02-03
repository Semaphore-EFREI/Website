<template>
  <nav class="bottom-nav">
    <div class="nav">
      <button
        v-for="item in mobileNavItems"
        :key="item.label"
        class="nav-item"
        :class="{ active: isActive(item) }"
        type="button"
        @click="handleNav(item)"
        :title="item.label"
      >
        <span
          v-if="item.icon && processedIcons[item.icon]"
          class="nav-icon"
          v-html="processedIcons[item.icon]"
        ></span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script>
import { mapActions } from 'pinia'
import calendrierIcon from '../assets/images/calendrier_black.svg?raw'
import userAltIcon from '../assets/images/useralt-black.svg?raw'
import groupIcon from '../assets/images/group.svg?raw'
import schoolIcon from '../assets/images/school.svg?raw'
import userIcon from '../assets/images/user.svg?raw'
import { useAuthStore } from '../stores'

export default {
  name: 'BottomNav',
  data() {
    return {
      rawIcons: {
        calendrier_black: calendrierIcon,
        'useralt-black': userAltIcon,
        group: groupIcon,
        school: schoolIcon,
        user: userIcon
      },
      mobileNavItems: [
        { label: 'Calendrier', routeName: 'Calendrier', icon: 'calendrier_black' },
        { label: 'Utilisateurs', routeName: 'Utilisateurs', icon: 'useralt-black' },
        { label: 'Groupes', routeName: 'GroupesClasses', icon: 'group' },
        { label: 'École', routeName: 'Ecole', icon: 'school' },
        { label: 'Déconnexion', routeName: null, icon: 'user', logout: true }
      ]
    }
  },
  computed: {
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
  methods: {
    ...mapActions(useAuthStore, ['logout']),
    isActive(item) {
      if (!item?.routeName) return false
      if (item.routeName === 'Calendrier' && this.$route.name === 'CalendrierDetail') return true
      if (item.routeName === 'Utilisateurs' && this.$route.name === 'UtilisateurEdit') return true
      if (item.routeName === 'GroupesClasses' && this.$route.name === 'GroupesClassesDetail') return true
      if (item.routeName === 'Ecole' && this.$route.name === 'EcoleSection') return true
      return this.$route.name === item.routeName
    },
    async handleNav(item) {
      if (item.logout) {
        try {
          await this.logout()
        } finally {
          this.$router.push({ name: 'Connexion' }).catch(() => {})
        }
        return
      }

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
    }
  }
}
</script>

<style scoped src="../assets/bottom-nav.css"></style>
