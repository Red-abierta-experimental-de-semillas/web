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
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
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

  const originalLikes = [...(post.likedBy || [])]
  const uid = user.value.id
  if (!post.likedBy) post.likedBy = []

  const idx = post.likedBy.indexOf(uid)
  if (idx > -1) post.likedBy.splice(idx, 1)
  else post.likedBy.push(uid)

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
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  let formatted = escaped.replace(/^&gt;.*$/gm, match => {
    return `<blockquote>${match.replace(/^&gt; ?/, '')}</blockquote>`
  })

  formatted = formatted.replace(/<\/blockquote>\n<blockquote>/g, '<br/>')
  return formatted.replace(/\n/g, '<br/>')
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
  <main>
    <section class="thread-hero">
      <div class="raes-shell thread-hero-grid">
        <div>
          <RouterLink v-if="projectId !== 'general'" :to="{ name: 'project-detail', params: { id: projectId } }" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al proyecto
          </RouterLink>
          <RouterLink v-else :to="{ name: 'forum-index' }" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver a foros
          </RouterLink>
          <span class="eyebrow"><i class="bi bi-chat-dots me-2"></i>{{ projectId === 'general' ? 'Foro público' : 'Foro de proyecto' }}</span>
          <h1>{{ projectId === 'general' ? 'Foro General' : (project?.title || 'Foro del proyecto') }}</h1>
          <p>{{ projectId === 'general' ? 'Espacio abierto para toda la comunidad y discusión general.' : 'Conversación, coordinación y memoria viva de este experimento.' }}</p>
        </div>
        <aside class="thread-meta glass-panel">
          <strong>{{ posts.length }}</strong>
          <span>{{ posts.length === 1 ? 'mensaje' : 'mensajes' }}</span>
          <small v-if="project">{{ project.category || 'Proyecto' }}</small>
          <small v-else>Comunidad</small>
        </aside>
      </div>
    </section>

    <section class="raes-shell thread-layout">
      <div v-if="isLoading" class="loading-state glass-panel">
        <div class="spinner-border text-primary" role="status"></div>
        <p>Cargando discusiones...</p>
      </div>

      <template v-else>
        <div id="forum-messages" class="messages-panel glass-panel">
          <div v-if="posts.length === 0" class="empty-thread">
            <i class="bi bi-chat-left-dots"></i>
            <h2>No hay mensajes todavía</h2>
            <p v-if="isMember">Rompe el hielo y deja el primer mensaje.</p>
            <p v-else-if="projectId !== 'general'">Solo los miembros del proyecto pueden escribir en el foro.</p>
          </div>

          <article v-for="(post, index) in posts" :key="post.id" class="post-card">
            <aside class="author-block">
              <RouterLink :to="{ name: 'user-detail', params: { id: post.userId } }" class="author-link">
                <img :src="post.userImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'"
                     :alt="post.userName"
                     class="author-avatar" />
                <strong>{{ post.userName || 'Usuario' }}</strong>
              </RouterLink>
              <span v-if="project && post.userId === project.owner" class="role-chip creator">Creador</span>
              <span v-else class="role-chip">Miembro</span>
            </aside>

            <div class="post-body">
              <header class="post-header">
                <div class="mobile-author">
                  <img :src="post.userImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'" :alt="post.userName" />
                  <div>
                    <strong>{{ post.userName || 'Usuario' }}</strong>
                    <small>{{ formatDate(post.createdAt) }}</small>
                  </div>
                </div>
                <span class="desktop-date"><i class="bi bi-calendar3 me-1"></i>{{ formatDate(post.createdAt) }}</span>
                <span class="post-number">#{{ index + 1 }}</span>
              </header>

              <div v-if="post.replyToPostId" class="reply-preview">
                <strong><i class="bi bi-reply-fill me-1"></i> Respondiendo a {{ getAnsweredPost(post.replyToPostId)?.userName || 'un mensaje anterior' }}</strong>
                <p>{{ getAnsweredPost(post.replyToPostId)?.content || 'Mensaje no disponible.' }}</p>
              </div>

              <div class="post-content" v-html="renderPostContent(post.content)"></div>

              <div v-if="post.attachments?.length" class="attachments-block">
                <h3><i class="bi bi-paperclip me-1"></i>Archivos adjuntos</h3>
                <div class="attachment-grid">
                  <div v-for="(att, i) in post.attachments" :key="i" class="attachment-preview">
                    <template v-if="att.type === 'image'">
                      <a :href="att.url" target="_blank" title="Ver imagen completa">
                        <img :src="att.url" :alt="att.name" />
                      </a>
                    </template>
                    <template v-else>
                      <a :href="att.url" target="_blank" class="document-attachment">
                        <i class="bi bi-file-earmark-text"></i>
                        <span :title="att.name">{{ att.name }}</span>
                      </a>
                    </template>
                  </div>
                </div>
              </div>

              <footer class="post-actions" v-if="user">
                <button class="btn btn-sm reaction-button" :class="{'liked': isPostLikedByUser(post)}" @click="toggleLike(post)" title="Me gusta">
                  <i class="bi" :class="isPostLikedByUser(post) ? 'bi-heart-fill' : 'bi-heart'"></i>
                  <span v-if="post.likedBy?.length">{{ post.likedBy.length }}</span>
                </button>
                <button v-if="isMember" class="btn btn-sm btn-outline-secondary" @click="initiateReply(post)" title="Responder">
                  <i class="bi bi-reply-fill me-1"></i>Responder
                </button>
              </footer>
            </div>
          </article>
        </div>

        <div id="forum-reply-box" class="reply-card card" v-if="isMember">
          <div class="card-body">
            <div class="reply-heading">
              <div>
                <span class="eyebrow">Participa</span>
                <h2>Escribir un mensaje</h2>
              </div>
              <i class="bi bi-pencil-square"></i>
            </div>

            <div v-if="errorMsg" class="alert alert-danger py-2 mb-3">{{ errorMsg }}</div>

            <div v-if="replyingTo" class="replying-box">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span><i class="bi bi-reply-fill"></i> Respondiendo a <strong>{{ replyingTo.userName }}</strong></span>
                <button type="button" class="btn-close btn-sm" @click="replyingTo = null" title="Cancelar respuesta"></button>
              </div>
              <p>{{ replyingTo.content }}</p>
            </div>

            <form @submit.prevent="sendMessage">
              <textarea
                v-model="newMessage"
                class="form-control message-box"
                rows="5"
                placeholder="Escribe tu mensaje aquí. Puedes adjuntar imágenes o documentos."
                :disabled="isSending"
              ></textarea>

              <div v-if="pendingAttachments.length > 0" class="pending-attachments">
                <div v-for="(att, idx) in pendingAttachments" :key="idx" class="pending-item">
                  <img v-if="att.type === 'image'" :src="att.url" />
                  <div v-else class="pending-doc"><i class="bi bi-file-earmark"></i><span>{{ att.name }}</span></div>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeAttachment(idx)">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>

              <div class="composer-actions">
                <input type="file" ref="fileInput" class="d-none" multiple accept="image/*,.pdf,.doc,.docx" @change="handleFileChange">
                <button type="button" class="btn btn-outline-secondary" @click="fileInput?.click()" :disabled="isSending">
                  <i class="bi bi-paperclip me-1"></i> Adjuntar
                </button>
                <button
                  type="submit"
                  class="btn btn-primary send-button"
                  :disabled="(newMessage.trim().length === 0 && pendingAttachments.length === 0) || isSending">
                  <i class="bi bi-send-fill me-2" v-if="!isSending"></i>Enviar
                  <span class="spinner-border spinner-border-sm ms-2" v-if="isSending"></span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div v-else class="locked-card glass-panel">
          <i class="bi bi-lock-fill"></i>
          <h2 v-if="!user">Inicia sesión para participar</h2>
          <h2 v-else>Solo los miembros del proyecto pueden colaborar</h2>
          <p>{{ !user ? 'Únete a la comunidad para comentar en los foros y subir adjuntos.' : 'Debes ser parte del proyecto para responder.' }}</p>
          <button v-if="!user" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal">Iniciar sesión</button>
          <RouterLink v-else-if="projectId !== 'general'" :to="{ name: 'project-detail', params: { id: projectId } }" class="btn btn-primary">Ver detalles y unirme</RouterLink>
        </div>
      </template>
    </section>
  </main>
