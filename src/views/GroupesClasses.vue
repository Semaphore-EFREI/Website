<template>
  <main class="users-page groups-page">
    <div class="users-header">
      <picture>
        <source
          type="image/avif"
          srcset="../assets/images/group-background-w640.avif 640w,
                  ../assets/images/group-background-w960.avif 960w,
                  ../assets/images/group-background-w1280.avif 1280w,
                  ../assets/images/group-background-w1920.avif 1920w,
                  ../assets/images/group-background-w2560.avif 2560w"
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcset="../assets/images/group-background-w640.webp 640w,
                  ../assets/images/group-background-w960.webp 960w,
                  ../assets/images/group-background-w1280.webp 1280w,
                  ../assets/images/group-background-w1920.webp 1920w,
                  ../assets/images/group-background-w2560.webp 2560w"
          sizes="100vw"
        />
        <img
          src="../assets/images/group-background-w1280.webp"
          alt="background"
          class="header-bg"
          decoding="async"
          fetchpriority="high"
        />
      </picture>

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
            @click="openGroup(group.name, group.id)"
          >
            <img src="../assets/images/group-big.svg" alt="group" class="group-img" />
            <div class="group-info">
                <div class="group-name">{{ group.name }}</div>
                <div class="group-count">{{ group.count }} personnes</div>
            </div>
            <div class="group-actions">
              <button class="group-action group-action--edit" type="button" @click.stop="openEditModal(group)">
                <img src="../assets/images/modify.svg" alt="Modifier" />
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>

  <div v-if="showCreateModal" class="select-modal" @click.self="closeCreateModal">
    <div class="select-modal__panel">
      <header class="select-modal__header">
        <div class="header-row">
          <div class="header-back-container">
            <button class="modal-back" type="button" @click="closeCreateModal">
              <img src="../assets/images/arrow-left.svg" alt="Retour" />
            </button>
          </div>
          <h3>{{ groupModalTitle }}</h3>
          <div class="header-save-container">
            <button
              class="modal-save"
              type="button"
              :aria-busy="isSavingGroup"
              :disabled="isSavingGroup || !newGroupName.trim()"
              @click="saveNewGroup"
            >
              <img src="../assets/images/check-white.svg" alt="Valider" />
            </button>
          </div>
        </div>
      </header>
      <div class="select-modal__body">
        <label class="field-group">
          <input
            v-model="newGroupName"
            type="text"
            class="text-input"
            placeholder="P1A"
          />
        </label>
      </div>
    </div>
  </div>

  <div v-if="showEditModal" class="user-modal-overlay group-edit-modal" @click.self="closeEditModal">
    <div class="user-modal">
      <header class="user-modal__header">
        <div class="user-modal__header-content">
          <div>
            <button class="modal-btn ghost" type="button" @click="closeEditModal">
              <img src="../assets/images/arrow-left.svg" alt="arrow" class="btn-icon" />
            </button>
          </div>
          <div class="modal-actions">
            <button class="modal-btn danger" type="button" :disabled="isDeleting" @click="deleteCurrentGroup">
              <img src="../assets/images/delete.svg" alt="delete" class="btn-icon" />
            </button>
          </div>
        </div>
      </header>
      <div class="user-modal__body">
        <div class="modal-edit-form">
          <input
            v-model="editGroupName"
            type="text"
            class="edit-input"
            placeholder="Nom du groupe"
          />
          <button class="btn-save" type="button" :aria-busy="isSavingGroup" :disabled="isSavingGroup || !editGroupName.trim()" @click="saveEditGroup">
            <span>Enregistrer</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useGroupsStore, useAuthStore } from '../stores'

