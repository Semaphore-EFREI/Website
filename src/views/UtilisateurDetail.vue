<template>
  <main class="edit-user-page user-detail-page">
    <header class="edit-user-header">
      <div class="edit-user-header-left">
        <button class="edit-back-btn" type="button" @click="goBack" aria-label="Retour">
          <img src="../assets/images/arrow-left.svg" alt="Retour" />
        </button>
      </div>
      <div class="edit-user-actions">
        <button class="ghost-btn primary-btn" type="button" :disabled="loading || !user" @click="editUser">
          <img src="../assets/images/modify.svg" alt="Modifier" />
          Modifier
        </button>
        <button class="ghost-btn danger-btn" type="button" :disabled="loading || deleting || !user" @click="deleteCurrent">
          <img src="../assets/images/delete.svg" alt="Supprimer" />
          Supprimer
        </button>
      </div>
    </header>

    <section v-if="user" class="edit-user-form view-mode">
      <div class="edit-user-info">
        <div class="edit-user-avatar-block">
          <img :src="user.profilePicture || defaultProfile" alt="Photo de profil" class="edit-user-avatar" />
        </div>
        <div class="edit-user-principal">
            <div class="edit-user-names">
            {{user.firstName}} {{user.lastName}} 
            </div>
            <p class="user-email-inline">{{ user.email || 'Non renseigné' }}</p>
        </div>
        <div class="edit-user-roles">
          <button
            v-if="isRole('Étudiant')"
            type="button"
            class="role-btn role-student"
            :class="{ selected: true }"
            disabled
          >
            <img :src="roleIcon('Étudiant')" alt="Étudiant" />
            Étudiant
          </button>
          <button
            v-else-if="isRole('Enseignant')"
            type="button"
            class="role-btn role-teacher"
            :class="{ selected: true }"
            disabled
          >
            <img :src="roleIcon('Enseignant')" alt="Enseignant" />
            Enseignant
          </button>
          <button
            v-else-if="isRole('Admin')"
            type="button"
            class="role-btn role-admin"
            :class="{ selected: true }"
            disabled
          >
            <img :src="roleIcon('Admin')" alt="Admin" />
            Admin
          </button>
        </div>
          <div class="detail-groups" v-if="showGroups">
          <div class="group-chips" v-if="user.groups && user.groups.length">
            <span v-for="(group, index) in user.groups" :key="`${user.id || 'user'}-group-${index}`" class="chip">{{ group }}</span>
          </div>
          <div v-else class="group-empty">Aucun groupe</div>
        </div>
      </div>

      <div class="absence-period">
        <div class="absence-inputs">
            <div class="absence-separator">Définir une absence excusée {{ absenceSubjectLabel }} du</div>
          <input type="date" v-model="excusedStart" aria-label="Date de début d'absence" />
          <span class="absence-separator">à</span>
          <input type="date" v-model="excusedEnd" aria-label="Date de fin d'absence" />
          <button class="ghost-btn excused-btn" type="button" @click="submitExcusedPeriod" :disabled="submittingExcused || !excusedStart || !excusedEnd">
            Valider
          </button>
        </div>
      </div>

      <div class="user-schedule">
        <div class="day-selector">
          <span class="current-day">{{ weekLabel }}</span>
          <div class="arrow-container">
            <button class="arrow-btn" @click="previousWeek" :disabled="coursesLoading">
              <img src="../assets/images/arrow-left.svg" alt="arrow left" class="arrow" />
            </button>
            <button class="arrow-btn" @click="nextWeek" :disabled="coursesLoading">
              <img src="../assets/images/arrow-right.svg" alt="arrow right" class="arrow" />
            </button>
          </div>
        </div>

        <div class="week-grid">
          <div v-for="day in weekDays" :key="day.toISOString()" class="day-column">
            <div class="day-column-header">{{ formatDayHeader(day) }}</div>
            <div class="day-column-divider"></div>
            <div v-if="coursesByDay[dateKey(day)] && coursesByDay[dateKey(day)].length" class="day-blocks">
              <div
                v-for="block in coursesByDay[dateKey(day)]"
                :key="block.id"
                class="class-block"
                :class="[block.status, presenceClass(block)]"
                role="button"
                tabindex="0"
                @click="goToCourse(block.id)"
              >
                <div class="block-title">{{ block.subject }}</div>
                <div class="time-room">
                  <div class="block-time">{{ block.startTime }}-{{ block.endTime }}</div>
                </div>
              </div>
            </div>
            <div v-else class="day-empty">Aucun cours</div>
          </div>
        </div>
      </div>
    </section>

    <div v-else class="loading-state">{{ error || 'Chargement en cours…' }}</div>
  </main>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import defaultProfile from '../assets/images/user-invert.svg'
