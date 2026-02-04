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
              <div class="info-item2"><span>{{ teacherDisplayNames.join(', ') }}</span></div>
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

        <section class="teacher-section" :key="refreshKey">
        <h2>Enseignants</h2>
        <div class="card-list-teacher">
          <div v-for="teacher in teachers" :key="teacher.name" class="person-card" :class="teacher?.signatureStatus || 'none'">
              <div class="person-header">
                <div class="name">{{ teacher.name }}</div>
                <div
                  v-if="teacher && teacher.meta"
                  class="signature-status"
                  :class="teacher.meta.class">
                  <img
                    v-if="teacher.meta.iconType === 'image' && teacher.meta.icon"
                    :src="teacher.meta.icon"
                    :alt="teacher.meta.iconAlt || teacher.meta.label"
                    class="status-icon-image"
                  />
                  <span v-else-if="teacher.meta.icon" class="status-icon">{{ teacher.meta.icon }}</span>
                  <span class="status-label">{{ teacher.meta.label }}</span>
                </div>
              </div>
              <div class="signature-line">
                <div v-if="teacher && teacher.meta && teacher.meta.class === 'absent'">
                  <img
                    src="../assets/images/absent.svg"
                    alt="Absent"
                    class="signature-image"
                    width="64"
                    height="64"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div v-else-if="teacher && teacher.meta && teacher.meta.class === 'excused'">
                  <img
                    :src="excusedSignatureIcon"
                    alt="Excusé"
                    class="signature-image"
                    width="64"
                    height="64"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div v-else-if="teacher && teacher.signatureUrl">
                  <img
                    :src="teacher.signatureUrl"
                    :alt="`Signature de ${teacher.name}`"
                    class="signature-image"
                    width="64"
                    height="64"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div v-else class="signature-none">Aucune signature</div>
              </div>
                <div v-if="teacher && teacher.meta && teacher.meta.class === 'excused'">
                  <button class="btn-cancel-excuse" type="button" @click="cancelSignature(teacher)">Annuler</button>
                </div>
                <div class="actions" v-if="!isPlanned && !isExcused(teacher)">
                  <button
                    class="btn-present"
                    :class="teacher?.meta?.class || 'none'"
                    :disabled="isPresentDisabled(teacher)"
                    @click="setTeacherStatus(teacher.id, 'present')"
                  >✔</button>
                  <button
                    class="btn-absent"
                    :class="teacher?.meta?.class || 'none'"
                    :disabled="isAbsentDisabled(teacher)"
                    @click="setTeacherStatus(teacher.id, 'absent')"
                  >✖</button>
                </div>
            </div>
        </div>
        </section>

        <section class="student-section" :key="`students-${refreshKey}`">
        <h2>Étudiants</h2>
        <div class="card-list-student">
          <div v-for="student in students" :key="student.id" class="person-card" :class="student.signatureStatus || 'none'">
            <div class="person-header">
                <div class="name">{{ student.name }}</div>
                <div
                  v-if="student.meta"
                  class="signature-status"
                  :class="student.meta.class">
                  <img
                    v-if="student.meta.iconType === 'image' && student.meta.icon"
                    :src="student.meta.icon"
                    :alt="student.meta.iconAlt || student.meta.label"
                    class="status-icon-image"
                  />
                  <span v-else-if="student.meta.icon" class="status-icon">{{ student.meta.icon }}</span>
                  <span class="status-label">{{ student.meta.label }}</span>
                </div>
            </div>
            <div class="signature-line">
                <div
                v-if="student.meta && student.meta.class === 'absent'">
                    <img
                      src="../assets/images/absent.svg"
                      alt="Absent"
                      class="signature-image"
                      width="64"
                      height="64"
                      loading="lazy"
                      decoding="async"
                    />
                </div>
                <div v-else-if="student.meta && student.meta.class === 'excused'">
                  <img
                    :src="excusedSignatureIcon"
                    alt="Excusé"
                    class="signature-image"
                    width="64"
                    height="64"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div v-else-if="student.signatureUrl">
                <img
                  :src="student.signatureUrl"
                  :alt="`Signature de ${student.name}`"
                  class="signature-image"
                  width="64"
                  height="64"
                  loading="lazy"
                  decoding="async"
                />
                </div>
                <div v-else class="signature-none">Aucune signature</div>
            </div>
            <div v-if="student.meta && student.meta.class === 'excused'">
              <button class="btn-cancel-excuse" type="button" @click="cancelSignature(student)">Annuler</button>
            </div>
            <div class="actions" v-if="!isPlanned && !isExcused(student)">
              <button
                class="btn-present"
                :class="student.meta?.class || 'none'"
                :disabled="isPresentDisabled(student)"
                @click="setStudentStatus(student.id, 'present')"
              >✔</button>
              <button
                class="btn-absent"
                :class="student.meta?.class || 'none'"
                :disabled="isAbsentDisabled(student)"
                @click="setStudentStatus(student.id, 'absent')"
              >✖</button>
            </div>

            </div>
        </div>
        </section>
    </div>
  </div>

  <div v-else class="detail-page empty-state">
    <p>Cours introuvable.</p>
    <button class="btn-modify" @click="goBack">Retour au calendrier</button>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import clockIcon from '../assets/images/clock.svg'
