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
        <img v-if="item.icon" :src="getIcon(item.icon)" class="nav-icon" :alt="item.label" />
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'BottomNav',
  data() {
    return {
      mobileNavItems: [
        { label: 'Calendrier', routeName: 'Calendrier', icon: 'calendrier_black' },
        { label: 'Utilisateurs', routeName: 'Utilisateurs', icon: 'user' },
        { label: 'Groupes', routeName: 'GroupesClasses', icon: 'group' },
        { label: 'École', routeName: 'Ecole', icon: 'school' },
        { label: 'Mon Compte', routeName: 'UtilisateurEdit', icon: 'user' }
      ]
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
    isActive(item) {
      if (!item?.routeName) return false
      if (item.routeName === 'Calendrier' && this.$route.name === 'CalendrierDetail') return true
      if (item.routeName === 'Utilisateurs' && this.$route.name === 'UtilisateurEdit') return true
      if (item.routeName === 'GroupesClasses' && this.$route.name === 'GroupesClassesDetail') return true
      if (item.routeName === 'Ecole' && this.$route.name === 'EcoleSection') return true
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
    }
  }
}
</script>

<style scoped src="../assets/bottom-nav.css"></style>
