<template>
  <div class="messagerie-layout">
    <Sidebar />

    <div class="main-wrapper">
      <header class="messagerie-header">
        <div class="header-title">
          <h1>Messagerie</h1>
          <p>Gérer vos messages</p>
        </div>
      </header>

      <main class="messagerie-content">
        <n-spin v-if="isLoading">
          <template #description>Chargement...</template>
        </n-spin>

        <n-alert v-else-if="error" type="error">
          {{ error }}
        </n-alert>

        <div v-else class="messagerie-container">
          <!-- Storage Info -->
          <div v-if="storageInfo" class="storage-info">
            <div class="storage-header">
              <h3>📦 Espace de stockage</h3>
              <span class="storage-percentage" :style="{ color: getStorageColor() }">
                {{ storageInfo.percentage }}%
              </span>
            </div>
            <div class="storage-bar">
              <div
                class="storage-used"
                :style="{ width: storageInfo.percentage + '%', backgroundColor: getStorageColor() }"
              ></div>
            </div>
            <div class="storage-details">
              <span>Utilisé: {{ storageInfo.used }}</span>
              <span>Disponible: {{ storageInfo.remaining }}</span>
              <span>Max: {{ storageInfo.max }}</span>
              <n-button
                type="info"
                size="small"
                :loading="isRepairingStorage"
                @click="repairOrphanedFiles"
              >
                🔧 Réparer
              </n-button>
            </div>
          </div>

          <!-- Tabs for Received/Sent/Compose -->
          <n-tabs v-model:value="activeTab" type="card" size="large">
            <!-- Messages Reçus -->
            <n-tab-pane name="received" tab="📬 Messages Reçus">
              <div class="messages-layout">
                <div class="messages-sidebar">
                  <n-empty v-if="receivedMessages.length === 0" description="Aucun message reçu" />

                  <div v-else class="messages-list-vertical">
                    <div
                      v-for="msg in receivedMessages"
                      :key="msg.id_message"
                      class="message-list-item"
                      :class="{
                        unread: !msg.lu,
                        selected: selectedMsg?.id_message === msg.id_message,
                      }"
                      @click="selectMessage(msg)"
                    >
                      <div class="list-item-sender">
                        {{ msg.expediteur?.prenom }} {{ msg.expediteur?.nom }}
                      </div>
                      <div class="list-item-subject">{{ msg.sujet }}</div>
                      <div class="list-item-date">{{ formatDate(msg.date_envoi) }}</div>
                      <div v-if="msg.pieces_jointes.length > 0" class="list-item-attachment">
                        📎 {{ msg.pieces_jointes.length }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="messages-detail">
                  <div v-if="selectedMsg && !isMessageSent" class="detail-content-wrapper">
                    <div class="detail-header">
                      <div>
                        <strong>De:</strong> {{ selectedMsg.expediteur?.prenom }}
                        {{ selectedMsg.expediteur?.nom }} ({{ selectedMsg.expediteur?.email }})
                      </div>
                      <div class="detail-subject">{{ selectedMsg.sujet }}</div>
                      <div class="detail-date">{{ formatDate(selectedMsg.date_envoi) }}</div>
                    </div>

                    <n-divider />

                    <div class="detail-content">
                      {{ selectedMsg.contenu }}
                    </div>

                    <div v-if="selectedMsg.pieces_jointes.length > 0" class="detail-attachments">
                      <n-divider />
                      <h4>Pièces jointes</h4>
                      <div class="attachments-list">
                        <a
                          v-for="pj in selectedMsg.pieces_jointes"
                          :key="pj.id_piece_jointe"
                          :href="pj.chemin_fichier"
                          target="_blank"
                          class="attachment-link"
                        >
                          📄 {{ formatFileName(pj.nom_fichier) }} ({{
                            formatFileSize(pj.taille_octets)
                          }})
                        </a>
                      </div>
                    </div>

                    <div class="detail-actions">
                      <n-button @click="deleteSelectedMessage" type="error" :loading="isDeleting">
                        Supprimer
                      </n-button>
                    </div>
                  </div>
                  <div v-else-if="!selectedMsg" class="no-selection">
                    Sélectionnez un message pour voir son contenu
                  </div>
                </div>
              </div>
            </n-tab-pane>

            <!-- Messages Envoyés -->
            <n-tab-pane name="sent" tab="📤 Messages Envoyés">
              <div class="messages-layout">
                <div class="messages-sidebar">
                  <n-empty v-if="sentMessages.length === 0" description="Aucun message envoyé" />

                  <div v-else class="messages-list-vertical">
                    <div
                      v-for="msg in sentMessages"
                      :key="msg.id_message"
                      class="message-list-item"
                      :class="{ selected: selectedMsg?.id_message === msg.id_message }"
                      @click="selectMessage(msg, true)"
                    >
                      <div class="list-item-sender">
                        À: {{ msg.destinataire?.prenom }} {{ msg.destinataire?.nom }}
                      </div>
                      <div class="list-item-subject">{{ msg.sujet }}</div>
                      <div class="list-item-date">{{ formatDate(msg.date_envoi) }}</div>
                      <div v-if="msg.pieces_jointes.length > 0" class="list-item-attachment">
                        📎 {{ msg.pieces_jointes.length }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="messages-detail">
                  <div v-if="selectedMsg && isMessageSent" class="detail-content-wrapper">
                    <div class="detail-header">
                      <div>
                        <strong>À:</strong> {{ selectedMsg.destinataire?.prenom }}
                        {{ selectedMsg.destinataire?.nom }} ({{ selectedMsg.destinataire?.email }})
                      </div>
                      <div class="detail-subject">{{ selectedMsg.sujet }}</div>
                      <div class="detail-date">{{ formatDate(selectedMsg.date_envoi) }}</div>
                    </div>

                    <n-divider />

                    <div class="detail-content">
                      {{ selectedMsg.contenu }}
                    </div>

                    <div v-if="selectedMsg.pieces_jointes.length > 0" class="detail-attachments">
                      <n-divider />
                      <h4>Pièces jointes</h4>
                      <div class="attachments-list">
                        <a
                          v-for="pj in selectedMsg.pieces_jointes"
                          :key="pj.id_piece_jointe"
                          :href="pj.chemin_fichier"
                          target="_blank"
                          class="attachment-link"
                        >
                          📄 {{ formatFileName(pj.nom_fichier) }} ({{
                            formatFileSize(pj.taille_octets)
                          }})
                        </a>
                      </div>
                    </div>

                    <div class="detail-actions">
                      <n-button @click="deleteSelectedMessage" type="error" :loading="isDeleting">
                        Supprimer
                      </n-button>
                    </div>
                  </div>
                  <div v-else-if="!selectedMsg" class="no-selection">
                    Sélectionnez un message pour voir son contenu
                  </div>
                </div>
              </div>
            </n-tab-pane>

            <!-- Composer un message -->
            <n-tab-pane name="compose" tab="✏️ Nouveau Message">
              <div class="compose-form">
                <n-form :model="newMessage">
                    <n-form-item label="Destinataire(s)">
                      <n-button @click="showRecipientSelector = true" style="width:100%; justify-content:flex-start">
                        {{ selectedRecipients.length
                          ? selectedRecipients.map(u => `${u.prenom} ${u.nom}`).join(', ')
                          : 'Sélectionner des destinataires...' }}
                      </n-button>
                    </n-form-item>

                    <RecipientSelectorModal
                      v-if="showRecipientSelector"
                      :users="allUsers"
                      :eleve-details="allEleveDetails"
                      @confirm="(users: RawUser[]) => { selectedRecipients = users; newMessage.destinataire_id = users[0]?.id_user }"
                      @close="showRecipientSelector = false"
                    />

                  <n-form-item label="Sujet">
                    <n-input
                      v-model:value="newMessage.sujet"
                      placeholder="Entrez le sujet du message"
                      maxlength="255"
                    />
                  </n-form-item>

                  <n-form-item label="Message">
                    <n-input
                      v-model:value="newMessage.contenu"
                      type="textarea"
                      placeholder="Écrivez votre message..."
                      :rows="8"
                      maxlength="5000"
                      show-count
                    />
                  </n-form-item>

                  <n-form-item label="Pièces jointes">
                    <div class="file-upload">
                      <input
                        ref="fileInputRef"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.py,.java,.c,.js,.html,.css,.sql,.zip,.rar,.kml,.svg,.mov,.mp4,.mp3,.wav,.png,.jpeg,.jpg,.gif,.webp"
                        @change="handleFileSelect"
                        class="file-input"
                      />
                      <n-button @click="fileInputRef?.click()" type="default">
                        📎 Ajouter des pièces jointes
                      </n-button>
                    </div>
                    <div v-if="selectedFiles.length > 0" class="selected-files">
                      <div v-for="(file, idx) in selectedFiles" :key="idx" class="file-item">
                        <span>{{ file.name }}</span>
                        <n-button text @click="removeFile(idx)">✕</n-button>
                      </div>
                    </div>
                  </n-form-item>

                  <div class="form-actions">
                    <n-button type="primary" @click="sendNewMessage" :loading="isSending">
                      Envoyer
                    </n-button>
                    <n-button quaternary @click="resetForm">Annuler</n-button>
                  </div>
                </n-form>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NTabs,
  NTabPane,
  NEmpty,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NSpin,
  NAlert,
  NDivider,
  useMessage,
} from 'naive-ui'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth.store'
import Sidebar from '@/components/home/Sidebar.vue'
import RecipientSelectorModal, { type RawUser } from '@/components/messagerie/Selector.vue'

interface Message {
  id_message: string
  id_expediteur: string
  id_destinataire: string
  sujet: string
  contenu: string
  date_envoi: Date
  lu: boolean
  expediteur?: {
    id_user: string
    nom: string
    prenom: string
    email: string
  }
  destinataire?: {
    id_user: string
    nom: string
    prenom: string
    email: string
  }
  pieces_jointes: any[]
}

interface User {
  id_user: string
  nom: string
  prenom: string
  email: string
  role: string
}

const api = useApi()
const authStore = useAuthStore()
const message = useMessage()
const fileInputRef = ref<HTMLInputElement>()

const isLoading = ref(true)
const isSending = ref(false)
const isDeleting = ref(false)
const isRepairingStorage = ref(false)
const error = ref<string | null>(null)
const activeTab = ref('received')
const isMessageSent = ref(false)
const showRecipientSelector = ref(false)
const selectedRecipients = ref<RawUser[]>([])

const receivedMessages = ref<Message[]>([])
const sentMessages = ref<Message[]>([])
const allUsers = ref<RawUser[]>([])
const selectedMsg = ref<Message | null>(null)
const selectedFiles = ref<File[]>([])
const storageInfo = ref<any>(null)
const currentUserId = authStore.user?.id_user
const allEleveDetails = ref<any[]>([])

const newMessage = ref({
  destinataire_id: null as any,
  sujet: '',
  contenu: '',
})

onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null

    // Fetch received messages
    receivedMessages.value = (await api.getReceivedMessages()) as any

    // Fetch sent messages
    sentMessages.value = (await api.getSentMessages()) as any

    // Fetch all users
    allUsers.value = (await api.getUsers()) as RawUser[]
    allEleveDetails.value = (await api.getAllEleves()) as any[]

    // Fetch storage info
    storageInfo.value = (await api.getStorageInfo()) as any
  } catch (err) {
    error.value = 'Erreur lors du chargement des messages'
    console.error('Erreur:', err)
  } finally {
    isLoading.value = false
  }
})

