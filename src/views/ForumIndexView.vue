<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { projectService } from '@/services/projectService'

const projectStore = useProjectStore()
const isLoading = ref(true)
const postCounts = ref<Record<string, number>>({})

onMounted(async () => {
  await projectStore.fetch()
  const projs = projectStore.projects || []
  
  // Load post counts
  try {
    const promises = [
      projectService.getDiscussionPosts('general').then(posts => {
        postCounts.value['general'] = posts.length
      }),
      ...projs.map(p => 
        projectService.getDiscussionPosts(p.id).then(posts => { 
          postCounts.value[p.id] = posts.length 
        })
      )
    ]
    await Promise.allSettled(promises)
  } catch (e) {
    console.error(e)
  }
  
  isLoading.value = false
})

const projects = computed(() => projectStore.projects || [])

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    day: 'numeric', month: 'short', year: 'numeric'
  })
}
</script>

<template>
  <main class="container pt-4 pb-5 mb-5">
    <div class="d-flex align-items-center mb-4 border-bottom pb-3">
      <h2 class="mb-0 fw-bold text-dark d-flex align-items-center">
        <i class="bi bi-chat-square-text text-primary me-3 fs-3"></i> Foros de la Comunidad
      </h2>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-muted">Cargando temas...</p>
    </div>

    <template v-else>
      <div class="row">
        <div class="col-12">
          <!-- Categoría General -->
          <div class="card shadow-sm mb-4 border-0 rounded-4 overflow-hidden">
            <div class="card-header bg-dark text-white py-3 fw-bold d-flex align-items-center fs-5">
              <i class="bi bi-globe me-2 text-info"></i> General
            </div>
            <div class="list-group list-group-flush">
              <RouterLink :to="{ name: 'forum-general' }" class="list-group-item list-group-item-action py-4 px-4 d-flex align-items-center border-bottom-0">
                <div class="forum-icon bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-4" style="width: 56px; height: 56px;">
                  <i class="bi bi-chat-dots fs-3"></i>
                </div>
                <div class="flex-grow-1">
                  <h4 class="mb-1 text-dark fw-bold forum-title">Discusión General</h4>
                  <p class="mb-0 text-muted">Espacio abierto para toda la comunidad y temas no relacionados a un proyecto específico.</p>
                </div>
                <div class="text-end text-muted d-none d-md-flex flex-column align-items-end ms-3" style="min-width: 140px;">
                  <span class="badge bg-primary rounded-pill mb-2 px-3 py-2"><i class="bi bi-people me-1"></i> Público</span>
                  <small class="d-block text-muted">
                    <i class="bi bi-chat-left-text me-1"></i> 
                    {{ postCounts['general'] || 0 }} {{ postCounts['general'] === 1 ? 'mensaje' : 'mensajes' }}
                  </small>
                </div>
              </RouterLink>
            </div>
          </div>

          <!-- Categoría Proyectos -->
          <div class="card shadow-sm mb-4 border-0 rounded-4 overflow-hidden">
            <div class="card-header bg-dark text-white py-3 fw-bold d-flex align-items-center fs-5">
              <i class="bi bi-boxes me-2 text-warning"></i> Foros por Proyecto
            </div>
            <div class="list-group list-group-flush" v-if="projects.length > 0">
              <RouterLink 
                v-for="(project, index) in projects" 
                :key="project.id" 
                :to="{ name: 'project-forum', params: { id: project.id } }" 
                class="list-group-item list-group-item-action py-4 px-4 d-flex align-items-center" 
                :class="{ 'border-bottom-0': index === projects.length - 1 }">
                <div class="forum-icon me-4 position-relative">
                  <img v-if="project.image" :src="project.image" class="rounded-3 shadow-sm object-fit-cover" style="width: 56px; height: 56px;" :alt="project.title" />
                  <div v-else class="bg-secondary bg-opacity-10 text-secondary rounded-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 56px; height: 56px;">
                    <i class="bi bi-image fs-3"></i>
                  </div>
                  <div v-if="project.status === 'CLOSED'" class="position-absolute top-100 start-50 translate-middle badge bg-danger rounded-pill" style="font-size: 0.6rem;">Cerrado</div>
                </div>
                <div class="flex-grow-1">
                  <h4 class="mb-1 text-dark fw-bold forum-title">{{ project.title }}</h4>
                  <p class="mb-0 text-muted text-truncate" style="max-width: 500px;">{{ project.description }}</p>
                </div>
                <div class="text-end text-muted d-none d-lg-flex flex-column align-items-end ms-3" style="min-width: 150px;">
                  <span class="badge bg-light border text-dark mb-2 px-3 py-2 text-truncate" style="max-width: 150px;">{{ project.category || 'Proyecto' }}</span>
                  <small class="d-block text-muted mb-1 fw-bold">
                    <i class="bi bi-chat-left-text me-1"></i> {{ postCounts[project.id] || 0 }} {{ postCounts[project.id] === 1 ? 'mensaje' : 'mensajes' }}
                  </small>
                  <small class="d-block text-muted" style="font-size: 0.75rem;">Creado el {{ formatDate(project.createdAt) }}</small>
                </div>
              </RouterLink>
            </div>
            <div class="card-body text-center text-muted py-5" v-else>
              <i class="bi bi-box-seam display-4 d-block mb-3 text-light"></i>
              <p class="mb-0">No hay proyectos disponibles en este momento.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
.forum-icon {
  flex-shrink: 0;
}
.list-group-item-action {
  transition: all 0.2s ease;
}
.list-group-item-action:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
}
.forum-title {
  transition: color 0.15s ease-in-out;
}
.list-group-item-action:hover .forum-title {
  color: #0d6efd !important;
}
</style>
