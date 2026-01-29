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
      <button class="role-add-btn" type="button" @click="handleAction">
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
            v-model="settings.QRCodeEnabled" 
            type="checkbox"
            class="checkbox-input"
          />
          <img 
            :src="settings.QRCodeEnabled ? checkboxFilled : checkboxEmpty" 
            alt="checkbox" 
            class="checkbox-icon"
          />
          <span>Signature par QR Code activée</span>
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

  <div v-if="selectedItem && section !== 'parametres'" class="user-modal-overlay" @click.self="closeItem">
    <div class="user-modal">
      <header class="user-modal__header">
        <div class="user-modal__header-content">
          <div class="modal-back">
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
          <button class="btn-save" type="button" @click="saveItem">
            <span>Enregistrer</span>
          </button>
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
    this.fetchRooms({ schoolId: this.schoolId }).catch(() => {})
    this.fetchBeacons({ schoolId: this.schoolId }).catch(() => {})
    this.loadSettings()
  },
  watch: {
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
        return this.salles.map((salle, index) => ({
          key: `salle-${index}`,
          name: salle.name,
          displayName: salle.name,
          type: `${(salle.balises || []).length} balise${(salle.balises || []).length !== 1 ? 's' : ''}`,
          profilePicture: null,
          balises: Array.isArray(salle.balises) ? salle.balises : []
        }))
      } else if (this.section === 'balises') {
        return (this.balisesStore || []).map((balise, index) => ({
          key: balise.id || `balise-${index}`,
          name: balise.label || balise.name || balise.id || `Balise ${index + 1}`,
          displayName: balise.label || balise.name || balise.id || `Balise ${index + 1}`,
          type: 'Balise',
          profilePicture: null
        }))
      }
      return []
    },
    schoolId() {
      return this.currentUser?.schoolId || this.currentUser?.school_id || this.currentUser?.school?.id || null
    },
  },
  methods: {
    ...mapActions(useRoomsStore, ['fetchRooms']),
    ...mapActions(useBeaconsStore, ['fetchBeacons']),
    ...mapActions(useSchoolsStore, ['updateSchoolPreferences']),
    goBack() {
      this.$router.push({ name: 'Ecole' }).catch(() => {})
    },
    openItem(item) {
      this.selectedItem = item
      this.editingName = item.displayName
    },
    saveItem() {
      if (!this.selectedItem || !this.editingName.trim()) return
      this.selectedItem.displayName = this.editingName
      this.selectedItem.name = this.editingName
      if (this.isNewItem) {
        alert('Nouvel élément ajouté')
      } else {
        alert('Changements enregistrés')
      }
      this.closeItem()
    },
    deleteItem(item) {
      if (!item) return
      alert(`Suppression de "${item.displayName}" à venir`)
      this.closeItem()
    },
    handleAction() {
      if (this.section === 'salles') {
        this.openNewItem('salle')
      } else if (this.section === 'balises') {
        this.openNewItem('balise')
      } else if (this.section === 'parametres') {
        this.savePreferences()
      }
    },
    openNewItem(type) {
      const newItem = {
        key: `new-${type}-${Date.now()}`,
        name: '',
        displayName: '',
        type: type === 'salle' ? '0 balise' : 'Balise',
        profilePicture: null
      }
      this.selectedItem = newItem
      this.editingName = ''
      this.isNewItem = true
      document.body.style.overflow = 'hidden'
    },
    closeItem() {
      this.selectedItem = null
      this.editingName = ''
      this.isNewItem = false
      document.body.style.overflow = ''
    },
    itemIcon(type) {
      return new URL('../assets/images/user.svg', import.meta.url).href
    },
    itemClass(type) {
      return ''
    },
    loadSettings() {
      if (typeof localStorage === 'undefined') return
      try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        this.settings = {
          ...this.settings,
          ...parsed
        }
      } catch (error) {
        console.error('Impossible de charger les paramètres', error)
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
        id: schoolId,
        defaultSignatureClosingDelay: Number(this.settings.closureDelay) ?? 15,
        teacherCanModifyClosingdelay: Boolean(this.settings.teachersCanModifyDelay),
        studentsCanSignBeforeTeacher: Boolean(this.settings.studentsCanSignBefore),
        nfcEnabled: Boolean(this.settings.contactSignatureEnabled),
        flashlightEnabled: Boolean(this.settings.torchSignatureEnabled),
        qrCodeEnabled: Boolean(this.settings.QRCodeEnabled)
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
