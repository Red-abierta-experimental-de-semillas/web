<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, type Project } from '@/model/Project'
import { MEMBERSHIP_STATUS_LABELS, type ProjectMembership } from '@/model/ProjectMembership'
import { computed, ref, watch } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useToasterStore } from '@/stores/toaster'
import { storeToRefs } from 'pinia'
import type { User } from '@/model/User'

const route = useRoute()
const toaster = useToasterStore()
const userStore = useUsersStore()
const projectStore = useProjectStore()
const { user } = storeToRefs(userStore)
const { projects, currentProjectMembers } = storeToRefs(projectStore)

const joinMessage = ref('')
const showJoinForm = ref(false)

const project = computed(() =>
  projects.value.find((p: Project) => p.id === route.params.id) || null
)

const isOwner = computed(() =>
  user.value && project.value && project.value.owner === user.value.id
)

const userMembership = computed(() =>
  user.value
    ? currentProjectMembers.value.find((m: ProjectMembership) => m.userId === user.value!.id)
    : null
)

const acceptedMembers = computed(() =>
  currentProjectMembers.value.filter(m => m.status === 'ACCEPTED')
)

const acceptedVolunteers = computed(() =>
  currentProjectMembers.value.filter(m => m.status === 'ACCEPTED' && m.role === 'VOLUNTEER')
)

const pendingMembers = computed(() =>
  currentProjectMembers.value.filter(m => m.status === 'PENDING')
)

const isFull = computed(() => {
  if (!project.value || project.value.volunteersNeeded <= 0) return false
  return acceptedVolunteers.value.length >= project.value.volunteersNeeded
})

watch(
  project,
  (result) => {
    if (result) {
      projectStore.fetchMembers(result.id)
    }
  },
  { immediate: true }
)

const memberUsers = ref<Record<string, User>>({})

watch(currentProjectMembers, async (members) => {
  for (const m of members) {
    if (!memberUsers.value[m.userId]) {
      try {
        const u = await userStore.getUserById(m.userId)
        memberUsers.value[m.userId] = u
      } catch (e) {
        console.error('Failed to fetch user', m.userId)
      }
    }
  }
}, { immediate: true })

async function onJoin() {
  if (!project.value) return
  try {
    await projectStore.join(project.value.id, joinMessage.value || null)
    toaster.success({ text: '¡Solicitud enviada! El creador del proyecto la revisará pronto.' })
    showJoinForm.value = false
    joinMessage.value = ''
    await projectStore.fetchMembers(project.value.id)
  } catch (error) {
    toaster.error({ text: 'Error al solicitar unirse al proyecto.' })
    console.error(error)
  }
}

async function onManageMember(membershipId: string, action: 'ACCEPTED' | 'REJECTED') {
  if (!project.value) return
  try {
    await projectStore.manageMember(project.value.id, membershipId, action)
    toaster.success({ text: action === 'ACCEPTED' ? 'Voluntario aceptado' : 'Solicitud rechazada' })
  } catch (error) {
    toaster.error({ text: 'Error al gestionar la solicitud.' })
    console.error(error)
  }
}

function onShare() {
  navigator.clipboard.writeText(window.location.href)
  toaster.info({ text: 'Enlace del proyecto copiado al portapapeles.' })
}

const volunteerSlotsLabel = computed(() => {
  if (!project.value || project.value.volunteersNeeded <= 0) return 'Sin límite de voluntarios'
  return `${acceptedVolunteers.value.length}/${project.value.volunteersNeeded} plazas cubiertas`
})

</script>