function selectMessage(msg: Message, isSent = false) {
  selectedMsg.value = msg
  isMessageSent.value = isSent

  // Mark as read if received
  if (!isSent && !msg.lu) {
    api.markMessageAsRead(msg.id_message).catch((err) => {
      console.error('Erreur:', err)
    })
    msg.lu = true
  }
}

function handleFileSelect(event: any) {
  const files = event.target.files
  selectedFiles.value = Array.from(files)
}

function removeFile(idx: number) {
  selectedFiles.value.splice(idx, 1)
}

async function sendNewMessage() {
  if (!selectedRecipients.value.length) {
    message.error('Sélectionnez au moins un destinataire')
    return
  }
  if (!newMessage.value.sujet.trim()) {
    message.error('Entrez un sujet')
    return
  }
  if (!newMessage.value.contenu.trim()) {
    message.error('Écrivez un message')
    return
  }

  try {
    isSending.value = true
    const count = selectedRecipients.value.length

    // Envoie un message par destinataire
    for (const recipient of selectedRecipients.value) {
      selectedRecipients.value = []
      const formData = new FormData()
      formData.append('id_destinataire', String(recipient.id_user))
      formData.append('sujet', newMessage.value.sujet)
      formData.append('contenu', newMessage.value.contenu)
      for (const file of selectedFiles.value) {
        formData.append('pieces_jointes', file)
      }
      await api.sendMessage(formData)
    }

    sentMessages.value = (await api.getSentMessages()) as any
    storageInfo.value = (await api.getStorageInfo()) as any

    resetForm()
    selectedRecipients.value = []
    activeTab.value = 'sent'
    message.success(`Message envoyé à ${count} destinataire${count > 1 ? 's' : ''}`)
  } catch (err) {
    error.value = "Erreur lors de l'envoi du message"
    console.error('Erreur:', err)
  } finally {
    isSending.value = false
  }
}

