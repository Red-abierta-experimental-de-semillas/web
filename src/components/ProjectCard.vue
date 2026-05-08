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
  <article class="project-card card">
    <RouterLink class="image-wrap" :to="{ name: 'project-detail', params: { id: project.id } }">
      <v-lazy-image v-bind:src="project.image" class="project-img" alt="Imagen del proyecto" />
      <span v-if="project.category" class="category-chip">
        <i class="bi bi-tag me-1"></i>{{ project.category }}
      </span>
    </RouterLink>

    <div class="project-content">
      <div class="status-row">
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

      <RouterLink class="title-link" :to="{ name: 'project-detail', params: { id: project.id } }">
        <h3>{{ project.title }}</h3>
      </RouterLink>

      <p class="location" v-if="project.location">
        <i class="bi bi-geo-alt me-1"></i>{{ project.location }}
      </p>

      <p class="description">
        {{ project.description.length > 170
          ? project.description.substring(0, 170) + '...'
          : project.description }}
      </p>

      <div class="tag-row" v-if="project.tags.length > 0">
        <span class="badge text-bg-light" v-for="tag in project.tags.slice(0, 4)" :key="tag">
          {{ tag }}
        </span>
        <span class="badge text-bg-light" v-if="project.tags.length > 4">+{{ project.tags.length - 4 }}</span>
      </div>

      <div class="project-footer">
        <small class="volunteers">
          <i class="bi bi-people me-1"></i>
          {{ project.volunteersNeeded > 0
            ? `${volunteersCount}/${project.volunteersNeeded} voluntarios`
            : 'Sin límite de voluntarios' }}
        </small>
        <div class="action-row">
          <RouterLink
            class="btn btn-sm btn-outline-secondary icon-button"
            :to="{ name: 'project-forum', params: { id: project.id } }"
            title="Foro de discusión"
          >
            <i class="bi bi-chat-dots"></i>
          </RouterLink>
          <RouterLink
            class="btn btn-sm btn-primary"
            :to="{ name: 'project-detail', params: { id: project.id } }"
          >
            Ver proyecto
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.project-card {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  overflow: hidden;
  border-radius: 1.65rem;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.project-card:hover {
  transform: translateY(-3px);
  border-color: rgba(47, 107, 63, 0.24) !important;
  box-shadow: 0 28px 80px rgba(31, 74, 45, 0.18);
}

.image-wrap {
  position: relative;
  display: block;
  min-height: 100%;
  overflow: hidden;
  background: var(--raes-green-soft);
}

.project-img {
  width: 100%;
  height: 100%;
  min-height: 245px;
  object-fit: cover;
  transition: transform 360ms ease;
}

.project-card:hover .project-img {
  transform: scale(1.04);
}

.category-chip {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  max-width: calc(100% - 2rem);
  padding: 0.55rem 0.75rem;
  color: var(--raes-green-dark);
  font-size: 0.82rem;
  font-weight: 900;
  border-radius: 999px;
  background: rgba(255, 250, 240, 0.88);
  backdrop-filter: blur(10px);
}

.project-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: clamp(1.1rem, 2.4vw, 1.55rem);
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.75rem;
}

.title-link {
  color: inherit;
  text-decoration: none;
}

.title-link h3 {
  margin: 0;
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  line-height: 1.08;
  font-weight: 950;
}

.title-link:hover h3 {
  color: var(--raes-green-dark);
}

.location {
  margin: 0.6rem 0 0;
  color: var(--raes-muted);
  font-weight: 800;
}

.description {
  margin: 0.8rem 0 1rem;
  color: #3c473e;
  line-height: 1.6;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(47, 107, 63, 0.1);
}

.volunteers {
  color: var(--raes-muted);
  font-weight: 800;
}

.action-row {
  display: flex;
  gap: 0.45rem;
  align-items: center;
}

.icon-button {
  width: 2.35rem;
  padding-inline: 0;
}

@media (max-width: 767.98px) {
  .project-card {
    grid-template-columns: 1fr;
    border-radius: 1.25rem;
  }

  .project-img {
    min-height: 220px;
    max-height: 300px;
  }

  .project-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .action-row,
  .action-row .btn-primary {
    width: 100%;
  }

  .action-row .btn-primary {
    flex: 1;
  }
}
</style>