<template>
  <main class="project-page raes-shell" v-if="project">
    <nav class="project-breadcrumb" style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <RouterLink :to="{ name: 'projects' }">Proyectos</RouterLink>
        </li>
        <li class="breadcrumb-item active" aria-current="page">{{ project.title }}</li>
      </ol>
    </nav>

    <section class="project-hero glass-panel">
      <div class="project-media">
        <img :src="project.image" alt="Imagen del proyecto" />
      </div>
      <div class="project-main">
        <div class="project-actions">
          <RouterLink :to="{ name: 'project-forum', params: { id: project.id } }" class="btn btn-light">
            <i class="bi-chat-dots me-1" /> Foro
          </RouterLink>
          <button class="btn btn-light" @click.prevent="onShare">
            <i class="bi-share me-1" /> Compartir
          </button>
          <RouterLink v-if="isOwner" :to="{ name: 'project-edit', params: { id: project.id } }" class="btn btn-light">
            <i class="bi-pencil me-1" /> Editar
          </RouterLink>
        </div>

        <div class="badge-row">
          <span :class="'badge text-bg-' + PROJECT_STATUS_COLORS[project.status]">
            {{ PROJECT_STATUS_LABELS[project.status] }}
          </span>
          <span class="badge text-bg-light" v-if="project.category">
            <i class="bi bi-tag me-1"></i>{{ project.category }}
          </span>
        </div>

        <h1>{{ project.title }}</h1>
        <p class="location" v-if="project.location"><i class="bi bi-geo-alt me-1"></i>{{ project.location }}</p>

        <div class="quick-facts">
          <div>
            <strong>{{ acceptedMembers.length }}</strong>
            <span>miembros</span>
          </div>
          <div>
            <strong>{{ volunteerSlotsLabel }}</strong>
            <span>voluntariado</span>
          </div>
          <div>
            <strong>{{ project.status === 'OPEN' && !isFull ? 'Sí' : 'No' }}</strong>
            <span>admite solicitudes</span>
          </div>
        </div>

        <div class="tag-row" v-if="project.tags && project.tags.length > 0">
          <span class="badge text-bg-light" v-for="tag in project.tags" :key="tag">{{ tag }}</span>
        </div>

        <div class="join-box" v-if="user && !isOwner && !userMembership && project.status === 'OPEN' && !isFull">
          <button v-if="!showJoinForm" class="btn btn-primary btn-lg" @click="showJoinForm = true">
            <i class="bi bi-person-plus me-1"></i> Unirme al proyecto
          </button>
          <div v-else class="join-form">
            <h2>Solicitar unirse</h2>
            <textarea class="form-control" v-model="joinMessage" rows="3" placeholder="Mensaje para el creador (opcional)"></textarea>
            <div class="d-flex gap-2 flex-wrap mt-2">
              <button class="btn btn-primary" @click="onJoin">Enviar solicitud</button>
              <button class="btn btn-light" @click="showJoinForm = false">Cancelar</button>
            </div>
          </div>
        </div>

        <div v-if="userMembership && !isOwner" class="member-state">
          <span class="badge text-bg-info" v-if="userMembership.status === 'PENDING'">
            <i class="bi bi-hourglass-split me-1"></i> Tu solicitud está pendiente
          </span>
          <span class="badge text-bg-success" v-else-if="userMembership.status === 'ACCEPTED'">
            <i class="bi bi-check-circle me-1"></i> Eres miembro de este proyecto
          </span>
          <span class="badge text-bg-danger" v-else-if="userMembership.status === 'REJECTED'">
            <i class="bi bi-x-circle me-1"></i> Tu solicitud fue rechazada
          </span>
        </div>
      </div>
    </section>

    <section class="project-content-grid">
      <article class="content-card glass-panel">
        <span class="eyebrow">Objetivo</span>
        <h2>Qué se quiere hacer</h2>
        <p>{{ project.description }}</p>
      </article>

      <article class="content-card glass-panel">
        <span class="eyebrow">Participación</span>
        <h2>Qué se pide y qué semillas se comparten</h2>
        <p v-if="project.volunteerRequirements">{{ project.volunteerRequirements }}</p>
        <p v-else>El creador todavía no ha detallado los requisitos ni el intercambio de semillas. Puedes preguntarlo en el foro del proyecto.</p>
        <RouterLink :to="{ name: 'project-forum', params: { id: project.id } }" class="btn btn-outline-primary mt-2">
          Ir al foro
        </RouterLink>
      </article>

      <article class="content-card glass-panel seed-reward-card">
        <span class="eyebrow">Semillas</span>
        <h2>Participar tiene retorno</h2>
        <p>La idea es que el trabajo acabe en semillas compartidas: puedes aportar material, recibir semillas del proyecto o ayudar a multiplicarlas para otras personas.</p>
      </article>

      <aside class="content-card glass-panel side-card">
        <span class="eyebrow">Resumen</span>
        <ul>
          <li><strong>Estado:</strong> {{ PROJECT_STATUS_LABELS[project.status] }}</li>
          <li v-if="project.location"><strong>Zona:</strong> {{ project.location }}</li>
          <li><strong>Miembros:</strong> {{ acceptedMembers.length }}</li>
          <li><strong>Voluntarios:</strong> {{ volunteerSlotsLabel }}</li>
        </ul>
      </aside>
    </section>

    <section class="members-panel glass-panel">
      <div class="members-heading">
        <div>
          <span class="eyebrow">Comunidad</span>
          <h2>Miembros del proyecto</h2>
        </div>
        <span class="counter-pill" v-if="pendingMembers.length > 0 && isOwner">{{ pendingMembers.length }} pendientes</span>
      </div>

      <template v-if="user">
        <div v-if="isOwner && pendingMembers.length > 0" class="pending-box">
          <h3>Solicitudes pendientes</h3>
          <div class="member-list">
            <div class="member-item" v-for="member in pendingMembers" :key="member.id">
              <div>
                <RouterLink :to="{ name: 'user-detail', params: { id: member.userId } }" class="member-link">
                  <img :src="memberUsers[member.userId]?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'" alt="avatar" />
                  <strong>{{ memberUsers[member.userId]?.name || member.userId }}</strong>
                </RouterLink>
                <p v-if="member.message">“{{ member.message }}”</p>
              </div>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-success" @click="onManageMember(member.id, 'ACCEPTED')"><i class="bi bi-check"></i> Aceptar</button>
                <button class="btn btn-danger" @click="onManageMember(member.id, 'REJECTED')"><i class="bi bi-x"></i> Rechazar</button>
              </div>
            </div>
          </div>
        </div>

        <div class="member-list" v-if="acceptedMembers.length > 0">
          <div class="member-item compact" v-for="member in acceptedMembers" :key="member.id">
            <RouterLink :to="{ name: 'user-detail', params: { id: member.userId } }" class="member-link">
              <img :src="memberUsers[member.userId]?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'" alt="avatar" />
              <strong>{{ memberUsers[member.userId]?.name || member.userId }}</strong>
            </RouterLink>
            <span class="badge text-bg-warning" v-if="member.role === 'OWNER'">Creador</span>
            <span class="badge text-bg-info" v-else>Voluntario</span>
          </div>
        </div>
        <p class="text-muted" v-else>No hay miembros todavía.</p>
      </template>

      <div v-else class="login-card">
        <i class="bi bi-lock-fill"></i>
        <h3>Inicia sesión para ver los miembros</h3>
        <p>La lista de participantes solo es visible para los miembros de la red.</p>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal">Iniciar sesión</button>
      </div>
    </section>
  </main>

  <div class="container text-center mt-5" v-else>
    <h3 class="text-muted">Proyecto no encontrado</h3>
    <RouterLink :to="{ name: 'projects'}" class="btn btn-primary mt-3">Volver a proyectos</RouterLink>
  </div>
