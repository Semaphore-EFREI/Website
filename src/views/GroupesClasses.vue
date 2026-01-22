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
            v-for="group in groups"
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
import studentsData from '../assets/json/etudiants.json'

export default {
  name: 'GroupesClasses',
  data() {
    return {
      students: studentsData
    }
  },
  computed: {
    groups() {
      const accumulator = {}
      this.students.forEach(student => {
        const studentGroups = Array.isArray(student.group)
          ? student.group
          : student.group
            ? [student.group]
            : []
        studentGroups.forEach(name => {
          if (!name) return
          accumulator[name] = (accumulator[name] || 0) + 1
        })
      })
      return Object.entries(accumulator)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name))
    }
  },
  methods: {
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
