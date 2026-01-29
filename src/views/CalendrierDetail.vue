<template>
  <div class="detail-page" v-if="course">
    <header class="detail-header">
      <div class="header-left">
        <button class="btn ghost" @click="goBack">
            <img class="btn-icon" src="../assets/images/arrow-left.svg" alt="Back" />
        </button>
        <div class="title-block">
            <h1 class="course-title">{{ course.subject }}</h1>
            <p class="course-meta">{{ course.day }} · {{ course.startTime }}-{{ course.endTime }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-modify" @click="goEdit">
          <img class="btn-icon" src="../assets/images/modify.svg" alt="Modifier" />
          <span>Modifier</span>
        </button>
        <button v-if="!isPlanned" class="btn-allpresent" :class="allPresentStatus" @click="setAllPresent">
          <img class="btn-icon" src="../assets/images/check-white.svg" alt="Tout présent" />
          <span>Tout le monde présent</span>
        </button>
        <button v-if="!isPlanned" class="btn-allabsent" :class="allAbsentStatus" @click="setAllAbsent">
          <img class="btn-icon" src="../assets/images/croix.svg" alt="Tout absent" />
          <span>Tout le monde absent</span>
        </button>
      </div>
    </header>
    <div class="detail-content">
        <section class="info-section">
        <h2>Informations</h2>
        <div class="info-grid">
            <div class="info-1">
                <div class="info-item1 title"><span>{{ course.subject }}</span></div>
                <div class="info-item1"><span>{{ course.day }}</span></div>
                <div class="info-item1"><span>{{ course.startTime }}-{{ course.endTime }}</span></div>
                <div class="info-item1"><span>{{ course.room }}</span></div>
            </div>
            <div class="info-2">
                <div class="info-item2"><span>{{ course.teacher.join(', ') }}</span></div>
                <div class="info-item2"><span>{{ course.group }}</span></div>
            </div>
        </div>
        </section>

        <section v-if="!isPlanned" :class="course.status">
        <div class="status-chip">
          <img v-if="statusLabel.icon" :src="statusLabel.icon" alt="statut" class="status-chip__icon" />
          <span>{{ statusLabel.text }}</span>
        </div>
        </section>

        <section class="teacher-section">
        <h2>Enseignants</h2>
        <div class="card-list-teacher">
            <div v-for="teacher in teachers" :key="teacher.name" class="person-card" :class="teacher?.signatureStatus || 'none'">
              <div class="person-header">
                <div class="name">{{ teacher.name }}</div>
                <div
                  v-if="teacher && teacher.meta"
                  class="signature-status"
                  :class="teacher.meta.class">
                  <span class="status-icon">{{ teacher.meta.icon }}</span>
                  <span class="status-label">{{ teacher.meta.label }}</span>
                </div>
              </div>
              <div class="signature-line">
                <div v-if="teacher && teacher.meta && teacher.meta.class === 'absent'">
                  <img src="../assets/images/absent.svg" alt="Absent" class="signature-image" />
                </div>
                <div v-else-if="teacher && teacher.signatureUrl">
                  <img :src="teacher.signatureUrl" :alt="`Signature de ${teacher.name}`" class="signature-image" />
                </div>
                <div v-else class="signature-none">Aucune signature</div>
              </div>
                <div class="actions" v-if="!isPlanned">
                  <button class="btn-present" :class="teacher?.meta?.class || 'none'" @click="setTeacherStatus(teacher.id, 'present')">✔</button>
                  <button class="btn-absent" :class="teacher?.meta?.class || 'none'" @click="setTeacherStatus(teacher.id, 'absent')">✖</button>
                </div>
            </div>
        </div>
        </section>

        <section class="student-section">
        <h2>Étudiants</h2>
        <div class="card-list-student">
            <div v-for="student in students" :key="student.id" class="person-card" :class="student.signatureStatus">
            <div class="person-header">
                <div class="name">{{ student.name }}</div>
                <div
                  v-if="student.meta"
                  class="signature-status"
                  :class="student.meta.class">
                  <span class="status-icon">{{ student.meta.icon }}</span>
                  <span class="status-label">{{ student.meta.label }}</span>
                </div>
            </div>
            <div class="signature-line">
                <div
                v-if="student.meta && student.meta.class === 'absent'">
                    <img src="../assets/images/absent.svg" alt="Absent" class="signature-image" />
                </div>
                <div v-else-if="student.signatureUrl">
                <img :src="student.signatureUrl" :alt="`Signature de ${student.name}`" class="signature-image" />
                </div>
                <div v-else class="signature-none">Aucune signature</div>
            </div>
            <div class="actions" v-if="!isPlanned">
              <button class="btn-present" :class="student.meta?.class || 'none'" @click="setStudentStatus(student.id, 'present')">✔</button>
              <button class="btn-absent" :class="student.meta?.class || 'none'" @click="setStudentStatus(student.id, 'absent')">✖</button>
            </div>
            </div>
        </div>
        </section>
    </div>
  </div>

  <div v-else class="detail-page empty-state">
    <p>Cours introuvable.</p>
    <button class="btn modify" @click="goBack">Retour au calendrier</button>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import clockIcon from '../assets/images/clock.svg'
import clockcheckIcon from '../assets/images/clock-check.svg'
import checkIcon from '../assets/images/check.svg'
import absentIcon from '../assets/images/croix-black.svg'
import { useCalendarStore, useSignaturesStore, useUsersStore } from '../stores'

export default {
  name: 'CalendrierDetail',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      course: null,
      teachers: [],
      students: [],
      loading: true
    }
  },
  computed: {
    ...mapState(useSignaturesStore, ['signatures']),
    ...mapState(useUsersStore, ['users']),
    isPlanned() {
      return this.course && this.course.status === 'planned'
    },
    statusLabel() {
      if (!this.course) return { text: '', icon: null }
      const statusMap = {
        finished: { text: 'Ce cours est terminé', icon: checkIcon },
        'finished-absent': { text: "Ce cours est terminé, mais l'enseignant n'a pas validé sa présence", icon: absentIcon },
        started: { text: 'Ce cours a débuté', icon: clockcheckIcon },
        'started-absent': { text: "Ce cours a débuté. En attente de la signature de l'enseignant", icon: clockIcon },
        planned: { text: "Ce cours n'a pas encore débuté", icon: null }
      }
      return statusMap[this.course.status] || { text: '', icon: null }
    },
    allPresentStatus() {
      if (this.students.length === 0 && this.teachers.length === 0) return ''
      const studentsPresent = this.students.length === 0 || this.students.every(s => s.meta?.class === 'present')
      const teachersPresent = this.teachers.length === 0 || this.teachers.every(t => t.meta?.class === 'present')
      const allPresent = studentsPresent && teachersPresent
      return allPresent ? 'present' : ''
    },
    allAbsentStatus() {
      if (this.students.length === 0 && this.teachers.length === 0) return ''
      const studentsAbsent = this.students.length === 0 || this.students.every(s => s.meta?.class === 'absent')
      const teachersAbsent = this.teachers.length === 0 || this.teachers.every(t => t.meta?.class === 'absent')
      const allAbsent = studentsAbsent && teachersAbsent
      return allAbsent ? 'absent' : ''
    },
    signaturesForCourse() {
      return this.signatures.filter(sig => Number(sig.courseId) === Number(this.id))
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    ...mapActions(useCalendarStore, { fetchCourseAction: 'fetchCourse' }),
    ...mapActions(useSignaturesStore, {
      fetchSignaturesAction: 'fetchSignatures',
      addSignature: 'addSignature',
      updateSignature: 'updateSignature'
    }),
    ...mapActions(useUsersStore, ['fetchUsers']),
    async loadData() {
      this.loading = true
      try {
        const course = await this.fetchCourseAction(this.id)
        this.course = this.normalizeCourse(course)
        await this.loadRoster()
      } catch (error) {
        console.error('Unable to load course', error)
      } finally {
        this.loading = false
      }
    },
    async loadRoster() {
      await Promise.all([this.fetchSignaturesAction(this.id), this.fetchUsers()]).catch(() => {})
      const signatures = this.signaturesForCourse

      const teacherSignatures = signatures.filter(sig => sig.teacherId || sig.role === 'teacher')
      const studentSignatures = signatures.filter(sig => sig.studentId || sig.role === 'student')

      const baseTeachers = Array.isArray(this.course?.teacher)
        ? this.course.teacher.map(val => (typeof val === 'object' ? val : { teacherId: val }))
        : this.course?.teacher
          ? [{ teacherId: this.course.teacher }]
          : []

      const baseStudents = Array.isArray(this.course?.students)
        ? this.course.students.map(id => ({ studentId: id }))
        : []

      const teacherMerged = [...baseTeachers, ...teacherSignatures]
      const studentMerged = [...baseStudents, ...studentSignatures]

      this.teachers = this.mergePersons(teacherMerged, 'teacher')
      this.students = this.mergePersons(studentMerged, 'student')
    },
    mergePersons(entries, role) {
      const map = new Map()
      entries.forEach(entry => {
        const id = role === 'teacher' ? (entry.teacherId ?? entry.id ?? entry.userId) : (entry.studentId ?? entry.id ?? entry.userId)
        if (!id) return
        const status = entry.status || 'none'
        const existing = map.get(id) || {}
        map.set(id, {
          id,
          name: existing.name || entry.name || this.resolveUserName(id),
          signatureStatus: status,
          signatureUrl: entry.signatureUrl || existing.signatureUrl || null,
          meta: this.signatureMeta(status)
        })
      })
      return Array.from(map.values())
    },
    resolveUserName(id) {
      const user = this.users.find(u => Number(u.id) === Number(id))
      if (!user) return `#${id}`
      if (user.name) return user.name
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || `#${id}`
    },
    normalizeCourse(course) {
      if (!course) return null

      const toDayTime = (value) => {
        if (!value) return { day: '', time: '' }
        const d = new Date(value)
        if (Number.isNaN(d.getTime())) return { day: '', time: '' }
        const hours = `${d.getHours()}`.padStart(2, '0')
        const minutes = `${d.getMinutes()}`.padStart(2, '0')
        return {
          day: `${`${d.getDate()}`.padStart(2, '0')}/${`${d.getMonth() + 1}`.padStart(2, '0')}/${d.getFullYear()}`,
          time: `${hours}h${minutes}`
        }
      }

      const startInfo = toDayTime(course.start || course.startDate)
      const endInfo = toDayTime(course.end || course.endDate)

      return {
        id: course.id,
        subject: course.subject || course.title || 'Cours',
        day: course.day || startInfo.day,
        startTime: course.startTime || startInfo.time,
        endTime: course.endTime || endInfo.time,
        room: course.room || course.roomName || '',
        teacher: course.teacher || [],
        group: course.group || course.className || '',
        status: course.status || 'planned',
        students: course.students || []
      }
    },
    signatureMeta(status) {
      const map = {
        absent: { label: 'Absent', icon: '✖', class: 'absent' },
        signed: { label: 'Signé', icon: '✔', class: 'signed' },
        present: { label: 'Présent', icon: '✔', class: 'present' }
      }
      return map[status] || null
    },
    async setTeacherStatus(teacherId, status) {
      const target = this.signaturesForCourse.find(sig => Number(sig.teacherId) === Number(teacherId))
      if (target) {
        await this.updateSignature(target.id, { status }).catch(() => {})
      } else {
        await this.addSignature({ courseId: this.course.id, teacherId, status }).catch(() => {})
      }
      this.loadRoster()
    },
    async setStudentStatus(studentId, status) {
      const target = this.signaturesForCourse.find(sig => Number(sig.studentId) === Number(studentId))
      if (target) {
        await this.updateSignature(target.id, { status }).catch(() => {})
      } else {
        await this.addSignature({ courseId: this.course.id, studentId, status }).catch(() => {})
      }
      this.loadRoster()
    },
    async setAllPresent() {
      await Promise.all([
        ...this.students.map(student => this.setStudentStatus(student.id, 'present')),
        ...this.teachers.map(teacher => this.setTeacherStatus(teacher.id, 'present'))
      ])
    },
    async setAllAbsent() {
      await Promise.all([
        ...this.students.map(student => this.setStudentStatus(student.id, 'absent')),
        ...this.teachers.map(teacher => this.setTeacherStatus(teacher.id, 'absent'))
      ])
    },
    goBack() {
      this.$router.push({
        name: 'Calendrier',
        query: { date: this.course?.day }
      })
    },
    goEdit() {
      if (!this.course) return
      this.$router.push({ name: 'NouveauCours', query: { courseId: this.course.id } })
    }
  }
}
</script>


<style scoped src="../assets/calendrierdetail.css"></style>