<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { projectService } from '@/services/projectService'
import { useUsersStore } from '@/stores/users'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/stores/project'

const route = useRoute()
const projectId = (route.params.id as string) || 'general'
const userStore = useUsersStore()
const { user } = storeToRefs(userStore)
const projectStore = useProjectStore()

const project = computed(() => projectId !== 'general' ? projectStore.getProjectById(projectId) : null)
const posts = ref<any[]>([])
const newMessage = ref('')
const pendingAttachments = ref<{ url: string, name: string, type: 'image' | 'document' }[]>([])
const replyingTo = ref<any | null>(null)
const isLoading = ref(true)
const isSending = ref(false)
const isMember = ref(false)
const errorMsg = ref<string | null>(null)

const fileInput = ref<HTMLInputElement | null>(null)

async function loadPosts() {
  try {
    posts.value = await projectService.getDiscussionPosts(projectId)
  } catch (e) {
    console.error('Error loading posts:', e)
  }
}

watch(user, async (newUser) => {
  if (!newUser) {
    isMember.value = false
    return
  }
  if (projectId === 'general') {
    isMember.value = true
    return
  }
  try {
    const members = await projectService.getProjectMembers(projectId)
    const myMembership = members.find(m => m.userId === newUser.id && (m.status === 'ACCEPTED' || m.role === 'OWNER'))
    isMember.value = !!myMembership
  } catch (e) {
    console.error('Error checking membership:', e)
  }
}, { immediate: true })

async function sendMessage() {
  if (!newMessage.value.trim() && pendingAttachments.value.length === 0) return
  if (!user.value) return
  
  isSending.value = true
  errorMsg.value = null
  try {
    const post = await projectService.createDiscussionPost(
      projectId,
      newMessage.value.trim(),
      user.value.name || '',
      user.value.image || '',
      pendingAttachments.value,
      replyingTo.value?.id
    )
    posts.value.push(post)
    newMessage.value = ''
    replyingTo.value = null
    pendingAttachments.value = []
    scrollToBottom()
  } catch (e: any) {
    errorMsg.value = e.response?.data?.error || 'Error al enviar el mensaje'
  } finally {
    isSending.value = false
  }
}

function scrollToBottom() {
  nextTick(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    })
  })
}

function initiateReply(post: any) {
  replyingTo.value = post
  document.getElementById('forum-reply-box')?.scrollIntoView({ behavior: 'smooth' })
}

function getAnsweredPost(replyId: string) {
  return posts.value.find(p => p.id === replyId)
}

function isPostLikedByUser(post: any) {
  if (!user.value || !post.likedBy) return false
  return post.likedBy.includes(user.value.id)
}

async function toggleLike(post: any) {
  if (!user.value) return
  
  // Optimistic UI update
  const originalLikes = [...(post.likedBy || [])]
  const uid = user.value.id
  if (!post.likedBy) post.likedBy = []
  
  const idx = post.likedBy.indexOf(uid)
  if (idx > -1) {
    post.likedBy.splice(idx, 1)
  } else {
    post.likedBy.push(uid)
  }
  
  try {
    const updatedPost = await projectService.toggleDiscussionPostLike(projectId, post.id)
    post.likedBy = updatedPost.likedBy
  } catch (e) {
    console.error('Error al dar me gusta:', e)
    post.likedBy = originalLikes
  }
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  
  for (let i = 0; i < target.files.length; i++) {
    const file = target.files[i]
    if (file.size > 2 * 1024 * 1024) {
      alert(`El archivo ${file.name} es demasiado grande. Máximo 2MB.`)
      continue
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      pendingAttachments.value.push({
        url: result,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document'
      })
    }
    reader.readAsDataURL(file)
  }
  // Reset input
  if (fileInput.value) fileInput.value.value = ''
}

