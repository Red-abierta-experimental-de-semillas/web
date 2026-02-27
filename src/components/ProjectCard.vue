<script setup lang="ts">
import { type Project, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/model/Project'
import VLazyImage from 'v-lazy-image'
import { ref, onMounted } from 'vue'
import { projectService } from '@/services/projectService'

interface Props {
  project: Project
}

const props = defineProps<Props>()

const isFull = ref(false)
const volunteersCount = ref(0)
const isLoadingMembers = ref(true)

onMounted(async () => {
  if (props.project.volunteersNeeded > 0) {
    try {
      const members = await projectService.getProjectMembers(props.project.id)
      const acceptedVolunteers = members.filter(m => m.status === 'ACCEPTED' && m.role === 'VOLUNTEER')
      volunteersCount.value = acceptedVolunteers.length
      isFull.value = volunteersCount.value >= props.project.volunteersNeeded
    } catch (e) {
      console.error(e)
    } finally {
      isLoadingMembers.value = false
    }
  } else {
    isLoadingMembers.value = false
  }
})

</script>

<template>
  <div class="card mb-3">
    <div class="row g-0">
      <div class="col-md-4">
        <RouterLink :to="{ name: 'project-detail', params: { id: project.id } }">
          <v-lazy-image v-bind:src="project.image" class="img-fluid project-img" alt="..." />
        </RouterLink>
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <div class="float-end d-flex flex-column align-items-end gap-1">
            <span :class="'badge text-bg-' + PROJECT_STATUS_COLORS[project.status]">
              {{ PROJECT_STATUS_LABELS[project.status] }}
            </span>
            
            <template v-if="project.status === 'OPEN'">
              <span v-if="project.volunteersNeeded > 0 && !isFull && !isLoadingMembers" class="badge text-bg-warning">
                <i class="bi bi-person-plus me-1"></i>Buscando voluntarios
              </span>
              <span v-else-if="project.volunteersNeeded > 0 && isFull && !isLoadingMembers" class="badge text-bg-secondary">
                <i class="bi bi-lock me-1"></i>Completo
              </span>
              <span v-else-if="project.volunteersNeeded <= 0" class="badge text-bg-info">
                <i class="bi bi-infinity me-1"></i>Sin límite
              </span>
            </template>
          </div>
          <h5 class="card-title">{{ project.title }}</h5>
          <p class="card-text text-muted mb-2">
            <small>
              <i class="bi bi-geo-alt me-1" v-if="project.location"></i>{{ project.location }}
            </small>
          </p>
          <p class="card-text">
            {{ project.description.length > 150
              ? project.description.substring(0, 150) + '...'
              : project.description }}
          </p>
          <p class="card-text">
            <span class="badge text-bg-light me-1" v-if="project.category">
              <i class="bi bi-tag me-1"></i>{{ project.category }}
            </span>
            <span class="badge text-bg-light me-1" v-for="tag in project.tags" :key="tag">
              {{ tag }}
            </span>
          </p>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
              <i class="bi bi-people me-1"></i>
              {{ project.volunteersNeeded > 0
                ? `${project.volunteersNeeded} voluntarios necesarios`
                : 'Sin límite de voluntarios' }}
            </small>
            <div>
              <RouterLink
                class="btn btn-sm btn-outline-secondary me-1"
                :to="{ name: 'project-forum', params: { id: project.id } }"
                title="Foro de discusión"
              >
                <i class="bi bi-chat-dots"></i>
              </RouterLink>
              <RouterLink
                class="btn btn-sm btn-outline-primary"
                :to="{ name: 'project-detail', params: { id: project.id } }"
              >
                Ver más
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-height: 180px;
}

@media (max-width: 768px) {
  .project-img {
    width: 100%;
    height: 30vh;
    object-fit: cover;
  }
}
</style>
