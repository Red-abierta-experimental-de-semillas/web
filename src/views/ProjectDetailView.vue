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

</script>

<template>
  <div class="container" v-if="project">
    <!-- Breadcrumb -->
    <nav class="mb-2 pt-md-5 pt-3" style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <RouterLink :to="{ name: 'projects' }">Proyectos</RouterLink>
        </li>
        <li class="breadcrumb-item active" aria-current="page">{{ project.title }}</li>
      </ol>
    </nav>

    <!-- Cabecera del proyecto -->
    <section>
      <div class="row g-0">
        <div class="col-md-4">
          <img v-bind:src="project.image" class="img-fluid project-img pe-3" alt="Imagen del proyecto" />
        </div>
        <div class="col-md-8 mt-4 mt-md-0">
          <!-- Acciones -->
          <div class="btn-group float-end">
            <RouterLink
              :to="{ name: 'project-forum', params: { id: project.id } }"
              class="btn btn-sm btn-light"
            >
              <i class="bi-chat-dots" /> Foro
            </RouterLink>
            <button class="btn btn-sm btn-light" @click.prevent="onShare">
              <i class="bi-share" /> Compartir
            </button>
            <RouterLink
              v-if="isOwner"
              :to="{ name: 'project-edit', params: { id: project.id } }"
              class="btn btn-sm btn-light"
            >
              <i class="bi-pencil" /> Editar
            </RouterLink>
          </div>

          <h1 class="mb-1">{{ project.title }}</h1>
          <p class="mb-2">
            <span :class="'badge text-bg-' + PROJECT_STATUS_COLORS[project.status]">
              {{ PROJECT_STATUS_LABELS[project.status] }}
            </span>
            <span class="badge text-bg-light ms-1" v-if="project.category">
              <i class="bi bi-tag me-1"></i>{{ project.category }}
            </span>
          </p>
          <p class="text-muted mb-2" v-if="project.location">
            <i class="bi bi-geo-alt me-1"></i>{{ project.location }}
          </p>

          <!-- Tags -->
          <p v-if="project.tags && project.tags.length > 0">
            <span class="badge text-bg-light me-1" v-for="tag in project.tags" :key="tag">
              {{ tag }}
            </span>
          </p>

          <!-- Voluntarios -->
          <p class="text-muted">
            <i class="bi bi-people me-1"></i>
            {{ acceptedMembers.length }} miembro(s)
            <span v-if="project.volunteersNeeded > 0">
              · {{ acceptedVolunteers.length }} / {{ project.volunteersNeeded }} voluntarios
            </span>
            <span v-if="isFull" class="badge text-bg-danger ms-2">
              <i class="bi bi-lock me-1"></i>Completo
            </span>
          </p>

          <!-- Botón de unirse -->
          <div v-if="user && !isOwner && !userMembership && project.status === 'OPEN' && !isFull" class="mt-3">
            <button
              v-if="!showJoinForm"
              class="btn btn-primary"
              @click="showJoinForm = true"
            >
              <i class="bi bi-person-plus me-1"></i> Unirme como voluntario
            </button>
            <div v-else class="card p-3">
              <h6>Solicitar unirse al proyecto</h6>
              <div class="mb-2">
                <textarea
                  class="form-control"
                  v-model="joinMessage"
                  rows="3"
                  placeholder="Escribe un mensaje al creador del proyecto (opcional)..."
                ></textarea>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-primary btn-sm" @click="onJoin">Enviar solicitud</button>
                <button class="btn btn-light btn-sm" @click="showJoinForm = false">Cancelar</button>
              </div>
            </div>
          </div>

          <!-- Estado de solicitud -->
          <div v-if="userMembership && !isOwner" class="mt-3">
            <span class="badge text-bg-info" v-if="userMembership.status === 'PENDING'">
              <i class="bi bi-hourglass-split me-1"></i> Tu solicitud está pendiente de aprobación
            </span>
            <span class="badge text-bg-success" v-else-if="userMembership.status === 'ACCEPTED'">
              <i class="bi bi-check-circle me-1"></i> Eres miembro de este proyecto
            </span>
            <span class="badge text-bg-danger" v-else-if="userMembership.status === 'REJECTED'">
              <i class="bi bi-x-circle me-1"></i> Tu solicitud fue rechazada
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Tabs: Info + Miembros -->
    <section class="mt-5">
      <ul class="nav nav-tabs nav-fill">
        <li class="nav-item">
          <a href="#info" class="nav-link active" data-bs-toggle="tab">Información</a>
        </li>
        <li class="nav-item">
          <a href="#members" class="nav-link" data-bs-toggle="tab">
            Miembros
            <span class="badge text-bg-primary ms-1" v-if="pendingMembers.length > 0 && isOwner">
              {{ pendingMembers.length }}
            </span>
          </a>
        </li>
      </ul>
      <div class="tab-content">
        <!-- Tab: Información -->
        <div class="tab-pane fade show active mt-4" id="info">
          <h4>Descripción</h4>
          <p style="white-space: pre-line">{{ project.description }}</p>

          <div v-if="project.volunteerRequirements" class="mt-4">
            <h4>¿Qué se les pide a los voluntarios?</h4>
            <p style="white-space: pre-line">{{ project.volunteerRequirements }}</p>
          </div>
        </div>

        <!-- Tab: Miembros -->
        <div class="tab-pane fade mt-4" id="members">
          <!-- Solicitudes pendientes (solo visible para el owner) -->
          <div v-if="isOwner && pendingMembers.length > 0" class="mb-4">
            <h5>Solicitudes pendientes</h5>
            <div class="list-group">
              <div
                class="list-group-item d-flex justify-content-between align-items-start"
                v-for="member in pendingMembers"
                :key="member.id"
              >
                <div class="d-flex align-items-center mb-2 mb-sm-0">
                  <RouterLink :to="{ name: 'user-detail', params: { id: member.userId } }" class="text-decoration-none d-flex align-items-center text-dark">
                    <img :src="memberUsers[member.userId]?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'" class="rounded-circle me-2 object-fit-cover shadow-sm" width="35" height="35" alt="avatar" />
                    <strong>{{ memberUsers[member.userId]?.name || member.userId }}</strong>
                  </RouterLink>
                  <p class="mb-0 text-muted ms-3" v-if="member.message">
                    <small>"{{ member.message }}"</small>
                  </p>
                </div>
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-success"
                    @click="onManageMember(member.id, 'ACCEPTED')"
                  >
                    <i class="bi bi-check"></i> Aceptar
                  </button>
                  <button
                    class="btn btn-danger"
                    @click="onManageMember(member.id, 'REJECTED')"
                  >
                    <i class="bi bi-x"></i> Rechazar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Miembros aceptados -->
          <h5>Miembros del proyecto</h5>
          <div class="list-group" v-if="acceptedMembers.length > 0">
            <div
              class="list-group-item d-flex justify-content-between align-items-center"
              v-for="member in acceptedMembers"
              :key="member.id"
            >
              <span class="d-flex align-items-center">
                <RouterLink :to="{ name: 'user-detail', params: { id: member.userId } }" class="text-decoration-none d-flex align-items-center text-dark hover-primary">
                  <img :src="memberUsers[member.userId]?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'" class="rounded-circle me-3 object-fit-cover shadow-sm" width="40" height="40" alt="avatar" />
                  <strong>{{ memberUsers[member.userId]?.name || member.userId }}</strong>
                </RouterLink>
                <span class="badge text-bg-warning ms-3" v-if="member.role === 'OWNER'">Creador</span>
                <span class="badge text-bg-info ms-3" v-else>Voluntario</span>
              </span>
              <small class="text-muted">{{ MEMBERSHIP_STATUS_LABELS[member.status] }}</small>
            </div>
          </div>
          <p class="text-muted" v-else>No hay miembros todavía.</p>
        </div>
      </div>
    </section>
  </div>

  <!-- Proyecto no encontrado -->
  <div class="container text-center mt-5" v-else>
    <h3 class="text-muted">Proyecto no encontrado</h3>
    <RouterLink :to="{ name: 'projects'}" class="btn btn-primary mt-3">
      Volver a proyectos
    </RouterLink>
  </div>
</template>

<style scoped>
.project-img {
  width: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .project-img {
    width: 100%;
    height: 30vh;
    object-fit: cover;
  }
}

.hover-primary:hover strong {
  color: #0d6efd;
  text-decoration: underline;
}
</style>