</template>

<style scoped>
.project-page {
  padding-top: 1rem;
  padding-bottom: 3rem;
}

.project-breadcrumb a {
  color: var(--raes-green-dark);
  font-weight: 800;
}

.project-hero {
  display: grid;
  grid-template-columns: minmax(260px, 0.85fr) minmax(0, 1.15fr);
  gap: clamp(1rem, 3vw, 2rem);
  padding: clamp(1rem, 3vw, 1.5rem);
  border-radius: 2rem;
}

.project-media img {
  width: 100%;
  height: 100%;
  min-height: 420px;
  object-fit: cover;
  border-radius: 1.5rem;
}

.project-main {
  min-width: 0;
}

.project-actions,
.badge-row,
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.project-actions {
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.project-main h1 {
  margin: 0.8rem 0;
  font-size: clamp(2.1rem, 6vw, 4.6rem);
  line-height: 0.96;
  font-weight: 950;
}

.location {
  color: var(--raes-muted);
  font-weight: 850;
}

.quick-facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1.2rem 0;
}

.quick-facts div {
  padding: 0.9rem;
  border: 1px solid rgba(47, 107, 63, 0.12);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.66);
}

.quick-facts strong,
.quick-facts span {
  display: block;
}

.quick-facts strong {
  color: var(--raes-green-dark);
  font-size: 1.2rem;
  font-weight: 950;
}