function removeAttachment(index: number) {
  pendingAttachments.value.splice(index, 1)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('es-ES', { 
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function renderPostContent(content: string) {
  if (!content) return ''
  // Handle basic escaping to avoid XSS
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
    
  // Format blockquotes correctly
  let formatted = escaped.replace(/^&gt;.*$/gm, match => {
    return `<blockquote class="border-start border-3 border-secondary ps-3 py-1 my-1 text-muted fw-light fst-italic bg-light">${match.replace(/^&gt; ?/, '')}</blockquote>`;
  });
  
  // Clean up adjacent blockquotes into one
  formatted = formatted.replace(/<\/blockquote>\n<blockquote[^>]*>/g, '<br/>');
  
  return formatted.replace(/\n/g, '<br/>');
}

onMounted(async () => {
  if (projectId !== 'general' && !project.value) {
    await projectStore.fetch()
  }
  await loadPosts()
  isLoading.value = false
})
</script>

<template>
  <main class="container pt-4 pb-5 mb-5">
    <!-- Cabecera -->
    <div class="d-flex align-items-center mb-4 border-bottom pb-4">
      <RouterLink v-if="projectId !== 'general'" :to="{ name: 'project-detail', params: { id: projectId } }" class="btn btn-outline-secondary me-3 shadow-sm rounded-circle" title="Volver al proyecto">
        <i class="bi bi-arrow-left"></i>
      </RouterLink>
      <RouterLink v-else :to="{ name: 'forum-index' }" class="btn btn-outline-secondary me-3 shadow-sm rounded-circle" title="Volver a los foros">
        <i class="bi bi-arrow-left"></i>
      </RouterLink>
      <div>
        <h2 class="mb-1 fw-bold text-dark">
          <i class="bi bi-chat-square-text text-primary me-2"></i>
          {{ projectId === 'general' ? 'Foro General' : 'Foro del proyecto' }}
        </h2>
        <h5 class="text-muted mb-0 fw-normal" v-if="project">{{ project.title }}</h5>
        <h5 class="text-muted mb-0 fw-normal" v-else-if="projectId === 'general'">Espacio abierto para toda la comunidad y discusión general</h5>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-muted">Cargando discusiones...</p>
    </div>

    <template v-else>
      <!-- Mensajes -->
      <div id="forum-messages" class="mb-5 shadow-sm rounded-4 border overflow-hidden bg-white">
        <div v-if="posts.length === 0" class="text-center py-5 text-muted bg-light">
          <i class="bi bi-chat-left-dots display-1 d-block mb-4 text-secondary opacity-50"></i>
          <p class="lead fw-normal">No hay mensajes todavía en este hilo.</p>
          <p v-if="isMember" class="mb-0">¡Rompe el hielo y sé el primero en escribir!</p>
          <p v-else-if="projectId !== 'general'" class="mb-0">Solo los miembros del proyecto pueden escribir en el foro.</p>
        </div>

        <div v-for="(post, index) in posts" :key="post.id" class="d-flex border-bottom forum-post-row" :class="{'bg-light': index % 2 !== 0}">
          <!-- Columna de Usuario (Desktop) -->
          <div class="user-column px-3 py-4 text-center border-end d-none d-md-block" style="width: 220px; flex-shrink: 0; background-color: rgba(0,0,0,0.015);">
            <RouterLink :to="{ name: 'user-detail', params: { id: post.userId } }" class="text-decoration-none text-dark d-block forum-user-link">
              <img :src="post.userImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'"
                   :alt="post.userName"
                   class="rounded-circle shadow-sm object-fit-cover mb-3 bg-white"
                   width="85" height="85" />
              <strong class="d-block text-truncate fs-6 mb-1">{{ post.userName || 'Usuario' }}</strong>
            </RouterLink>
            <div class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle rounded-pill small px-3 mt-1 fw-normal">Miembro</div>
          </div>
          
          <!-- Columna de Contenido -->
          <div class="content-column p-4 flex-grow-1" style="min-width: 0;">
            <!-- Header Móvil (solo visible en pantallas pequeñas) -->
            <div class="d-flex align-items-center mb-3 d-md-none border-bottom pb-3">
              <RouterLink :to="{ name: 'user-detail', params: { id: post.userId } }">
                <img :src="post.userImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'"
                     :alt="post.userName"
                     class="rounded-circle me-3 shadow-sm object-fit-cover"
                     width="48" height="48" />
              </RouterLink>
              <div>
                <strong class="d-block text-dark">{{ post.userName || 'Usuario' }}</strong>
                <small class="text-muted"><i class="bi bi-clock me-1"></i> {{ formatDate(post.createdAt) }}</small>
              </div>
            </div>

            <!-- Header Contenido (Desktop) -->
            <div class="d-none d-md-flex justify-content-between align-items-center mb-3 text-muted border-bottom pb-2" style="font-size: 0.85rem;">
              <span><i class="bi bi-calendar3 me-1"></i> Publicado el {{ formatDate(post.createdAt) }}</span>
              <span class="text-secondary fw-bold">#{{ index + 1 }}</span>
            </div>
            
            <div v-if="post.replyToPostId" class="bg-light border-start border-3 border-info p-3 mb-3 rounded-end">
              <div class="small fw-bold text-muted mb-1">
                <i class="bi bi-reply-fill me-1"></i> Respondiendo a {{ getAnsweredPost(post.replyToPostId)?.userName || 'un mensaje anterior' }}:
              </div>
              <div class="small text-muted fst-italic" 
                   style="display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-wrap;">
                {{ getAnsweredPost(post.replyToPostId)?.content || 'Mensaje no disponible.' }}
              </div>
            </div>
            
            <div class="post-content" v-html="renderPostContent(post.content)"></div>
            
            <div v-if="post.attachments?.length" class="mt-4 pt-3 border-top border-light">
              <h6 class="text-muted mb-3 small fw-bold text-uppercase"><i class="bi bi-paperclip me-1"></i> Archivos adjuntos</h6>
              <div class="d-flex flex-wrap gap-2">
                <div v-for="(att, i) in post.attachments" :key="i" class="attachment-preview shadow-sm rounded overflow-hidden border">
                  <template v-if="att.type === 'image'">
                    <a :href="att.url" target="_blank" title="Ver imagen completa">
                      <img :src="att.url" :alt="att.name" class="img-fluid object-fit-cover" style="width: 120px; height: 120px;" />
                    </a>
                  </template>
                  <template v-else>
                    <a :href="att.url" target="_blank"
                       class="p-3 d-flex flex-column justify-content-center align-items-center bg-light text-decoration-none text-dark"
                       style="width: 120px; height: 120px;">
                      <i class="bi bi-file-earmark-text text-primary" style="font-size: 2rem;"></i>
                      <div class="small text-truncate mt-2 w-100 text-center" :title="att.name" style="font-size: 0.75rem;">{{ att.name }}</div>
                    </a>
                  </template>
                </div>
              </div>
            </div>
            
            <div class="d-flex justify-content-between align-items-center mt-4 pt-3 mt-md-5 pt-md-0 d-md-flex text-md-end" v-if="user">
              <div>
                <button class="btn btn-sm px-3 rounded-pill" :class="isPostLikedByUser(post) ? 'btn-danger text-white' : 'btn-outline-danger'" @click="toggleLike(post)" title="Me gusta">
                  <i class="bi" :class="isPostLikedByUser(post) ? 'bi-heart-fill' : 'bi-heart'"></i>
                  <span class="ms-2 fw-bold">{{ post.likedBy?.length || 0 }}</span>
                </button>
              </div>
              <div v-if="isMember">
                <button class="btn btn-sm btn-outline-primary px-3 rounded-pill" @click="initiateReply(post)">
                  <i class="bi bi-reply-fill"></i> Responder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de escritura -->
      <div id="forum-reply-box" class="card shadow-lg border-primary border-opacity-25" style="border-radius: 12px" v-if="isMember">
        <div class="card-body p-4">
          <h5 class="card-title fw-bold text-dark mb-3"><i class="bi bi-pencil-square me-2 text-primary"></i>Escribir un mensaje</h5>
          
          <div v-if="errorMsg" class="alert alert-danger py-2 mb-3">
            {{ errorMsg }}
          </div>
          
          <div v-if="replyingTo" class="alert alert-info py-2 px-3 mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span>
                <i class="bi bi-reply-fill"></i> Respondiendo a <strong>{{ replyingTo.userName }}</strong>
              </span>
              <button type="button" class="btn-close btn-sm" @click="replyingTo = null" title="Cancelar respuesta"></button>
            </div>
            <div class="bg-white bg-opacity-75 p-2 rounded text-muted small fst-italic border border-info border-opacity-25" style="max-height: 100px; overflow-y: auto; white-space: pre-wrap;">
              {{ replyingTo.content }}
            </div>
          </div>

          <form @submit.prevent="sendMessage">
            <div class="form-group mb-3">
              <textarea
                v-model="newMessage"
                class="form-control form-control-lg bg-light"
                rows="5"
                placeholder="Escribe tu mensaje aquí... Puedes adjuntar archivos e interactuar con la comunidad."
                :disabled="isSending"
                style="resize: vertical; font-size: 1rem"
              ></textarea>
            </div>

            <!-- Previsualización de adjuntos pendientes -->
            <div v-if="pendingAttachments.length > 0" class="mb-4 p-3 bg-light rounded border d-flex flex-wrap gap-3">
              <div v-for="(att, idx) in pendingAttachments" :key="idx" class="position-relative shadow-sm rounded bg-white" style="width: 90px; height: 90px;">
                <img v-if="att.type === 'image'" :src="att.url" class="w-100 h-100 object-fit-cover rounded border" />
                <div v-else class="w-100 h-100 d-flex flex-column align-items-center justify-content-center border rounded text-muted">
                  <i class="bi bi-file-earmark fs-4"></i>
                  <span class="small text-truncate w-100 px-2 text-center" style="font-size: 0.65rem;">{{ att.name }}</span>
                </div>
                <button type="button" 
                        class="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle shadow" 
                        style="width: 24px; height: 24px; padding: 0" 
                        @click="removeAttachment(idx)">
                  <i class="bi bi-x fs-6" style="line-height:0"></i>
                </button>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center">
              <div>
                <input type="file" ref="fileInput" class="d-none" multiple accept="image/*,.pdf,.doc,.docx" @change="handleFileChange">
                <button type="button" class="btn btn-outline-secondary" @click="fileInput?.click()" :disabled="isSending">
                  <i class="bi bi-paperclip fs-5 align-middle me-1"></i> Adjuntar imagen/doc
                </button>
              </div>
              <button
                type="submit"
                class="btn btn-primary px-5 py-2 fw-bold text-uppercase rounded-pill shadow-sm"
                :disabled="(newMessage.trim().length === 0 && pendingAttachments.length === 0) || isSending">
                <i class="bi bi-send-fill me-2" v-if="!isSending"></i> Enviar Mensaje
                <span class="spinner-border spinner-border-sm ms-2" v-if="isSending"></span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-else class="card border-0 bg-light text-center py-5 shadow-sm rounded-4 mt-4">
        <div class="card-body">
          <i class="bi bi-lock-fill display-4 d-block mb-3 text-secondary"></i>
          <h4 class="text-dark fw-bold" v-if="!user">Inicia sesión para participar</h4>
          <h4 class="text-dark fw-bold" v-else>Solo los miembros del proyecto pueden colaborar</h4>
          <p class="text-muted mx-auto" style="max-width: 500px">
            {{ !user ? 'Únete a nuestra comunidad para comentar en los foros y subir adjuntos.' : 'Para mantener el hilo organizado, debes ser parte del proyecto para enviar responder.' }}
          </p>
          
          <button v-if="!user" class="btn btn-primary px-4 py-2 rounded-pill mt-3" data-bs-toggle="modal" data-bs-target="#loginModal">
            Iniciar Sesión
          </button>
          <RouterLink v-else-if="projectId !== 'general'" :to="{ name: 'project-detail', params: { id: projectId } }" class="btn btn-primary px-4 py-2 rounded-pill mt-3">
            Ver detalles y unirme
          </RouterLink>
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
.forum-post-row {
  transition: background-color 0.2s ease;
}
.forum-post-row:hover {
  background-color: #f8f9fa !important;
}

.hover-primary:hover {
  color: #0d6efd !important;
  border-color: #0d6efd !important;
}

.post-content {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #2b2b2b;
}

.attachment-preview {
  transition: all 0.2s;
}
.attachment-preview:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.forum-user-link:hover strong {
  color: #0d6efd;
  text-decoration: underline;
}
</style>