import clockcheckIcon from '../assets/images/clock-check.svg'
import checkIcon from '../assets/images/check.svg'
import absentIcon from '../assets/images/croix-black.svg'
import excusedIcon from '../assets/images/excused-icon.svg'
import excusedSignatureIcon from '../assets/images/excused.svg'
import { useAuthStore, useCalendarStore, useSignaturesStore } from '../stores'

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
      courseRaw: null,
      teachers: [],
      students: [],
      signaturesLocal: [],
      loading: true,
      refreshKey: 0,
      excusedSignatureIcon,
      clockIcon
    }
  },
  computed: {
    ...mapState(useAuthStore, ['user']),
    isPlanned() {
      return this.course && this.course.status === 'planned'
    },
    currentAdminId() {
      return this.user?.id || this.user?.userId || this.user?.user?.id || null
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
    teacherDisplayNames() {
      if (Array.isArray(this.teachers) && this.teachers.length) {
        return this.teachers.map((t) => t.name || t.id).filter(Boolean)
      }
      if (Array.isArray(this.course?.teacher)) {
        return this.course.teacher
          .map((t) => {
            if (typeof t === 'object' && t !== null) {
              const fullName = [t.firstName || t.firstname, t.lastName || t.lastname].filter(Boolean).join(' ').trim()
              return t.name || fullName || t.id
            }
            return t
          })
          .filter(Boolean)
      }
      if (this.course?.teacher) return [this.course.teacher].filter(Boolean)
      return []
    },
    signaturesForCourse() {
      return this.signaturesLocal.filter(sig => String(sig.courseId) === String(this.id))
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    ...mapActions(useCalendarStore, { fetchCourseAction: 'fetchCourse' }),
    ...mapActions(useSignaturesStore, {
      fetchSignatures: 'fetchSignatures',
      addSignature: 'addSignature',
      updateSignature: 'updateSignature',
      removeSignature: 'removeSignature'
    }),
    async loadData() {
      this.loading = true
      try {
        const course = await this.fetchCourseAction(this.id, {
          include: ['classrooms', 'teachers', 'students', 'soloStudents', 'studentGroups']
        })
        const signatures = await this.fetchSignatures(this.id).catch(() => null)
        this.courseRaw = course
        this.course = this.normalizeCourse(course, signatures)
        await this.loadRoster(signatures)
      } catch (error) {
        console.error('Unable to load course', error)
      } finally {
        this.loading = false
      }
    },
    async loadRoster(signatureOverride = null) {
      const sourceCourse = this.courseRaw || this.course || {}
      const baseSignatures = Array.isArray(signatureOverride)
        ? signatureOverride
        : Array.isArray(sourceCourse?.signature)
          ? sourceCourse.signature
          : Array.isArray(sourceCourse?.signatures)
            ? sourceCourse.signatures
            : []
      const normalizeSig = (sig) => this.normalizeSignature(sig)

      const teacherList = Array.isArray(sourceCourse?.teachers)
        ? sourceCourse.teachers
        : Array.isArray(sourceCourse?.teacher)
          ? sourceCourse.teacher
          : Array.isArray(sourceCourse?.teachersId)
            ? sourceCourse.teachersId
            : Array.isArray(sourceCourse?.teacherIds)
              ? sourceCourse.teacherIds
              : sourceCourse?.teacher
                ? [sourceCourse.teacher]
                : sourceCourse?.teacherId
                  ? [sourceCourse.teacherId]
                  : []
      const baseTeachers = teacherList.map((val) => {
        if (typeof val === 'object' && val !== null) return val
        return { teacherId: val }
      })
      const teacherIdSet = new Set(
        baseTeachers
          .map((t) => t.teacherId ?? t.teacher?.id ?? t.id)
          .filter(Boolean)
          .map((id) => String(id))
      )

      const baseStudents = (() => {
        if (Array.isArray(sourceCourse?.students) && sourceCourse.students.length) {
          return sourceCourse.students.map((s) => ({
            studentId: s.id ?? s.studentId ?? s.userId ?? s,
            id: s.id ?? s.studentId ?? s.userId ?? s,
            ...s
          }))
        }

        const groupStudents = Array.isArray(sourceCourse?.studentGroups)
          ? sourceCourse.studentGroups.flatMap((group) => {
              if (group && Array.isArray(group.students)) return group.students
              return []
            })
          : []

        const soloStudents = Array.isArray(sourceCourse?.soloStudents) ? sourceCourse.soloStudents : []

        return [...groupStudents, ...soloStudents].map((s) => ({
          studentId: s.id ?? s.studentId ?? s.userId ?? s,
          id: s.id ?? s.studentId ?? s.userId ?? s,
          ...s
        }))
      })()
      const studentIdSet = new Set(
        baseStudents
          .map((s) => s.studentId ?? s.id)
          .filter(Boolean)
          .map((id) => String(id))
      )

      // Always prefer fresh server signatures to avoid stale states, but only for users attached to the course
      const filteredSignatures = baseSignatures
        .map(normalizeSig)
        .filter(Boolean)
        .filter((sig) => {
          const teacherId = sig.teacherId ?? sig.teacher?.id ?? sig.userId
          const studentId = sig.studentId ?? (typeof sig.student === 'string' ? sig.student : sig.student?.id) ?? sig.userId
          const role = this.getSignatureRole(sig, studentId, teacherId)
          if (role === 'teacher') return teacherId && teacherIdSet.has(String(teacherId))
          if (role === 'student') return studentId && studentIdSet.has(String(studentId))
          return false
        })

      this.signaturesLocal = filteredSignatures

      const teacherSignatures = this.signaturesLocal.filter((sig) => {
        const teacherId = sig.teacherId ?? sig.teacher?.id ?? sig.userId
        const studentId = sig.studentId ?? (typeof sig.student === 'string' ? sig.student : sig.student?.id) ?? sig.userId
        return this.getSignatureRole(sig, studentId, teacherId) === 'teacher' && teacherId
      })
      const studentSignatures = this.signaturesLocal.filter((sig) => {
        const teacherId = sig.teacherId ?? sig.teacher?.id ?? sig.userId
        const studentId = sig.studentId ?? (typeof sig.student === 'string' ? sig.student : sig.student?.id) ?? sig.userId
        return this.getSignatureRole(sig, studentId, teacherId) === 'student' && studentId
      })

      const teacherMerged = [
        ...baseTeachers,
        ...teacherSignatures.map((sig) => ({
          teacherId: sig.teacherId ?? sig.teacher?.id ?? sig.userId,
          firstName: sig.teacher?.firstName ?? sig.teacher?.firstname,
          lastName: sig.teacher?.lastName ?? sig.teacher?.lastname,
          name: sig.teacher?.name,
          signatureUrl: this.signatureImageSrc(sig.image || sig.signatureUrl),
          status: sig.status,
          signatureId: sig.id
        }))
      ]

      const studentMerged = [
        ...baseStudents,
        ...studentSignatures.map((sig) => ({
          studentId: sig.studentId ?? (typeof sig.student === 'string' ? sig.student : sig.student?.id) ?? sig.userId,
          id: sig.studentId ?? (typeof sig.student === 'string' ? sig.student : sig.student?.id) ?? sig.userId,
          firstName: sig.student?.firstName ?? sig.student?.firstname,
          lastName: sig.student?.lastName ?? sig.student?.lastname,
          name: sig.student?.name,
          signatureUrl: this.signatureImageSrc(sig.image || sig.signatureUrl),
          status: sig.status,
          signatureId: sig.id
        }))
      ]

      this.teachers = this.mergePersons(teacherMerged, 'teacher')
      this.students = this.mergePersons(studentMerged, 'student')
      this.applySignatureStatuses()
      console.log('[CalendrierDetail] roster', {
        signaturesLocal: this.signaturesLocal,
        students: this.students
      })
    },
    mergePersons(entries, role) {
      const map = new Map()
      entries.forEach(entry => {
        const id = role === 'teacher'
          ? (entry.teacherId ?? entry.teacher?.id ?? entry.id ?? entry.userId)
          : (entry.studentId ?? entry.student?.id ?? entry.id ?? entry.userId)
        if (!id) return
        const status = entry.status || 'none'
        const existing = map.get(id) || {}
        const firstName = entry.firstName || entry.firstname
        const lastName = entry.lastName || entry.lastname
        const displayName = entry.name || [firstName, lastName].filter(Boolean).join(' ').trim()
        const meta = this.signatureMeta(status)
        const normalizedStatus = meta?.class || status
        map.set(id, {
          id,
          name: existing.name || displayName || `#${id}`,
          signatureStatus: normalizedStatus,
          signatureUrl: entry.signatureUrl || existing.signatureUrl || null,
          signatureId: entry.signatureId || existing.signatureId || null,
          meta: meta || (normalizedStatus ? this.signatureMeta(normalizedStatus) : null)
        })
      })
      return Array.from(map.values())
    },
    normalizeCourse(course, signaturesOverride = null) {
      if (!course) return null

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

      const toDayTime = (value) => {
        const d = toDate(value)
        if (!d) return { day: '', time: '' }
        const hours = `${d.getHours()}`.padStart(2, '0')
        const minutes = `${d.getMinutes()}`.padStart(2, '0')
        return {
          day: `${`${d.getDate()}`.padStart(2, '0')}/${`${d.getMonth() + 1}`.padStart(2, '0')}/${d.getFullYear()}`,
          time: `${hours}h${minutes}`
        }
      }

      const startInfo = toDayTime(course.start || course.startDate || course.date)
      const endInfo = toDayTime(course.end || course.endDate)

      const now = Date.now()
      const startMs = toDate(course.start || course.startDate || course.date)?.getTime() ?? null
      const endMs = toDate(course.end || course.endDate)?.getTime() ?? null

      const signatureList = Array.isArray(signaturesOverride)
        ? signaturesOverride
        : Array.isArray(course.signature)
          ? course.signature
          : Array.isArray(course.signatures)
            ? course.signatures
            : []

      const hasTeacherSig = Array.isArray(signatureList)
        ? signatureList.some(
            (sig) =>
              sig &&
              (sig.type === 'teacher' || sig.role === 'teacher' || (!sig.student && (sig.teacher || sig.teacherId))) &&
              (sig.status === 'signed' || sig.status === 'present' || sig.status === 'late')
          )
        : false

      let status = 'planned'
      if (startMs && now >= startMs && (!endMs || now < endMs)) {
        status = hasTeacherSig ? 'started' : 'started-absent'
      } else if (endMs && now >= endMs) {
        status = hasTeacherSig ? 'finished' : 'finished-absent'
      } else if (startMs && now < startMs) {
        status = 'planned'
      }

      const roomLabel = (() => {
        if (Array.isArray(course.classrooms) && course.classrooms.length) {
          return course.classrooms.map((c) => c?.name || c?.id || '').filter(Boolean).join(', ')
        }
        return course.room || course.roomName || ''
      })()

      const teacherNames = (() => {
        const list = Array.isArray(course?.teachers)
          ? course.teachers
          : Array.isArray(course?.teacher)
            ? course.teacher
            : Array.isArray(course?.teachersId)
              ? course.teachersId
              : Array.isArray(course?.teacherIds)
                ? course.teacherIds
                : course?.teacher
                  ? [course.teacher]
                  : course?.teacherId
                    ? [course.teacherId]
                    : []

        const arr = Array.isArray(list) ? list : [list]
        return arr
          .map((t) => {
            if (typeof t === 'object' && t !== null) {
              return t.name || [t.firstName || t.firstname, t.lastName || t.lastname].filter(Boolean).join(' ').trim() || t.id
            }
            return t
          })
          .map((name) => String(name || '').trim())
          .filter(Boolean)
      })()

      const groupLabel = (() => {
        const names = []
        const appendVal = (val) => {
          if (!val) return
          if (Array.isArray(val)) {
            val.forEach(appendVal)
            return
          }
          if (typeof val === 'object') {
            appendVal(val.name || val.id)
            return
          }
          names.push(String(val))
        }

        appendVal(course.studentGroups)
        appendVal(course.group)
        appendVal(course.className)

        const filtered = names
          .map((n) => String(n || '').trim())
          .filter(Boolean)
          .filter((n) => !n.toLowerCase().startsWith('single-'))

        return filtered.length ? filtered.join(', ') : 'Étudiants variés'
      })()

      return {
        id: course.id,
        subject: course.subject || course.title || course.name || 'Cours',
        day: course.day || startInfo.day,
        startTime: course.startTime || startInfo.time,
        endTime: course.endTime || endInfo.time,
        room: roomLabel,
        teacher: teacherNames,
        group: groupLabel,
        status,
        students: course.students || course.soloStudents || [],
        signature: signatureList
      }
    },
    signatureMeta(status) {
      const map = {
        absent: { label: 'Absent', icon: '✖', class: 'absent' },
        signed: { label: 'Signé', icon: '✔', class: 'signed' },
        present: { label: 'Présent', icon: '✔', class: 'present' },
        late: { label: 'En retard', icon: clockIcon, iconType: 'image', iconAlt: 'En retard', class: 'late' },
        excused: { label: 'Excusé', icon: excusedIcon, iconType: 'image', iconAlt: 'Excusé', class: 'excused' }
      }
      return map[status] || null
    },
    async setTeacherStatus(teacherId, status) {
      const teacher = this.teachers.find((t) => String(t.id) === String(teacherId))
      if (this.isStatusLocked(teacher, status)) return
      await this.saveSignature('teacher', teacherId, status, teacher?.signatureId)
      await this.refreshSilently()
    },
    async setStudentStatus(studentId, status) {
      const student = this.students.find((s) => String(s.id) === String(studentId))
      if (this.isStatusLocked(student, status)) return
      await this.saveSignature('student', studentId, status, student?.signatureId)
      await this.refreshSilently()
    },
    upsertSignature(sig) {
      const normalized = this.normalizeSignature(sig)
      const idx = this.signaturesLocal.findIndex((s) => String(s.id) === String(normalized.id))
      if (idx >= 0) this.signaturesLocal.splice(idx, 1, normalized)
      else this.signaturesLocal.push(normalized)
    },
    signatureImageSrc(value) {
      if (!value) return null
      if (typeof value !== 'string') return value
      const trimmed = value.trim()
      if (!trimmed) return null
      if (trimmed.startsWith('data:')) return trimmed
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
      return `data:image/png;base64,${trimmed}`
    },
    getSignatureRole(sig, studentId, teacherId) {
      const role = sig?.role || sig?.type
      if (role === 'student' || role === 'teacher') return role
      if (studentId && !teacherId) return 'student'
      if (teacherId && !studentId) return 'teacher'
      if (studentId) return 'student'
      if (teacherId) return 'teacher'
      return null
    },
    normalizeSignature(sig) {
      if (!sig) return null
      const studentId = sig.studentId ?? (typeof sig.student === 'string' ? sig.student : sig.student?.id)
      const teacherId = sig.teacherId ?? (typeof sig.teacher === 'string' ? sig.teacher : sig.teacher?.id)
      const status = sig.status === 'invalid' ? 'none' : (sig.status || 'none')
      const role = this.getSignatureRole(sig, studentId, teacherId)
      const image = this.signatureImageSrc(sig.image || sig.signatureUrl)
      return { ...sig, studentId, teacherId, role, status, image, signatureUrl: image || sig.signatureUrl }
    },
    applySignatureStatuses() {
      const sigMap = new Map()
      this.signaturesLocal.forEach((sig) => {
        const studentId = sig.studentId ?? (typeof sig.student === 'string' ? sig.student : sig.student?.id)
        const teacherId = sig.teacherId ?? (typeof sig.teacher === 'string' ? sig.teacher : sig.teacher?.id)
        const sigType = this.getSignatureRole(sig, studentId, teacherId)
        if (studentId && sigType === 'student') sigMap.set(`student-${studentId}`, sig)
        if (teacherId && sigType === 'teacher') sigMap.set(`teacher-${teacherId}`, sig)
      })

      const mapPerson = (person, role) => {
        const keyId = person.id || person.studentId || person.teacherId
        const sig = sigMap.get(`${role}-${keyId}`)
        const status = sig?.status || person.signatureStatus || person.meta?.class || 'none'
        const meta = this.signatureMeta(status) || person.meta || null
        return {
          ...person,
          signatureStatus: meta?.class || status,
          meta,
          signatureId: person.signatureId || sig?.id || null,
          signatureUrl: person.signatureUrl || sig?.image || sig?.signatureUrl || null
        }
      }

      this.students = Array.isArray(this.students) ? this.students.map((s) => mapPerson(s, 'student')) : []
      this.teachers = Array.isArray(this.teachers) ? this.teachers.map((t) => mapPerson(t, 'teacher')) : []
    },
    async setAllPresent() {
      await this.applyBulkStatus('present')
    },
    async setAllAbsent() {
      await this.applyBulkStatus('absent')
    },
    async applyBulkStatus(status) {
      const isBulkPresent = status === 'present'
      const targets = this.students.filter((s) => {
        const current = s?.meta?.class || s?.signatureStatus || 'none'
        if (current === 'excused') return false
        if (isBulkPresent) return current !== 'signed' && current !== 'late'
        return true
      })

      for (const person of targets) {
        if (this.isStatusLocked(person, status)) continue
        await this.saveSignature('student', person.id, status, person.signatureId)
      }
      await this.refreshSilently()
    },
    async saveSignature(role, personId, status, signatureId) {
      if (!this.course?.id) return null
      if (signatureId) {
        const updatePayload = { status }
        const updated = await this.updateSignature(signatureId, updatePayload).catch(() => null)
        if (updated) this.upsertSignature(updated)
        return updated
      }

      const payload = {
        course: this.course.id,
        status,
        method: 'admin',
        date: Math.floor(Date.now() / 1000)
      }

      if (role === 'student') {
        payload.student = personId
      } else {
        payload.teacher = personId
      }

      const created = await this.addSignature(payload).catch(() => null)
      if (created) this.upsertSignature(created)
      return created
    },
    isSigned(person) {
      const status = person?.meta?.class || person?.signatureStatus
      return status === 'signed'
    },
    isStatusLocked(person, nextStatus) {
      const current = person?.meta?.class || person?.signatureStatus || 'none'
      if (current === nextStatus) return true
      if (nextStatus === 'present' && current === 'present') return true
      if (nextStatus === 'absent' && current === 'absent') return true
      return false
    },
    isPresentDisabled(person) {
      const status = person?.meta?.class || person?.signatureStatus
      return status === 'present' || status === 'signed' || status === 'late' || status === 'excused'
    },
    isAbsentDisabled(person) {
      const status = person?.meta?.class || person?.signatureStatus
      return status === 'absent' || status === 'excused'
    },
    isExcused(person) {
      const status = person?.meta?.class || person?.signatureStatus
      return status === 'excused'
    },
    async cancelSignature(person) {
      const sigId = person?.signatureId
      if (!sigId) return
      try {
        await this.removeSignature(sigId)
        await this.refreshSilently()
      } catch (error) {
        console.error('Unable to cancel signature', error)
      }
    },
    goBack() {
      const fromUserId = this.$route.query?.fromUserId
      if (fromUserId) {
        this.$router.push({ name: 'UtilisateurDetail', params: { id: fromUserId } })
        return
      }
      this.$router.push({
        name: 'Calendrier',
        query: { date: this.course?.day }
      })
    },
    async refreshSilently() {
      try {
        await this.loadData()
        this.refreshKey += 1
      } catch (error) {
        console.error('Unable to refresh course silently', error)
      }
    },
    goEdit() {
      if (!this.course) return
      this.$router.push({ name: 'NouveauCours', query: { courseId: this.course.id } })
    }
  }
}
</script>


<style scoped src="../assets/calendrierdetail.css"></style>