export default {
  name: 'GroupesClasses',
  data() {
    return {
      showCreateModal: false,
      newGroupName: '',
      isSavingGroup: false,
      editingGroupId: null,
      isDeleting: false,
      showEditModal: false,
      editGroupName: ''
    }
  },
  computed: {
    ...mapState(useGroupsStore, ['groups']),
    ...mapState(useAuthStore, { currentUser: 'user' }),
    schoolId() {
      return this.currentUser?.schoolId || this.currentUser?.school_id || this.currentUser?.school?.id || null
    },
    groupsView() {
      const cleanGroups = (this.groups || [])
        .filter((group) => {
          const name = String(group?.name || '').trim()
          return name && !name.startsWith('single-')
        })
        .map(group => ({ id: group.id, name: group.name, count: this.groupCount(group) }))
      return cleanGroups.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    },
    groupModalTitle() {
      return this.editingGroupId ? 'Modifier le groupe' : 'Nouveau groupe'
    }
  },
  created() {
    this.loadGroupsWithStudents().catch(() => {})
  },
  methods: {
    ...mapActions(useGroupsStore, ['fetchGroups', 'fetchGroup', 'createGroup', 'updateGroup', 'deleteGroup']),
    async loadGroupsWithStudents() {
      if (!this.schoolId) return
      try {
        if (!this.groups || !this.groups.length) {
          await this.fetchGroups({ schoolId: this.schoolId, include: 'students' })
        }
      } catch (_e) {
        // Already handled in store
      }

      const needsDetails = (this.groups || [])
        .filter((group) => group?.id && !this.hasCountInfo(group))
        .map((group) => group.id)

      if (!needsDetails.length) return
      await Promise.allSettled(
        needsDetails.map((id) => this.fetchGroup(id, { include: 'students' }).catch(() => null))
      )
    },
    createCourse() {
      this.editingGroupId = null
      this.newGroupName = ''
      this.showCreateModal = true
    },
    openEditModal(group) {
      this.editingGroupId = group?.id ?? null
      this.editGroupName = group?.name || ''
      this.showEditModal = true
    },
    async saveNewGroup() {
      const name = this.newGroupName.trim()
      if (!name || this.isSavingGroup) return
      this.isSavingGroup = true
      try {
        if (this.editingGroupId) {
          await this.updateGroup(this.editingGroupId, { name })
        } else {
          await this.createGroup({ name, singleStudentGroup: false })
        }
        this.newGroupName = ''
        this.editingGroupId = null
        this.showCreateModal = false
      } catch (error) {
        console.error('Unable to create group', error)
      } finally {
        this.isSavingGroup = false
      }
    },
    async saveEditGroup() {
      const name = this.editGroupName.trim()
      if (!name || this.isSavingGroup || !this.editingGroupId) return
      this.isSavingGroup = true
      try {
        await this.updateGroup(this.editingGroupId, { name })
        this.closeEditModal()
      } catch (error) {
        console.error('Unable to update group', error)
      } finally {
        this.isSavingGroup = false
      }
    },
    async deleteCurrentGroup() {
      if (!this.editingGroupId || this.isDeleting) return
      this.isDeleting = true
      try {
        await this.deleteGroup(this.editingGroupId)
        this.closeEditModal()
      } catch (error) {
        console.error('Unable to delete group', error)
      } finally {
        this.isDeleting = false
      }
    },
    groupCount(group) {
      if (!group) return 0
      const fromCount = Number.isFinite(group.studentCount)
        ? group.studentCount
        : Number.isFinite(group.studentsCount)
          ? group.studentsCount
          : null
      if (fromCount !== null) return fromCount
      const fromIds = Array.isArray(group.studentIds) ? group.studentIds.filter(Boolean).length : 0
      const fromAltIds = Array.isArray(group.studentsIds) ? group.studentsIds.filter(Boolean).length : 0
      const fromSnakeIds = Array.isArray(group.student_ids) ? group.student_ids.filter(Boolean).length : 0
      const fromObjects = Array.isArray(group.students) ? group.students.filter(Boolean).length : 0
      return fromIds || fromAltIds || fromSnakeIds || fromObjects || 0
    },
    hasCountInfo(group) {
      if (!group) return false
      if (Number.isFinite(group.studentCount) || Number.isFinite(group.studentsCount)) return true
      if (Array.isArray(group.students) || Array.isArray(group.studentIds)) return true
      if (Array.isArray(group.studentsIds) || Array.isArray(group.student_ids)) return true
      return false
    },
    openGroup(name, id) {
      if (!name) return
      this.$router.push({ name: 'GroupesClassesDetail', params: { groupName: name }, query: id ? { id } : {} })
    },
    closeCreateModal() {
      this.editingGroupId = null
      this.showCreateModal = false
    },
    closeEditModal() {
      this.editingGroupId = null
      this.editGroupName = ''
      this.showEditModal = false
    }
  }
}
</script>

<style scoped src="../assets/groupes-classes.css"></style>