.quick-facts span {
  color: var(--raes-muted);
  font-size: 0.88rem;
  font-weight: 800;
}

.join-box,
.member-state {
  margin-top: 1.2rem;
}

.join-form {
  padding: 1rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.72);
}

.join-form h2 {
  font-size: 1.2rem;
  font-weight: 950;
}

.project-content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) 320px;
  gap: 1rem;
  margin: 1rem 0;
}

.content-card,
.members-panel {
  padding: 1.25rem;
  border-radius: 1.5rem;
}

.eyebrow {
  color: var(--raes-green-dark);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.content-card h2,
.members-heading h2,
.pending-box h3 {
  font-weight: 950;
}

.content-card p {
  white-space: pre-line;
  color: #334137;
  line-height: 1.7;
}

.seed-reward-card {
  border-color: rgba(183, 211, 107, 0.38);
  background: linear-gradient(135deg, rgba(232, 243, 220, 0.86), rgba(255, 255, 255, 0.72));
}

.side-card ul {
  display: grid;
  gap: 0.7rem;
  padding: 0;
  margin: 0.8rem 0 0;
  list-style: none;
}

.members-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.counter-pill {
  padding: 0.55rem 0.85rem;
  color: var(--raes-green-dark);
  font-weight: 900;
  border-radius: 999px;
  background: rgba(232, 243, 220, 0.9);
}

.pending-box {
  margin-bottom: 1rem;
}

.member-list {
  display: grid;
  gap: 0.65rem;
}

.member-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 0.85rem;
  border: 1px solid rgba(47, 107, 63, 0.1);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.7);
}

.member-item p {
  margin: 0.45rem 0 0 3rem;
  color: var(--raes-muted);
}

.member-link {
  display: inline-flex;
  gap: 0.65rem;
  align-items: center;
  color: inherit;
  text-decoration: none;
}

.member-link img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 999px;
}

.login-card {
  max-width: 520px;
  margin: auto;
  padding: 2rem 1rem;
  text-align: center;
}

.login-card i {
  color: var(--raes-muted);
  font-size: 2.5rem;
}

@media (max-width: 1050px) {
  .project-hero,
  .project-content-grid {
    grid-template-columns: 1fr;
  }

  .project-media img {
    min-height: 320px;
  }
}

@media (max-width: 767.98px) {
  .project-actions {
    justify-content: stretch;
  }

  .project-actions .btn,
  .join-box .btn-primary {
    width: 100%;
  }

  .project-media img {
    min-height: 240px;
  }

  .quick-facts {
    grid-template-columns: 1fr;
  }

  .members-heading,
  .member-item {
    align-items: stretch;
    flex-direction: column;
  }

  .member-item .btn-group {
    width: 100%;
  }

  .member-item .btn {
    flex: 1;
  }
}
</style>
