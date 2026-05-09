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
  <main>
    <section class="forum-hero">
      <div class="raes-shell forum-hero-grid">
        <div>
          <RouterLink :to="{ name: 'home' }" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver a proyectos
          </RouterLink>
          <span class="eyebrow"><i class="bi bi-chat-square-heart me-2"></i>Comunidad RAES</span>
          <h1>Foros para hablar de los proyectos.</h1>
          <p>Un espacio para compartir avances, dudas y decisiones de cada proyecto.</p>
        </div>
        <aside class="forum-stats glass-panel">
          <div>
            <strong>{{ projects.length }}</strong>
            <span>foros de proyecto</span>
          </div>
          <div>
            <strong>{{ totalMessages }}</strong>
            <span>mensajes publicados</span>
          </div>
        </aside>
      </div>
    </section>

    <section class="raes-shell forum-board">
      <div v-if="isLoading" class="loading-state glass-panel">
        <div class="spinner-border text-primary" role="status"></div>
        <p>Cargando temas...</p>
      </div>

      <template v-else>
        <RouterLink :to="{ name: 'forum-general' }" class="forum-feature-card glass-panel">
          <div class="feature-icon"><i class="bi bi-globe2"></i></div>
          <div>
            <span class="eyebrow">Foro público</span>
            <h2>Discusión general</h2>
            <p>Temas comunes de la red que no pertenecen a un proyecto concreto.</p>
          </div>
          <div class="feature-meta">
            <span class="badge text-bg-light"><i class="bi bi-people me-1"></i>Público</span>
            <strong>{{ postCounts['general'] || 0 }}</strong>
            <small>{{ postCounts['general'] === 1 ? 'mensaje' : 'mensajes' }}</small>
          </div>
        </RouterLink>

        <div class="section-heading">
          <div>
            <span class="eyebrow">Foros de proyectos</span>
            <h2>Foros por proyecto</h2>
          </div>
          <span class="counter-pill">{{ projects.length }} proyectos</span>
        </div>

        <div class="project-forum-grid" v-if="projects.length > 0">
          <RouterLink
            v-for="project in projects"
            :key="project.id"
            :to="{ name: 'project-forum', params: { id: project.id } }"
            class="project-forum-card card"
          >
            <div class="project-cover">
              <img v-if="project.image" :src="project.image" :alt="project.title" />
              <div v-else class="project-placeholder"><i class="bi bi-image"></i></div>
              <span v-if="project.status === 'CLOSED'" class="closed-chip">Cerrado</span>
            </div>
            <div class="project-forum-body">
              <div class="card-meta">
                <span class="badge text-bg-light">{{ project.category || 'Proyecto' }}</span>
                <span><i class="bi bi-chat-left-text me-1"></i>{{ postCounts[project.id] || 0 }}</span>
              </div>
              <h3>{{ project.title }}</h3>
              <p>{{ project.description }}</p>
              <small><i class="bi bi-calendar3 me-1"></i>Creado el {{ formatDate(project.createdAt) }}</small>
            </div>
          </RouterLink>
        </div>

        <div class="empty-state glass-panel" v-else>
          <i class="bi bi-box-seam"></i>
          <h2>No hay proyectos disponibles</h2>
          <p>Cuando haya proyectos, sus foros aparecerán aquí.</p>
        </div>
      </template>
    </section>
  </main>
</template>

<style scoped>
.forum-hero {
  padding: 1.25rem 0 2rem;
}

.forum-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
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

.forum-hero h1 {
  max-width: 860px;
  margin: 0.8rem 0 1rem;
  font-size: clamp(2.35rem, 6vw, 5rem);
  font-weight: 950;
  line-height: 0.95;
}

.forum-hero p {
  max-width: 720px;
  color: var(--raes-muted);
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.65;
}

.forum-stats {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 1.65rem;
}

.forum-stats div {
  padding: 1rem;
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.66);
}

.forum-stats strong {
  display: block;
  color: var(--raes-green-dark);
  font-size: 2.6rem;
  line-height: 1;
}

.forum-stats span {
  color: var(--raes-muted);
  font-weight: 900;
}

.forum-board {
  padding-bottom: 2rem;
}

.loading-state,
.empty-state {
  padding: 4rem 1.5rem;
  text-align: center;
  border-radius: 2rem;
}

.loading-state p,
.empty-state p { color: var(--raes-muted); margin: 1rem 0 0; }
.empty-state i { color: var(--raes-green); font-size: 3rem; }

.forum-feature-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: center;
  padding: 1.3rem;
  color: inherit;
  text-decoration: none;
  border-radius: 1.8rem;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.forum-feature-card:hover,
.project-forum-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 28px 80px rgba(31, 74, 45, 0.18);
}

.feature-icon {
  display: grid;
  place-items: center;
  width: 4.6rem;
  height: 4.6rem;
  color: var(--raes-green-dark);
  border-radius: 1.45rem;
  background: linear-gradient(145deg, #fff, var(--raes-green-soft));
  font-size: 2rem;
}

.forum-feature-card h2,
.section-heading h2,
.empty-state h2 {
  margin: 0.2rem 0;
  font-weight: 950;
}

.forum-feature-card p {
  margin: 0;
  color: var(--raes-muted);
  line-height: 1.55;
}

.feature-meta {
  display: grid;
  justify-items: end;
  gap: 0.25rem;
  color: var(--raes-muted);
}

.feature-meta strong {
  color: var(--raes-green-dark);
  font-size: 2.4rem;
  line-height: 1;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
  margin: 2.2rem 0 1rem;
}

.counter-pill {
  padding: 0.65rem 0.9rem;
  color: var(--raes-green-dark);
  font-weight: 900;
  border-radius: 999px;
  background: rgba(232, 243, 220, 0.9);
}

.project-forum-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.project-forum-card {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  border-radius: 1.55rem;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.project-cover {
  position: relative;
  min-height: 210px;
  background: var(--raes-green-soft);
}

.project-cover img,
.project-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-placeholder {
  display: grid;
  place-items: center;
  color: var(--raes-green-dark);
  font-size: 2rem;
}

.closed-chip {
  position: absolute;
  left: 0.8rem;
  bottom: 0.8rem;
  padding: 0.35rem 0.65rem;
  color: white;
  font-size: 0.75rem;
  font-weight: 900;
  border-radius: 999px;
  background: #9b2c2c;
}

.project-forum-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 1.1rem;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  color: var(--raes-muted);
  font-weight: 900;
  margin-bottom: 0.75rem;
}

.project-forum-body h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 950;
  line-height: 1.12;
}

.project-forum-body p {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0.7rem 0 1rem;
  color: var(--raes-muted);
  line-height: 1.55;
}

.project-forum-body small {
  margin-top: auto;
  color: var(--raes-muted);
  font-weight: 800;
}

@media (max-width: 1000px) {
  .forum-hero-grid,
  .project-forum-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .forum-feature-card,
  .section-heading,
  .project-forum-card {
    grid-template-columns: 1fr;
  }

  .forum-feature-card {
    align-items: start;
  }

  .feature-meta {
    justify-items: start;
    grid-template-columns: auto auto auto;
    align-items: center;
  }

  .project-cover {
    min-height: 190px;
  }
}
</style>
