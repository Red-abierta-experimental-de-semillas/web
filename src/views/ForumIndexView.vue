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
const totalMessages = computed(() => Object.values(postCounts.value).reduce((sum, count) => sum + count, 0))

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}
</script>

<template>
  <main class="forum-page">
    <section class="raes-shell forum-topbar">
      <div>
        <RouterLink :to="{ name: 'home' }" class="back-link">
          <i class="bi bi-arrow-left"></i> Proyectos
        </RouterLink>
        <h1>Foros</h1>
        <p>Conversaciones de la red, ordenadas por tema y proyecto.</p>
      </div>
      <div class="forum-summary">
        <span>{{ projects.length }} foros</span>
        <span>{{ totalMessages }} mensajes</span>
      </div>
    </section>

    <section class="raes-shell forum-layout">
      <aside class="forum-sidebar">
        <RouterLink :to="{ name: 'forum-general' }" class="sidebar-link active-link">
          <i class="bi bi-globe2"></i>
          Discusión general
          <span>{{ postCounts['general'] || 0 }}</span>
        </RouterLink>
        <a href="#project-forums" class="sidebar-link">
          <i class="bi bi-folder2-open"></i>
          Proyectos
          <span>{{ projects.length }}</span>
        </a>
      </aside>

      <div class="forum-content">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner-border text-primary" role="status"></div>
          <p>Cargando temas...</p>
        </div>

        <template v-else>
          <RouterLink :to="{ name: 'forum-general' }" class="topic-row general-row">
            <div class="topic-icon"><i class="bi bi-globe2"></i></div>
            <div class="topic-main">
              <h2>Discusión general</h2>
              <p>Temas comunes de la red que no pertenecen a un proyecto concreto.</p>
            </div>
            <div class="topic-count">
              <strong>{{ postCounts['general'] || 0 }}</strong>
              <span>mensajes</span>
            </div>
          </RouterLink>

          <div class="forum-section-title" id="project-forums">
            <h2>Foros de proyectos</h2>
            <span>{{ projects.length }} proyectos</span>
          </div>

          <div class="topic-list" v-if="projects.length > 0">
            <RouterLink
              v-for="project in projects"
              :key="project.id"
              :to="{ name: 'project-forum', params: { id: project.id } }"
              class="topic-row"
            >
              <div class="topic-avatar">
                <img v-if="project.image" :src="project.image" :alt="project.title" />
                <i v-else class="bi bi-seedling"></i>
              </div>
              <div class="topic-main">
                <div class="topic-meta">
                  <span>{{ project.category || 'Proyecto' }}</span>
                  <span v-if="project.status === 'CLOSED'">Cerrado</span>
                </div>
                <h3>{{ project.title }}</h3>
                <p>{{ project.description }}</p>
                <small>Creado el {{ formatDate(project.createdAt) }}</small>
              </div>
              <div class="topic-count">
                <strong>{{ postCounts[project.id] || 0 }}</strong>
                <span>mensajes</span>
              </div>
            </RouterLink>
          </div>

          <div class="empty-state" v-else>
            <i class="bi bi-box-seam"></i>
            <h2>No hay proyectos disponibles</h2>
            <p>Cuando haya proyectos, sus foros aparecerán aquí.</p>
          </div>
        </template>
      </div>
    </section>
  </main>
</template>

<style scoped>
.forum-page {
  padding-bottom: 2rem;
}

.forum-topbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
  padding: 1rem 0 1.25rem;
  border-bottom: 1px solid rgba(47, 107, 63, 0.13);
}

.back-link {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.65rem;
  color: var(--raes-muted);
  font-weight: 800;
  text-decoration: none;
}

.back-link:hover {
  color: var(--raes-green-dark);
}

.forum-topbar h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.6rem);
  font-weight: 900;
  line-height: 1;
}

.forum-topbar p {
  margin: 0.45rem 0 0;
  color: var(--raes-muted);
  font-size: 1rem;
}

.forum-summary {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: end;
}

.forum-summary span {
  padding: 0.45rem 0.7rem;
  color: var(--raes-green-dark);
  font-size: 0.9rem;
  font-weight: 800;
  border-radius: 999px;
  background: rgba(232, 243, 220, 0.8);
}

.forum-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 1.5rem;
  padding-top: 1.25rem;
}

.forum-sidebar {
  position: sticky;
  top: 7rem;
  align-self: start;
  display: grid;
  gap: 0.35rem;
}

.sidebar-link {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.55rem;
  align-items: center;
  padding: 0.7rem 0.8rem;
  color: var(--raes-muted);
  text-decoration: none;
  border-radius: 0.75rem;
  font-weight: 800;
}

.sidebar-link:hover,
.active-link {
  color: var(--raes-green-dark);
  background: rgba(232, 243, 220, 0.75);
}

.forum-content {
  min-width: 0;
}

.loading-state,
.empty-state {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--raes-muted);
}

.empty-state i {
  color: var(--raes-green);
  font-size: 2.4rem;
}

.topic-list {
  display: grid;
  border-top: 1px solid rgba(47, 107, 63, 0.14);
}

.topic-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.9rem;
  align-items: center;
  padding: 1rem 0.25rem;
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid rgba(47, 107, 63, 0.14);
}

.topic-row:hover {
  background: rgba(255, 255, 255, 0.5);
}

.general-row {
  margin-bottom: 1.25rem;
  padding: 1rem;
  border: 1px solid rgba(47, 107, 63, 0.14);
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.52);
}

.topic-icon,
.topic-avatar {
  display: grid;
  place-items: center;
  width: 2.9rem;
  height: 2.9rem;
  overflow: hidden;
  color: var(--raes-green-dark);
  border-radius: 999px;
  background: var(--raes-green-soft);
  font-size: 1.25rem;
}

.topic-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.topic-main {
  min-width: 0;
}

.topic-meta {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
  color: var(--raes-green-dark);
  font-size: 0.78rem;
  font-weight: 850;
}

.topic-main h2,
.topic-main h3 {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 900;
  line-height: 1.2;
}

.topic-main p {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0.25rem 0 0;
  color: var(--raes-muted);
  font-size: 0.94rem;
  line-height: 1.45;
}

.topic-main small {
  display: block;
  margin-top: 0.35rem;
  color: var(--raes-muted);
  font-size: 0.82rem;
}

.topic-count {
  min-width: 4.5rem;
  color: var(--raes-muted);
  text-align: right;
}

.topic-count strong,
.topic-count span {
  display: block;
}

.topic-count strong {
  color: var(--raes-green-dark);
  font-size: 1.1rem;
}

.topic-count span {
  font-size: 0.78rem;
  font-weight: 750;
}

.forum-section-title {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.forum-section-title h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 900;
}

.forum-section-title span {
  color: var(--raes-muted);
  font-size: 0.9rem;
  font-weight: 800;
}

@media (max-width: 767.98px) {
  .forum-topbar {
    align-items: start;
    flex-direction: column;
  }

  .forum-summary {
    justify-content: start;
  }

  .forum-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .forum-sidebar {
    position: static;
    display: flex;
    overflow-x: auto;
    padding-bottom: 0.2rem;
  }

  .sidebar-link {
    white-space: nowrap;
  }

  .topic-row,
  .general-row {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .topic-count {
    grid-column: 2;
    display: flex;
    gap: 0.35rem;
    min-width: 0;
    text-align: left;
  }
}
</style>