function resetForm() {
  newMessage.value = {
    destinataire_id: null,
    sujet: '',
    contenu: '',
  }
  selectedFiles.value = []
}

async function deleteSelectedMessage() {
  if (!selectedMsg.value) return

  try {
    isDeleting.value = true
    await api.deleteMessage(selectedMsg.value.id_message)

    // Reload messages
    if (isMessageSent.value) {
      sentMessages.value = (await api.getSentMessages()) as any
    } else {
      receivedMessages.value = (await api.getReceivedMessages()) as any
    }

    // Reload storage info
    storageInfo.value = (await api.getStorageInfo()) as any

    selectedMsg.value = null
    message.success('Message supprimé')
  } catch (err) {
    error.value = 'Erreur lors de la suppression'
    console.error('Erreur:', err)
  } finally {
    isDeleting.value = false
  }
}

async function repairOrphanedFiles() {
  try {
    isRepairingStorage.value = true
    const result = (await api.cleanupUserOrphanedAttachments()) as {
      cleaned: number
      message: string
    }

    // Reload storage info
    storageInfo.value = (await api.getStorageInfo()) as any

    message.success(`${result.cleaned} pièces jointes orphelines supprimées`)
  } catch (err) {
    console.error('Erreur lors de la réparation:', err)
    message.error('Erreur lors de la réparation')
  } finally {
    isRepairingStorage.value = false
  }
}

