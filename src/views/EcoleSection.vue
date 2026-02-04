<template>
  <main class="edit-user-page group-detail-page" v-if="section !== 'parametres'">
    <header class="edit-user-header">
      <div class="edit-user-header-left">
        <button class="edit-back-btn" type="button" @click="goBack">
          <img src="../assets/images/arrow-left.svg" alt="Retour" />
        </button>
        <div>
          <h1 class="edit-title">{{ sectionLabel }}</h1>
        </div>
      </div>
      <button
        v-if="section !== 'balises'"
        class="role-add-btn"
        type="button"
        @click="handleAction"
      >
        <img src="../assets/images/plus-sign-white.svg" alt="Ajouter" class="plus-icon" />
        {{ buttonLabel }}
      </button>
    </header>

    <section class="role-school-grid">
      <div class="user-cards">
        <article v-for="item in displayItems" :key="item.key" class="user-card school-card" @click="openItem(item)">
          <div class="name">{{ item.displayName }}</div>
          <div class="role" :class="itemClass(item.type)">
                    <img src="../assets/images/balise.svg" alt="balise" class="role-icon" />
            <div class="role-value school-value">{{ item.type }}</div>
          </div>
        </article>
      </div>
    </section>
  </main>

  <main class="edit-user-page group-detail-page" v-else>
    <header class="edit-user-header">
      <div class="edit-user-header-left">
        <button class="edit-back-btn" type="button" @click="goBack">
          <img src="../assets/images/arrow-left.svg" alt="Retour" />
        </button>
        <div>
          <h1 class="edit-title">{{ sectionLabel }}</h1>
        </div>
      </div>
      <button class="role-add-btn" type="button" @click="handleAction">
        {{ buttonLabel }}
      </button>
    </header>

    <form class="parametres-form">
      <fieldset>
        <p>Général</p>
        
        <div class="form-group">
          <label for="closure-delay">Délai de fermeture de l'émargement par défaut</label>
          <input 
            id="closure-delay" 
            v-model.number="settings.closureDelay" 
            type="number" 
            min="0" 
            placeholder="Entrez le délai en minutes"
          />
        </div>

        <label class="checkbox-item">
          <input 
            v-model="settings.teachersCanModifyDelay" 
            type="checkbox"
            class="checkbox-input"
          />
          <img 
            :src="settings.teachersCanModifyDelay ? checkboxFilled : checkboxEmpty" 
            alt="checkbox" 
            class="checkbox-icon"
          />
          <span>Les enseignants peuvent modifier le délai de fermeture</span>
        </label>

        <label class="checkbox-item">
          <input 
            v-model="settings.studentsCanSignBefore" 
            type="checkbox"
            class="checkbox-input"
          />
          <img 
            :src="settings.studentsCanSignBefore ? checkboxFilled : checkboxEmpty" 
            alt="checkbox" 
            class="checkbox-icon"
          />
          <span>Les étudiants peuvent émarger avant l'enseignant</span>
        </label>

        <label class="checkbox-item">
          <input 
            v-model="settings.contactSignatureEnabled" 
            type="checkbox"
            class="checkbox-input"
          />
          <img 
            :src="settings.contactSignatureEnabled ? checkboxFilled : checkboxEmpty" 
            alt="checkbox" 
            class="checkbox-icon"
          />
          <span>Signature par contact activée</span>
        </label>

        <label class="checkbox-item">
          <input 
            v-model="settings.torchSignatureEnabled" 
            type="checkbox"
            class="checkbox-input"
          />
          <img 
            :src="settings.torchSignatureEnabled ? checkboxFilled : checkboxEmpty" 
            alt="checkbox" 
            class="checkbox-icon"
          />
          <span>Signature par lampe torche activée</span>
        </label>

        <label class="checkbox-item">
          <input 
            v-model="settings.disableCourseModification" 
            type="checkbox"
            class="checkbox-input"
          />
          <img 
            :src="settings.disableCourseModification ? checkboxFilled : checkboxEmpty" 
            alt="checkbox" 
            class="checkbox-icon"
          />
          <span>Désactiver la modification de cours depuis l'interface</span>
        </label>
      </fieldset>
    </form>
  </main>

  <div
    v-if="selectedItem && section === 'salles'"
    class="user-modal-overlay"
    @click.self="closeItem"
  >
    <div class="user-modal">
      <header class="user-modal__header">
        <div class="user-modal__header-content">
          <div>
            <button class="modal-btn ghost" type="button" @click="closeItem">
              <img src="../assets/images/arrow-left.svg" alt="arrow" class="btn-icon" />
            </button>
          </div>
          <div class="modal-actions">
            <button class="modal-btn danger" type="button" @click="deleteItem(selectedItem)">
              <img src="../assets/images/delete.svg" alt="delete" class="btn-icon" />
            </button>
          </div>
        </div>
      </header>
      <div class="user-modal__body">
        <div class="modal-edit-form">
          <input
            id="item-name"
            v-model="editingName"
            type="text"
            class="edit-input"
            placeholder="Nom"
          />
          <p class="beacon-serials" v-if="selectedRoomBeaconSerials.length">
            Balises : {{ selectedRoomBeaconSerials.join(', ') }}
          </p>
          <p class="beacon-serials muted" v-else>Balises : aucune</p>
          <button class="btn-save" type="button" @click="saveItem">
            <span>Enregistrer</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="selectedItem && section === 'balises'"
    class="select-modal"
    @click.self="closeItem"
  >
    <div class="select-modal__panel">
      <header class="select-modal__header">
        <div class="header-row">
          <div class="header-back-container">
            <button class="modal-back modal-btn" type="button" @click="closeItem">
              <img src="../assets/images/arrow-left.svg" alt="Retour" />
            </button>
          </div>
          <h3>Assigner une salle</h3>
          <div class="header-save-container">
            <button
              class="modal-save"
              type="button"
              :aria-busy="isSavingAssignment"
              :disabled="isSavingAssignment"
              @click="saveBeaconAssignment"
            >
              <img src="../assets/images/check-white.svg" alt="Valider" />
            </button>
          </div>
        </div>
        <p class="beacon-name">Balise : {{ selectedItem.displayName }}</p>
        <div class="modal-search">
          <div class="modal-search-input-wrapper">
            <input
              v-model="roomSearch"
              type="search"
              placeholder="A 001"
              class="text-input modal-search-input"
            />
            <button class="modal-search-icon" type="button" aria-label="Rechercher">
              <img src="../assets/images/search.svg" alt="" />
            </button>
          </div>
        </div>
      </header>
      <div class="select-modal__grid">
        <div class="select-modal__group">
          <p>Salles</p>
          <div class="select-modal__pillgrid">
            <button
              v-for="room in filteredRoomOptions"
              :key="room.id"
              type="button"
              class="select-pill"
              :class="{ active: selectedRoomDraft === room.id }"
              @click="toggleRoomDraft(room.id)"
            >
              <span>{{ room.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import defaultProfile from '../assets/images/user-invert.svg'
import checkboxEmpty from '../assets/images/checkbox-empty.svg'
import checkboxFilled from '../assets/images/checkbox-filled.svg'
import { useRoomsStore, useBeaconsStore, useAuthStore, useSchoolsStore } from '../stores'

const LABELS = {
  salles: 'Salles',
  balises: 'Balises',
  parametres: 'Paramètres'
}

const BUTTON_LABELS = {
  salles: 'Ajouter une salle',
  balises: 'Ajouter une balise',
  parametres: 'Enregistrer'
}

const SETTINGS_STORAGE_KEY = 'ecole-settings'

export default {
  name: 'EcoleSection',
  props: {
    section: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      selectedItem: null,
      editingName: '',
      isNewItem: false,
      defaultProfile,
      checkboxEmpty,
      checkboxFilled,
      roomSearch: '',
      selectedRoomDraft: null,
      isSavingAssignment: false,
      settings: {
        closureDelay: 0,
        teachersCanModifyDelay: false,
        studentsCanSignBefore: false,
        contactSignatureEnabled: false,
        torchSignatureEnabled: false,
        QRCodeEnabled: false,
        disableCourseModification: false
      }
    }
  },
  created() {
    this.refreshSectionData()
  },
  watch: {
    section() {
      this.refreshSectionData()
    },
    schoolId(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.refreshSectionData()
      }
    },
    settings: {
      deep: true,
      handler() {
        this.persistSettings()
      }
    }
  },
  computed: {
    ...mapState(useRoomsStore, { salles: 'rooms' }),
    ...mapState(useBeaconsStore, { balisesStore: 'beacons' }),
    ...mapState(useAuthStore, { currentUser: 'user' }),
    ...mapState(useSchoolsStore, ['schools']),
    sectionLabel() {
      return LABELS[this.section] || this.section
    },
    buttonLabel() {
      return BUTTON_LABELS[this.section] || 'Ajouter'
    },
    displayItems() {
      if (this.section === 'salles') {
        return this.salles.map((salle, index) => {
          const beaconList = this.roomBeacons(salle)
          const beaconCount = beaconList.length
          return {
          key: salle.id || `salle-${index}`,
          id: salle.id,
          name: salle.name,
          displayName: salle.name,
          type: `${beaconCount} balise${beaconCount !== 1 ? 's' : ''}`,
          profilePicture: null,
          balises: Array.isArray(salle.balises) ? salle.balises : [],
          beacons: beaconList
        }
        })
      } else if (this.section === 'balises') {
        return (this.balisesStore || []).map((balise, index) => ({
          key: balise.id || `balise-${index}`,
          id: balise.id,
          name: this.formatBeaconLabel(balise.serialNumber ?? balise.serial_number ?? balise.label ?? balise.name ?? balise.id) || `Balise ${index + 1}`,
          displayName: this.formatBeaconLabel(balise.serialNumber ?? balise.serial_number ?? balise.label ?? balise.name ?? balise.id) || `Balise ${index + 1}`,
          type: this.roomNameForBeacon(balise) || (balise.classroom ? this.displayRoomFallback(balise.classroom) : 'Aucune salle'),
          profilePicture: null,
          assignedRoomId: this.findRoomIdForBeacon(balise) || balise.classroom || null
        }))
      }
      return []
    },
    filteredRoomOptions() {
      const term = (this.roomSearch || '').trim().toLowerCase()
      return (this.salles || [])
        .map((room) => ({ id: room.id, name: room.name || `Salle ${room.id}` }))
        .filter((room) => room.name.toLowerCase().includes(term))
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    selectedRoomBeaconSerials() {
      if (this.section !== 'salles' || !this.selectedItem) return []
      const room = (this.salles || []).find((r) => String(r.id) === String(this.selectedItem.id)) || this.selectedItem
      return this.roomBeacons(room)
        .map((b, idx) => {
          const raw = b.serialNumber ?? b.serial_number ?? b.label ?? b.name ?? `Balise ${idx + 1}`
          return this.formatBeaconLabel(raw) || raw
        })
        .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
        .map((v) => String(v))
    },
    schoolId() {
      return this.currentUser?.schoolId || this.currentUser?.school_id || this.currentUser?.school?.id || null
    },
  },
  methods: {
    ...mapActions(useRoomsStore, ['fetchRooms', 'fetchRoom', 'createRoom', 'updateRoom', 'deleteRoom']),
    ...mapActions(useBeaconsStore, ['fetchBeacons', 'fetchBeacon', 'assignBeaconToClass', 'removeBeaconFromClass']),
    ...mapActions(useSchoolsStore, ['updateSchoolPreferences', 'fetchSchool']),
    formatBeaconLabel(value) {
      if (value === null || value === undefined) return ''
      const raw = String(value).trim()
      if (!raw) return ''
      if (/^\d+$/.test(raw)) return raw.padStart(6, '0')
      return raw
    },
    async refreshSectionData() {
      if (this.section === 'parametres') {
        await this.loadSettings()
        return
      }

      const schoolId = this.schoolId
      if (!schoolId) return

      if (this.section === 'salles' || this.section === 'balises') {
        await this.fetchRooms({ schoolId }).catch(() => {})
      }
      if (this.section === 'balises') {
        await this.fetchBeacons({ schoolId }).catch(() => {})
      }
    },
    goBack() {
      this.$router.push({ name: 'Ecole' }).catch(() => {})
    },
    async openItem(item) {
      this.editingName = item.displayName
      this.isNewItem = false
      this.roomSearch = ''

      if (this.section === 'balises' && item?.id) {
        try {
          const fresh = await this.fetchBeacon(item.id)
          const assignedRoomId = this.findRoomIdForBeacon(fresh) || fresh.classroom || null
          this.selectedItem = {
            ...item,
            ...fresh,
            assignedRoomId
          }
          this.selectedRoomDraft = assignedRoomId
        } catch (_err) {
          const assignedRoomId = this.findRoomIdForBeacon(item) || item.classroom || null
          this.selectedItem = { ...item, assignedRoomId }
          this.selectedRoomDraft = assignedRoomId
        }
      } else if (this.section === 'salles' && item?.id) {
        try {
          const freshRoom = await this.fetchRoom(item.id, { include: 'beacons' })
          this.selectedItem = { ...item, ...freshRoom, displayName: freshRoom.name || item.displayName || '' }
        } catch (_err) {
          this.selectedItem = item
        }
      } else {
        this.selectedItem = item
        this.selectedRoomDraft = this.section === 'balises' ? this.findRoomIdForBeacon(item) : null
      }

      document.body.style.overflow = 'hidden'
    },
    saveItem() {
      if (!this.selectedItem || !this.editingName.trim()) return
      if (this.section !== 'salles') {
        alert('Modification disponible uniquement pour les salles')
        return
      }
      const name = this.editingName.trim()
      const id = this.selectedItem.id
      const action = this.isNewItem
        ? () => this.createRoom({ name })
        : () => this.updateRoom(id, { name })
      action()
        .then(() => this.fetchRooms({ schoolId: this.schoolId }))
        .then(() => this.closeItem())
        .catch((error) => {
          console.error('Erreur lors de la sauvegarde de la salle', error)
          alert("Impossible d'enregistrer la salle")
        })
    },
    deleteItem(item) {
      if (!item) return
      if (this.section !== 'salles') {
        alert('Suppression disponible uniquement pour les salles')
        this.closeItem()
        return
      }
      this.deleteRoom(item.id)
        .then(() => this.fetchRooms({ schoolId: this.schoolId }))
        .then(() => this.closeItem())
        .catch((error) => {
          console.error('Erreur lors de la suppression de la salle', error)
          alert('Impossible de supprimer la salle')
        })
    },
    handleAction() {
      if (this.section === 'salles') {
        this.openNewItem('salle')
      } else if (this.section === 'parametres') {
        this.savePreferences()
      }
    },
    openNewItem(type) {
      const newItem = {
        key: `new-${type}-${Date.now()}`,
        id: null,
        name: '',
        displayName: '',
        type: type === 'salle' ? '0 balise' : 'Balise',
        profilePicture: null
      }
      this.selectedItem = newItem
      this.editingName = ''
      this.isNewItem = true
      this.roomSearch = ''
      this.selectedRoomDraft = null
      document.body.style.overflow = 'hidden'
    },
    closeItem() {
      this.selectedItem = null
      this.editingName = ''
      this.isNewItem = false
      this.roomSearch = ''
      this.selectedRoomDraft = null
      this.isSavingAssignment = false
      document.body.style.overflow = ''
    },
    roomBeacons(room) {
      if (!room) return []
      if (Array.isArray(room.beacons)) return room.beacons
      if (Array.isArray(room.balises)) return room.balises
      return []
    },
    normalizeBeaconKey(beacon) {
      if (!beacon) return ''
      return String(beacon.id ?? beacon.serialNumber ?? beacon.label ?? beacon.name ?? '').trim()
    },
    resolveRoomNameById(roomId) {
      if (!roomId) return null
      const room = (this.salles || []).find((r) => String(r.id) === String(roomId))
      return room?.name || null
    },
    displayRoomFallback(roomId) {
      return `Salle ${String(roomId).slice(0, 6)}`
    },
    normalizeBeaconEntry(entry) {
      if (entry === null || entry === undefined) return ''
      if (typeof entry === 'object') {
        return String(entry.id ?? entry.serialNumber ?? entry.label ?? entry.name ?? '').trim()
      }
      return String(entry).trim()
    },
    findRoomIdForBeacon(beacon) {
      const beaconKey = this.normalizeBeaconKey(beacon)
      if (!beaconKey) return null
      if (beacon?.classroom) return beacon.classroom
      const foundRoom = (this.salles || []).find((room) =>
        (room.balises || []).some((balise) => this.normalizeBeaconEntry(balise) === beaconKey)
      )
      return foundRoom?.id ?? null
    },
    roomNameForBeacon(beacon) {
      const roomId = this.findRoomIdForBeacon(beacon)
      if (!roomId) return null
      return this.resolveRoomNameById(roomId) || this.displayRoomFallback(roomId)
    },
    toggleRoomDraft(roomId) {
      this.selectedRoomDraft = this.selectedRoomDraft === roomId ? null : roomId
    },
    async saveBeaconAssignment() {
      if (!this.selectedItem || !this.selectedItem.id) {
        this.closeItem()
        return
      }

      const beaconId = this.selectedItem.id
      const currentRoomId = this.selectedItem.assignedRoomId ?? this.findRoomIdForBeacon(this.selectedItem)
      const targetRoomId = this.selectedRoomDraft ?? null
      const normalizedCurrent = currentRoomId ? String(currentRoomId) : null
      const normalizedTarget = targetRoomId ? String(targetRoomId) : null

      if (normalizedCurrent === normalizedTarget) {
        this.closeItem()
        return
      }

      this.isSavingAssignment = true
      try {
        if (normalizedCurrent && normalizedCurrent !== normalizedTarget) {
          await this.removeBeaconFromClass(beaconId, normalizedCurrent)
        }

        if (normalizedTarget && normalizedTarget !== normalizedCurrent) {
          await this.assignBeaconToClass(beaconId, normalizedTarget)
        }

        await Promise.all([
          this.fetchBeacons({ schoolId: this.schoolId }).catch(() => {}),
          this.fetchRooms({ schoolId: this.schoolId }).catch(() => {})
        ])
        this.closeItem()
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la balise', error)
        alert("Impossible de mettre à jour l'assignation de la balise")
      } finally {
        this.isSavingAssignment = false
      }
    },
    itemIcon(type) {
      return new URL('../assets/images/user.svg', import.meta.url).href
    },
    itemClass(type) {
      return ''
    },
    async loadSettings() {
      if (this.section !== 'parametres') return

      const schoolId = this.schoolId
      let loaded = false

      if (schoolId) {
        try {
          const school = await this.fetchSchool(schoolId, { expand: 'preferences' })
          const prefs = school?.preferences ?? null
          if (prefs) {
            this.settings = {
              ...this.settings,
              closureDelay: Number(prefs.defaultSignatureClosingDelay ?? 0),
              teachersCanModifyDelay: Boolean(prefs.teacherCanModifyClosingdelay),
              studentsCanSignBefore: Boolean(prefs.studentsCanSignBeforeTeacher),
              contactSignatureEnabled: Boolean(prefs.nfcEnabled),
              torchSignatureEnabled: Boolean(prefs.flashlightEnabled),
              disableCourseModification: Boolean(prefs.disableCourseModificationFromUI)
            }
            loaded = true
          }
        } catch (error) {
          console.error('Impossible de charger les préférences établissement', error)
        }
      }

      if (!loaded && typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
          if (raw) {
            const parsed = JSON.parse(raw)
            this.settings = { ...this.settings, ...parsed }
          }
        } catch (error) {
          console.error('Impossible de charger les paramètres locaux', error)
        }
      }
    },
    persistSettings() {
      if (typeof localStorage === 'undefined') return
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings))
      } catch (error) {
        console.error('Impossible de sauvegarder les paramètres', error)
      }
    },
    async savePreferences() {
      this.persistSettings()
      const schoolId = this.schoolId
      if (!schoolId) {
        alert('Aucun établissement associé, préférences non envoyées')
        return
      }
      const payload = {
        defaultSignatureClosingDelay: Number(this.settings.closureDelay) ?? 15,
        teacherCanModifyClosingdelay: Boolean(this.settings.teachersCanModifyDelay),
        studentsCanSignBeforeTeacher: Boolean(this.settings.studentsCanSignBefore),
        nfcEnabled: Boolean(this.settings.contactSignatureEnabled),
        flashlightEnabled: Boolean(this.settings.torchSignatureEnabled),
        disableCourseModificationFromUI: Boolean(this.settings.disableCourseModification)
      }
      try {
        await this.updateSchoolPreferences(schoolId, payload)
        alert('Paramètres enregistrés')
      } catch (error) {
        console.error('Impossible de sauvegarder les préférences établissement', error)
        alert("Échec de l'enregistrement des paramètres")
      }
    }
  },
  beforeUnmount() {
    document.body.style.overflow = ''
  }
}
</script>

<style scoped src="../assets/ecole-section.css"></style>