import { useUsersStore } from '../stores'
import { request } from '../stores/apiClient'

export default {
  name: 'UtilisateurDetail',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      user: null,
      loading: true,
      deleting: false,
      error: '',
      defaultProfile,
      selectedDate: new Date(),
      coursesLoading: false,
      userCourses: [],
      excusedStart: '',
      excusedEnd: '',
      submittingExcused: false
    }
  },
  computed: {
    ...mapState(useUsersStore, { users: 'users' }),
    isStudent() {
      return this.isRole('Étudiant')
    },
    isTeacher() {
      return this.isRole('Enseignant')
    },
    isAdmin() {
      return this.isRole('Admin')
    },
    absenceSubjectLabel() {
      if (this.isTeacher) return 'du professeur'
      return 'de l\'étudiant'
    },
    showGroups() {
      return this.isStudent
    },
    weekStartDate() {
      const d = new Date(this.selectedDate)
      const day = d.getDay() || 7 // Sunday -> 7
      if (day !== 1) d.setDate(d.getDate() - (day - 1))
      d.setHours(0, 0, 0, 0)
      return d
    },
    weekEndDate() {
      const d = new Date(this.weekStartDate)
      d.setDate(d.getDate() + 7)
      return d
    },
    weekLabel() {
      const fmt = (date) => {
        const day = date.getDate()
        const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
        const month = monthNames[date.getMonth()]
        return `${day} ${month}`
      }
      const start = fmt(this.weekStartDate)
      const end = fmt(new Date(this.weekStartDate.getFullYear(), this.weekStartDate.getMonth(), this.weekStartDate.getDate() + 7))
      return `Semaine du ${start} au ${end}`
    },
    weekDays() {
      return Array.from({ length: 7 }).map((_, idx) => {
        const d = new Date(this.weekStartDate)
        d.setDate(d.getDate() + idx)
        return d
      }).filter((d) => d.getDay() !== 0)
    },
    coursesByDay() {
      const map = {}
      const parseTime = (t) => {
        const [h, m] = String(t || '').replace('h', ':').split(':').map(Number)
        return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 }
      }
      this.weekDays.forEach((day) => {
        map[this.dateKey(day)] = []
      })
      this.userCourses.forEach((c) => {
        const key = c.day
        if (!map[key]) map[key] = []
        map[key].push(c)
      })
      Object.keys(map).forEach((k) => {
        map[k] = map[k].slice().sort((a, b) => {
          const ta = parseTime(a.startTime)
          const tb = parseTime(b.startTime)
          if (ta.h === tb.h) return ta.m - tb.m
          return ta.h - tb.h
        })
      })
      return map
    }
  },
  created() {
    this.loadUser()
  },
  methods: {
    ...mapActions(useUsersStore, { fetchUserProfile: 'fetchUserProfile', deleteUser: 'deleteUser' }),
    async loadUser() {
      this.loading = true
      this.error = ''
      try {
        const profile = await this.fetchUserProfile(this.id)
        this.user = profile
        await this.fetchUserCourses()
      } catch (err) {
        console.error('Unable to load user profile:', err)
        this.error = err?.message || 'Impossible de charger l’utilisateur'
        // Fallback to already loaded list if available
        this.user = this.users.find(u => String(u.id) === String(this.id)) || null
        if (this.user) await this.fetchUserCourses()
      } finally {
        this.loading = false
      }
    },
    goBack() {
      const fromRole = this.$route.query?.fromRole
      if (fromRole) {
        this.$router.push({ name: fromRole })
        return
      }
      if (window.history && window.history.length > 1) {
        this.$router.back()
        return
      }
      this.$router.push({ name: 'Utilisateurs' })
    },
    formatDayHeader(day) {
      const options = { weekday: 'short', day: 'numeric' }
      return day.toLocaleDateString('fr-FR', options)
    },
    editUser() {
      if (!this.user) return
      this.$router.push({ name: 'UtilisateurEdit', query: { id: this.user.id } })
    },
    async deleteCurrent() {
      if (!this.user || this.deleting) return
      this.deleting = true
      try {
        await this.deleteUser(this.user.id, this.user.role)
        this.goBack()
      } catch (err) {
        console.error('Unable to delete user', err)
        this.error = err?.message || 'Suppression impossible'
      } finally {
        this.deleting = false
      }
    },
    isRole(label) {
      return (this.user?.role || '').toLowerCase() === (label || '').toLowerCase()
    },
    dateKey(date) {
      const day = `${date.getDate()}`.padStart(2, '0')
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    },
    getBlocksForHour(hour) {
      return this.filteredCourses.filter((c) => c.startTime === hour)
    },
    previousWeek() {
      const d = new Date(this.selectedDate)
      d.setDate(d.getDate() - 7)
      this.selectedDate = d
      this.fetchUserCourses()
    },
    nextWeek() {
      const d = new Date(this.selectedDate)
      d.setDate(d.getDate() + 7)
      this.selectedDate = d
      this.fetchUserCourses()
    },
    async fetchUserCourses() {
      if (!this.user?.id) return
      this.coursesLoading = true
      const from = Math.floor(this.weekStartDate.getTime() / 1000)
      const to = Math.floor(this.weekEndDate.getTime() / 1000)
      try {
        const params = {
          userId: this.user.id,
          from,
          to,
          include: 'classrooms,signatures,students,soloStudents,studentGroups,teachers'
        }
        const response = await request('/courses', { method: 'GET', params })
        const list = Array.isArray(response?.courses) ? response.courses : Array.isArray(response) ? response : []
        const deduped = []
        const seen = new Set()
        list.forEach((c) => {
          const cid = c?.id ?? c?.courseId ?? c
          const key = cid ? String(cid) : null
          if (key && seen.has(key)) return
          if (key) seen.add(key)
          deduped.push(c)
        })
        this.userCourses = deduped.map((c) => this.normalizeCourse(c))
        await this.enrichCoursesWithSignatures()
      } catch (err) {
        console.error('Unable to load user courses', err)
      } finally {
        this.coursesLoading = false
      }
    },
    normalizeCourse(course) {
      if (!course) return { id: null, subject: '', startTime: '', endTime: '', day: '', room: '', teacher: [], group: '', status: '' }

      const toDate = (value) => {
        if (value === null || value === undefined) return null
        if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
        if (typeof value === 'number') {
          const ms = value < 1e12 ? value * 1000 : value
          const d = new Date(ms)
          return Number.isNaN(d.getTime()) ? null : d
        }
        if (typeof value === 'string') {
          const numeric = Number(value)
          if (!Number.isNaN(numeric)) return toDate(numeric)
          const d = new Date(value)
          return Number.isNaN(d.getTime()) ? null : d
        }
        return null
      }

      const toDayTime = (dateObj) => {
        if (!dateObj) return { day: '', time: '' }
        const hours = `${dateObj.getHours()}`
        const minutes = `${dateObj.getMinutes()}`.padStart(2, '0')
        return {
          day: this.dateKey(dateObj),
          time: `${hours}h${minutes}`
        }
      }

      const startDate = toDate(course.start || course.startDate || course.date)
      const endDate = toDate(course.end || course.endDate)
      const startInfo = toDayTime(startDate)
      const endInfo = toDayTime(endDate)

      const teacherRaw = Array.isArray(course.teachers)
        ? course.teachers
        : Array.isArray(course.teacher)
          ? course.teacher
          : course.teacher
            ? [course.teacher]
            : course.teacherId
              ? [course.teacherId]
              : []

      const teacherNames = teacherRaw
        .map((t) => {
          if (typeof t === 'object' && t !== null) {
            const fullName = [t.firstName || t.firstname, t.lastName || t.lastname].filter(Boolean).join(' ').trim()
            const candidate = t.name || fullName
            const userId = t.id || t.userId || t.teacherId
            const user = userId ? this.users.find((u) => String(u.id) === String(userId)) : null
            return user?.name || candidate || userId || ''
          }
          const user = this.users.find((u) => String(u.id) === String(t))
          return user?.name || t
        })
        .filter(Boolean)

      const roomName = course.room
        || course.roomName
        || course.classroom
        || (Array.isArray(course.classrooms) ? course.classrooms[0]?.name : '')

      const groupNames = (() => {
        if (Array.isArray(course.studentGroups)) {
          return course.studentGroups
            .map((g) => {
              if (typeof g === 'object' && g !== null) return g.name || g.title || g.label || g.id || ''
              return g
            })
            .map((name) => String(name || '').trim())
            .filter((name) => name && !name.startsWith('single-'))
        }

        const fallback = course.group || course.className || ''
        const cleanFallback = String(fallback || '').trim()
        return cleanFallback && !cleanFallback.startsWith('single-') ? [cleanFallback] : []
      })()

      const singlesLabel = (() => {
        const singlesFromGroups = Array.isArray(course.studentGroups)
          ? course.studentGroups
              .map((g) => {
                if (typeof g === 'object' && g !== null) return g.id || g.name || g.title || g.label || ''
                return g
              })
              .map((id) => String(id || '').trim())
              .filter((id) => id.startsWith('single-'))
              .map((id) => id.replace(/^single-/, ''))
              .filter(Boolean)
          : []

        const singlesFromSolo = Array.isArray(course.soloStudents)
          ? course.soloStudents
              .map((s) => {
                if (typeof s === 'object' && s !== null) return s.id || s.userId || s.studentId || ''
                return s
              })
              .map((id) => String(id || '').trim())
              .filter(Boolean)
          : []

        const ids = [...new Set([...singlesFromGroups, ...singlesFromSolo])]
        return ids.length ? 'Étudiants variés' : ''
      })()

      const groupName = (() => {
        if (groupNames.length && singlesLabel) return `${groupNames.join(', ')} · ${singlesLabel}`
        if (groupNames.length) return groupNames.join(', ')
        return singlesLabel
      })()

      let status = course.status || 'planned'
      if (!course.status && startDate && endDate) {
        const now = Date.now()
        const hasTeacherSig = Array.isArray(course.signature)
          ? course.signature.some(
              (sig) =>
                sig &&
                (sig.teacher || sig.teacherId || sig.type === 'teacher') &&
                (sig.status === 'signed' || sig.status === 'present' || sig.status === 'late')
            )
          : false
        if (now > endDate.getTime()) status = hasTeacherSig ? 'finished' : 'finished-absent'
        else if (now >= startDate.getTime()) status = hasTeacherSig ? 'started' : 'started-absent'
      }

      return {
        id: course.id,
        subject: course.subject || course.title || course.name || 'Cours',
        startTime: course.startTime || startInfo.time,
        endTime: course.endTime || endInfo.time,
        day: course.day || startInfo.day,
        room: roomName || '',
        teacher: teacherNames,
        group: groupName || '',
        status,
        presenceStatus: ''
      }
    },
    async enrichCoursesWithSignatures() {
      if (!this.userCourses.length || !this.user?.id) return
      try {
        const detailRequests = this.userCourses.map(async (course) => {
          if (!course.id) return null
          try {
            const detail = await request(`/course/${course.id}`, { method: 'GET' })
            const signatures = Array.isArray(detail?.signature) ? detail.signature : Array.isArray(detail?.signatures) ? detail.signatures : []
            const match = signatures.find((sig) => this.matchSignature(sig))
            return { id: course.id, presenceStatus: match?.status || '' }
          } catch (err) {
            console.error('Unable to load course detail', course.id, err)
            return null
          }
        })
        const results = await Promise.all(detailRequests)
        const presenceMap = {}
        results.forEach((res) => {
          if (res && res.presenceStatus) presenceMap[res.id] = res.presenceStatus
        })
        this.userCourses = this.userCourses.map((course) => ({
          ...course,
          presenceStatus: presenceMap[course.id] || ''
        }))
      } catch (err) {
        console.error('Unable to enrich courses with signatures', err)
      }
    },
    matchSignature(sig) {
      if (!sig || !this.user?.id) return false
      const userId = String(this.user.id)
      const type = sig.type || (sig.student || sig.studentId ? 'student' : sig.teacher || sig.teacherId ? 'teacher' : '')
      if (this.isRole('Étudiant')) {
        if (type !== 'student') return false
        const studentId = sig.student || sig.studentId || sig.userId
        return String(studentId || '') === userId
      }
      if (this.isRole('Enseignant')) {
        if (type !== 'teacher') return false
        const teacherField = sig.teacher || sig.teacherId || sig.userId
        if (Array.isArray(teacherField)) return teacherField.map((t) => String(t || '')).includes(userId)
        return String(teacherField || '') === userId
      }
      return false
    },
    presenceClass(block) {
      if (!block?.presenceStatus) return 'presence-none'
      return `presence-${block.presenceStatus}`
    },
    goToCourse(courseId) {
      if (!courseId) return
      this.$router.push({ name: 'CalendrierDetail', params: { id: courseId }, query: { fromUserId: this.user?.id } })
    },
    async submitExcusedPeriod() {
      if (!this.excusedStart || !this.excusedEnd || this.submittingExcused || !this.user?.id) return
      this.submittingExcused = true
      try {
        const startTs = this.toEpochBoundary(this.excusedStart, 'start')
        const endTs = this.toEpochBoundary(this.excusedEnd, 'end')
        if (startTs === null || endTs === null) throw new Error('Dates invalides')

        const from = Math.min(startTs, endTs)
        const to = Math.max(startTs, endTs)

        const coursesResp = await request('/courses', {
          method: 'GET',
          params: { userId: this.user.id, limit: 50, from, to }
        })
        const coursesList = Array.isArray(coursesResp?.courses) ? coursesResp.courses : Array.isArray(coursesResp) ? coursesResp : []

        const courseIds = Array.from(
          new Set(
            coursesList
              .map((c) => ({
                id: c?.id || c,
                start: this.toEpochSeconds(c?.start || c?.startDate || c?.date),
                end: this.toEpochSeconds(c?.end || c?.endDate)
              }))
              .filter((entry) => entry.id)
              .filter((entry) => this.isCourseInRange(entry.start, entry.end, from, to))
              .map((entry) => entry.id)
          )
        )

        if (courseIds.length) {
          const now = Math.floor(Date.now() / 1000)
          const tasks = courseIds.map(async (courseId) => {
            try {
              const detail = await request(`/course/${courseId}`, { method: 'GET' })
              const sigs = Array.isArray(detail?.signature)
                ? detail.signature
                : Array.isArray(detail?.signatures)
                  ? detail.signatures
                  : []

              const existing = this.findExistingSignatureForUser(sigs)
              if (existing?.id) {
                return request(`/signature/${existing.id}`, {
                  method: 'PATCH',
                  data: { status: 'excused' }
                })
              }

              return request('/signature', {
                method: 'POST',
                data: {
                  course: courseId,
                  date: now,
                  method: 'admin',
                  status: 'excused',
                  ...(this.isTeacher ? { teacher: this.user.id } : { student: this.user.id })
                }
              })
            } catch (error) {
              console.warn('Unable to upsert excused signature', { courseId, error })
              throw error
            }
          })

          const results = await Promise.allSettled(tasks)
          const failures = results.filter((res) => res.status === 'rejected')
          if (failures.length) {
            console.warn('Certaines signatures excusées ont échoué', failures)
          }
        }

        await this.fetchUserCourses()
      } catch (err) {
        console.error('Unable to submit excused period', err)
      } finally {
        this.submittingExcused = false
      }
    },
    toEpochBoundary(dateStr, boundary = 'start') {
      if (!dateStr) return null
      const d = new Date(`${dateStr}T00:00:00`)
      if (Number.isNaN(d.getTime())) return null
      if (boundary === 'end') d.setHours(23, 59, 59, 999)
      return Math.floor(d.getTime() / 1000)
    },
    toEpochSeconds(value) {
      if (value === null || value === undefined) return null
      const num = Number(value)
      if (!Number.isNaN(num)) return num >= 1e12 ? Math.floor(num / 1000) : num
      const parsed = new Date(value)
      if (Number.isNaN(parsed.getTime())) return null
      return Math.floor(parsed.getTime() / 1000)
    },
    findExistingSignatureForUser(signatures) {
      if (!Array.isArray(signatures) || !this.user?.id) return null
      const uid = String(this.user.id)
      if (this.isTeacher) {
        return signatures.find((sig) => {
          const isTeacherSig = (sig.type && sig.type === 'teacher') || sig.teacher || sig.teacherId
          if (!isTeacherSig) return false
          const teacherField = sig.teacher || sig.teacherId || sig.userId
          if (Array.isArray(teacherField)) return teacherField.map((t) => String(t || '')).includes(uid)
          return String(teacherField || '') === uid
        }) || null
      }

      // student path
      return signatures.find((sig) => {
        const isStudentSig = (sig.type && sig.type === 'student') || sig.student || sig.studentId
        if (!isStudentSig) return false
        const studentField = sig.student || sig.studentId || sig.userId
        return String(studentField || '') === uid
      }) || null
    },
    isCourseInRange(start, end, from, to) {
      const s = start ?? end
      const e = end ?? start
      if (s === null || s === undefined) return false
      const begin = s
      const finish = e ?? s
      return begin <= to && finish >= from
    },
    roleIcon(role) {
      const map = {
        Étudiant: new URL('../assets/images/student-blue.svg', import.meta.url).href,
        Enseignant: new URL('../assets/images/teacher-green.svg', import.meta.url).href,
        Admin: new URL('../assets/images/admin-purple.svg', import.meta.url).href
      }
      return map[role] || new URL('../assets/images/user.svg', import.meta.url).href
    },
    roleClass(role) {
      if (role === 'Étudiant') return 'role-student'
      if (role === 'Enseignant') return 'role-teacher'
      if (role === 'Admin') return 'role-admin'
      return ''
    }
  }
}
</script>

<style scoped src="../assets/utilisateur-detail.css"></style>