function formatDate(date: any) {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: any) {
  const size = Number(bytes)
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

function formatFileName(nom: string): string {
  // Si le nom ne contient pas de chemin ou d'extension, retourner tel quel
  if (!nom.includes('/') && !nom.includes('\\') && !nom.includes('-')) {
    return nom
  }

  // Si le nom semble être un chemin, extraire juste le nom du fichier
  if (nom.includes('/')) {
    return nom.split('/').pop() || nom
  }

  // Si le nom ressemble à un hash généré par multer (1779189459645-282070655)
  // essayer d'utiliser le chemin de fichier si disponible, sinon retourner le nom
  return nom
}

function getStorageColor(): string {
  if (!storageInfo.value) return '#205781'
  const percentage = storageInfo.value.percentage
  if (percentage >= 90) return '#ff4d4f' // rouge
  if (percentage >= 70) return '#faad14' // orange
  return '#52c41a' // vert
}
</script>

<style scoped>
.messagerie-layout {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
}

.main-wrapper {
  flex: 1;
  margin-left: 180px;
  display: flex;
  flex-direction: column;
}

.messagerie-header {
  background: transparent;
  padding: 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  box-shadow: none;
}

.header-title h1 {
  font-size: 40px;
  font-weight: 700;
  color: #205781;
  margin: 0;
}

.header-title p {
  color: #817f7f;
  margin: 8px 0 0 0;
  font-size: 14px;
}

.messagerie-content {
  padding: 0 24px 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.storage-info {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.storage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.storage-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #205781;
}

.storage-percentage {
  font-size: 16px;
  font-weight: 700;
}

.storage-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.storage-used {
  height: 100%;
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
  border-radius: 4px;
}

.storage-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.messagerie-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Two-column layout for messages */
.messages-layout {
  display: flex;
  gap: 20px;
  height: 70vh;
}

.messages-sidebar {
  flex: 0 0 320px;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
  padding-right: 16px;
}

.messages-list-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-list-item {
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
  border-left: 4px solid transparent;
}

.message-list-item:hover {
  border-color: #205781;
  background: #f0f8ff;
  box-shadow: 0 2px 6px rgba(32, 87, 129, 0.1);
}

.message-list-item.selected {
  background: #f0f8ff;
  border-left-color: #205781;
  border-color: #205781;
}

.message-list-item.unread {
  font-weight: 600;
  background: #f0f8ff;
}

.list-item-sender {
  font-weight: 600;
  color: #205781;
  font-size: 13px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-subject {
  font-weight: 500;
  color: #333;
  font-size: 13px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-date {
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.list-item-attachment {
  font-size: 11px;
  color: #205781;
  background: #f0f8ff;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

.messages-detail {
  flex: 1;
  overflow-y: auto;
  padding-left: 16px;
}

.detail-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
  text-align: center;
}

.detail-header {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.detail-subject {
  font-size: 16px;
  font-weight: 600;
  color: #205781;
  margin: 8px 0;
  word-break: break-word;
}

.detail-date {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.detail-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  padding: 16px 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  flex: 1;
  overflow-y: auto;
}

.detail-attachments {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.detail-attachments h4 {
  margin: 0 0 12px 0;
  color: #205781;
  font-size: 14px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-link {
  padding: 8px 12px;
  background: #f0f8ff;
  border: 1px solid #d0e8f2;
  border-radius: 4px;
  text-decoration: none;
  color: #205781;
  font-size: 13px;
  transition: all 0.2s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-link:hover {
  background: #e0f0f8;
  border-color: #205781;
}

.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.compose-form {
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
  max-width: 600px;
}

.file-upload {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-input {
  display: none;
}

.selected-files {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f0f8ff;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 13px;
}

.file-item:last-child {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 1024px) {
  .messages-layout {
    flex-direction: column;
    height: auto;
  }

  .messages-sidebar {
    flex: 0 0 auto;
    border-right: none;
    border-bottom: 1px solid #e8e8e8;
    padding-right: 0;
    padding-bottom: 16px;
    max-height: 300px;
  }

  .messages-detail {
    flex: 1;
    padding-left: 0;
  }
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
  }

  .messagerie-header {
    padding: 20px 16px;
  }

  .messages-sidebar {
    flex: 0 0 280px;
  }

  .compose-form {
    max-width: 100%;
  }
}
</style>
