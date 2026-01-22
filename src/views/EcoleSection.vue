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
        <article v-for="item in displayItems" :key="item.key" class="user-card school-card">
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
      </fieldset>
    </form>
  </main>
</template>

<script>
import defaultProfile from '../assets/images/user-invert.svg'
import sallesData from '../assets/json/salles.json'
import checkboxEmpty from '../assets/images/checkbox-empty.svg'
import checkboxFilled from '../assets/images/checkbox-filled.svg'

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
      defaultProfile,
      salles: sallesData,
      checkboxEmpty,
      checkboxFilled,
      settings: {
        closureDelay: 0,
        teachersCanModifyDelay: false,
        studentsCanSignBefore: false,
        contactSignatureEnabled: false,
        torchSignatureEnabled: false
      }
    }
  },
  computed: {
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
          type: `${salle.balises.length} balise${salle.balises.length !== 1 ? 's' : ''}`,
          profilePicture: null,
          balises: salle.balises
        }))
      } else if (this.section === 'balises') {
        const allBalises = new Set()
        this.salles.forEach(salle => {
          salle.balises.forEach(balise => allBalises.add(balise))
        })
        return Array.from(allBalises).map((balise, index) => ({
          key: `balise-${index}`,
          name: balise,
          displayName: balise,
          type: 'Balise',
          profilePicture: null
        }))
      }
      return []
    },
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'Ecole' }).catch(() => {})
    },
    handleAction() {
      if (this.section === 'salles') {
        alert('Ajout d\'une salle à venir')
      } else if (this.section === 'balises') {
        alert('Ajout d\'une balise à venir')
      } else if (this.section === 'parametres') {
        alert('Enregistrement à venir')
      }
    },
    itemIcon(type) {
      return new URL('../assets/images/user.svg', import.meta.url).href
    },
    itemClass(type) {
      return ''
    }
  }
}
</script>

<style scoped src="../assets/groupes-classes-detail.css"></style>