</template>

<style scoped>
.thread-hero { padding: 1.25rem 0 2rem; }

.thread-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 2rem;
  align-items: end;
}

.back-link {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  margin-bottom: 1.25rem;
  color: var(--raes-muted);
  font-weight: 900;
  text-decoration: none;
}
.back-link:hover { color: var(--raes-green-dark); }

.eyebrow {
  display: inline-flex;
  align-items: center;
  color: var(--raes-green-dark);
  font-size: 0.78rem;
  font-weight: 950;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.thread-hero h1 {
  margin: 0.75rem 0 0.8rem;
  font-size: clamp(2.25rem, 6vw, 4.8rem);
  font-weight: 950;
  line-height: 0.95;
}

.thread-hero p {
  max-width: 720px;
  color: var(--raes-muted);
  font-size: clamp(1.02rem, 2vw, 1.22rem);
  line-height: 1.65;
}

.thread-meta {
  padding: 1.2rem;
  border-radius: 1.65rem;
}
.thread-meta strong { display: block; color: var(--raes-green-dark); font-size: 3rem; line-height: 1; }
.thread-meta span, .thread-meta small { display: block; color: var(--raes-muted); font-weight: 900; }

.loading-state,
.empty-thread,
.locked-card {
  padding: 4rem 1.5rem;
  text-align: center;
  border-radius: 2rem;
}
.loading-state p, .empty-thread p, .locked-card p { color: var(--raes-muted); margin: 1rem auto 0; max-width: 560px; }
.empty-thread i, .locked-card i { color: var(--raes-green); font-size: 3rem; }
.empty-thread h2, .locked-card h2 { margin-top: 1rem; font-weight: 950; }

.messages-panel {
  overflow: hidden;
  border-radius: 1.8rem;
}

.post-card {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  border-bottom: 1px solid rgba(47, 107, 63, 0.1);
}
.post-card:last-child { border-bottom: 0; }

.author-block {
  padding: 1.35rem 1rem;
  text-align: center;
  background: rgba(232, 243, 220, 0.34);
  border-right: 1px solid rgba(47, 107, 63, 0.1);
}

.author-link { color: inherit; text-decoration: none; }
.author-link:hover strong { color: var(--raes-green-dark); }
.author-avatar { width: 58px; height: 58px; object-fit: cover; border-radius: 50%; box-shadow: 0 10px 24px rgba(31, 74, 45, 0.13); }
.author-link strong { display: block; margin-top: 0.55rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.role-chip {
  display: inline-flex;
  margin-top: 0.55rem;
  padding: 0.32rem 0.55rem;
  color: var(--raes-muted);
  font-size: 0.7rem;
  font-weight: 950;
  text-transform: uppercase;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
}
.role-chip.creator { color: #73510c; background: rgba(255, 214, 102, 0.55); }

.post-body { min-width: 0; padding: 1.35rem; }

.post-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  color: var(--raes-muted);
  font-size: 0.86rem;
  font-weight: 850;
}
.post-number { color: var(--raes-green-dark); font-weight: 950; }
.mobile-author { display: none; }

.reply-preview,
.replying-box {
  margin-bottom: 1rem;
  padding: 1rem;
  border-left: 4px solid rgba(47, 107, 63, 0.45);
  border-radius: 0 1rem 1rem 0;
  background: rgba(232, 243, 220, 0.5);
}
.reply-preview strong { color: var(--raes-green-dark); font-size: 0.88rem; }
.reply-preview p,
.replying-box p {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0.35rem 0 0;
  color: var(--raes-muted);
  white-space: pre-wrap;
}

.post-content {
  color: #2d3a30;
  font-size: 1.05rem;
  line-height: 1.75;
}
.post-content :deep(blockquote) {
  margin: 0.8rem 0;
  padding: 0.8rem 1rem;
  color: var(--raes-muted);
  font-style: italic;
  border-left: 4px solid rgba(47, 107, 63, 0.35);
  border-radius: 0 0.85rem 0.85rem 0;
  background: rgba(255, 255, 255, 0.6);
}

.attachments-block {
  margin-top: 1.3rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(47, 107, 63, 0.1);
}
.attachments-block h3 { color: var(--raes-muted); font-size: 0.78rem; font-weight: 950; letter-spacing: 0.1em; text-transform: uppercase; }
.attachment-grid { display: flex; flex-wrap: wrap; gap: 0.65rem; }
.attachment-preview { overflow: hidden; border-radius: 1rem; border: 1px solid rgba(47, 107, 63, 0.12); background: rgba(255,255,255,0.65); transition: transform 160ms ease; }
.attachment-preview:hover { transform: translateY(-2px); }
.attachment-preview img, .document-attachment { width: 120px; height: 120px; object-fit: cover; }
.document-attachment { display: grid; place-items: center; padding: 0.75rem; color: var(--raes-green-dark); text-align: center; text-decoration: none; }
.document-attachment i { font-size: 2rem; }
.document-attachment span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }

.post-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(47, 107, 63, 0.1);
}
.reaction-button { color: var(--raes-muted); border: 1px solid rgba(47, 107, 63, 0.12); background: rgba(255,255,255,0.55); }
.reaction-button.liked { color: #b4234b; background: rgba(255, 228, 235, 0.65); }

.reply-card {
  margin-top: 1.25rem;
  border-radius: 1.8rem;
}
.reply-card .card-body { padding: clamp(1rem, 3vw, 1.5rem); }
.reply-heading { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-bottom: 1rem; }
.reply-heading h2 { margin: 0.1rem 0 0; font-weight: 950; }
.reply-heading > i { color: var(--raes-green); font-size: 2rem; }
.message-box { min-height: 150px; resize: vertical; background: rgba(255,255,255,0.72); }

.pending-attachments { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1rem 0; padding: 1rem; border-radius: 1rem; background: rgba(232, 243, 220, 0.45); }
.pending-item { position: relative; width: 92px; height: 92px; border-radius: 0.9rem; background: white; box-shadow: 0 10px 24px rgba(31, 74, 45, 0.1); }
.pending-item img, .pending-doc { width: 100%; height: 100%; object-fit: cover; border-radius: 0.9rem; }
.pending-doc { display: grid; place-items: center; padding: 0.5rem; color: var(--raes-muted); font-size: 0.7rem; text-align: center; }
.pending-item .btn { position: absolute; top: -0.45rem; right: -0.45rem; display: grid; place-items: center; width: 1.6rem; height: 1.6rem; padding: 0; border-radius: 999px; }

.composer-actions { display: flex; justify-content: space-between; gap: 0.75rem; align-items: center; margin-top: 1rem; }
.send-button { min-width: 150px; }
.locked-card { margin-top: 1.25rem; }

@media (max-width: 767.98px) {
  .thread-hero-grid { grid-template-columns: 1fr; }
  .thread-meta { display: flex; gap: 0.7rem; align-items: baseline; }
  .thread-meta strong { font-size: 2.4rem; }
  .post-card { grid-template-columns: 1fr; }
  .author-block { display: none; }
  .post-body { padding: 1rem; }
  .desktop-date { display: none; }
  .mobile-author { display: flex; gap: 0.7rem; align-items: center; min-width: 0; }
  .mobile-author img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; }
  .mobile-author strong, .mobile-author small { display: block; }
  .mobile-author small { color: var(--raes-muted); font-size: 0.78rem; }
  .post-actions, .composer-actions { align-items: stretch; flex-direction: column; }
  .post-actions .btn, .composer-actions .btn { width: 100%; }
  .attachment-preview img, .document-attachment { width: 96px; height: 96px; }
}
</style>
