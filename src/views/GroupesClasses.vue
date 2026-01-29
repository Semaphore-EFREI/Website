<template>
  <main class="users-page groups-page">
    <div class="users-header">
      <img src="../assets/images/group-background.svg" alt="background" class="header-bg" />
      <div class="header-buttons">
        <button class="btn-new-course" type="button" @click="createCourse">
          <img src="../assets/images/plus-sign.svg" alt="plus" class="plus-icon" />Nouveau Groupe
        </button>
      </div>
      <div class="header-content">
        <img src="../assets/images/group-white.svg" alt="groupes" class="userG-icon" />
        <h1 class="header-title">Groupes et Classes</h1>
      </div>
    </div>

    <div class="users-content">
      <section class="all-groups">
        <div class="group-cards">
          <article
            v-for="group in groupsView"
            :key="group.name"
            class="group-card"
            @click="openGroup(group.name)"
          >
            <img src="../assets/images/group-big.svg" alt="group" class="group-img" />
            <div class="group-info">
                <div class="group-name">{{ group.name }}</div>
                <div class="group-count">{{ group.count }} personnes</div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useGroupsStore, useAuthStore } from '../stores'

export default {
  name: 'GroupesClasses',
  data() {
    return {
      
    }
  },
  computed: {
    ...mapState(useGroupsStore, ['groups']),
    ...mapState(useAuthStore, { currentUser: 'user' }),
    schoolId() {
      return this.currentUser?.schoolId || this.currentUser?.school_id || this.currentUser?.school?.id || null
    },
    groupsView() {
      return this.groups
        .map(group => ({ name: group.name, count: Array.isArray(group.studentIds) ? group.studentIds.length : 0 }))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }
  },
  created() {
    this.fetchGroups({ schoolId: this.schoolId }).catch(() => {})
  },
  methods: {
    ...mapActions(useGroupsStore, ['fetchGroups']),
    createCourse() {
      alert('Création de cours à venir')
    },
    openGroup(name) {
      if (!name) return
      this.$router.push({ name: 'GroupesClassesDetail', params: { groupName: name } })
    }
  }
}
</script>

<style scoped src="../assets/groupes-classes.css"></style>
