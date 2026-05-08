<script setup lang="ts">
import ProjectCard from '@/components/ProjectCard.vue'
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/users'
import { PROJECT_CATEGORIES } from '@/model/Project'

const userStore = useUsersStore()
const { user } = storeToRefs(userStore)

const projectStore = useProjectStore()
const { isLoading, getProjects, filters } = storeToRefs(projectStore)

</script>

<template>
  <main>
    <section class="hero-section">
      <div class="raes-shell hero-grid">
        <div class="hero-copy">
          <span class="eyebrow"><i class="bi bi-stars me-2"></i>Investigación abierta y viva</span>
          <h1>Conecta cultivos, personas y experimentos con semillas.</h1>
          <p>
            Una red para compartir proyectos, encontrar colaboración y documentar aprendizajes del campo con una interfaz más clara, rápida y bonita.
          </p>
          <div class="hero-actions">
            <a href="#projects" class="btn btn-primary btn-lg">
              Explorar proyectos <i class="bi bi-arrow-down-short ms-1"></i>
            </a>
            <RouterLink :to="{ name: 'project-new' }" class="btn btn-outline-primary btn-lg" v-if="user">
              Crear proyecto
            </RouterLink>
          </div>
        </div>

        <div class="hero-card glass-panel">
          <div class="hero-orbit">
            <span></span><span></span><span></span>
          </div>
          <div class="stat-row">
            <strong>{{ getProjects.length }}</strong>
            <span>proyectos activos en la red</span>
          </div>
          <div class="mini-card">
            <i class="bi bi-flower1"></i>
            <div>
              <strong>Semillas locales</strong>
              <span>Ensayos, conservación y mejora participativa.</span>
            </div>
          </div>
          <div class="mini-card offset-card">
            <i class="bi bi-people"></i>
            <div>
              <strong>Colaboración abierta</strong>
              <span>Voluntariado, foros y seguimiento por proyecto.</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="raes-shell projects-panel" id="projects">
      <form v-on:submit.prevent class="search-panel glass-panel">
        <div class="input-group input-group-lg search-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input
            type="search"
            class="form-control"
            v-model="filters.searchBar"
            placeholder="Buscar por proyecto, cultivo, lugar..."
            aria-label="Buscar"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#filtersCollapse"
            aria-expanded="false"
            aria-controls="filtersCollapse"
          >
            Filtros <i class="bi bi-sliders ms-1"></i>
          </button>
        </div>

        <div class="collapse" id="filtersCollapse">
          <div class="filters-grid mt-3">
            <div>
              <label class="form-label">Categoría</label>
              <select class="form-select" v-model="filters.category">
                <option :value="null">Todas</option>
                <option v-for="cat in PROJECT_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Estado</label>
              <select class="form-select" v-model="filters.status">
                <option :value="null">Todos</option>
                <option value="OPEN">Abierto</option>
                <option value="IN_PROGRESS">En progreso</option>
                <option value="COMPLETED">Completado</option>
                <option value="CLOSED">Cerrado</option>
              </select>
            </div>
          </div>
        </div>
      </form>

      <div class="text-center loading-state" v-if="isLoading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div class="projects-list" v-else-if="getProjects.length > 0">
        <div class="list-heading">
          <div>
            <span class="eyebrow">Catálogo experimental</span>
            <h2>Proyectos disponibles</h2>
          </div>
          <div class="list-actions">
            <span class="counter-pill">{{ getProjects.length }} resultados</span>
            <RouterLink
              :to="{ name: 'project-new' }"
              class="btn btn-primary"
              v-if="user"
            >
              <i class="bi-plus-lg me-1"></i>
              Crear proyecto
            </RouterLink>
          </div>
        </div>

        <div class="project-grid">
          <ProjectCard v-for="project in getProjects" :key="project.id" :project="project" />
        </div>
      </div>

      <div v-else class="empty-state glass-panel">
        <i class="bi bi-seedling"></i>
        <h2>No hay proyectos todavía</h2>
        <p>Buen momento para plantar el primero. Literalmente.</p>
        <RouterLink
          :to="{ name: 'project-new' }"
          class="btn btn-primary mt-2"
          v-if="user"
        >
          <i class="bi-plus-lg me-1"></i>
          Crear proyecto
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.hero-section {
  padding: 1.25rem 0 2.5rem;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: clamp(1.5rem, 4vw, 4rem);
  align-items: center;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  color: var(--raes-green-dark);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-copy h1 {
  max-width: 760px;
  margin: 0.8rem 0 1rem;
  font-size: clamp(2.4rem, 7vw, 5.6rem);
  line-height: 0.93;
  font-weight: 950;
}

.hero-copy p {
  max-width: 650px;
  color: var(--raes-muted);
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  line-height: 1.65;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1.75rem;
}

.hero-card {
  position: relative;
  overflow: hidden;
  min-height: 430px;
  padding: 1.4rem;
  border-radius: 2rem;
}

.hero-card::before {
  content: '';
  position: absolute;
  inset: auto -20% -22% auto;
  width: 20rem;
  height: 20rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(183, 211, 107, 0.55), transparent 65%);
}

.hero-orbit {
  position: relative;
  height: 210px;
  border-radius: 1.6rem;
  background:
    linear-gradient(135deg, rgba(47, 107, 63, 0.12), rgba(255, 255, 255, 0.2)),
    url('@/assets/seed-card/content_bg.jpg') center/cover;
  overflow: hidden;
}

.hero-orbit span {
  position: absolute;
  display: block;
  border-radius: 999px;
  background: rgba(255, 250, 240, 0.86);
  box-shadow: 0 18px 50px rgba(31, 74, 45, 0.2);
}

.hero-orbit span:nth-child(1) { width: 5.8rem; height: 5.8rem; left: 10%; top: 18%; }
.hero-orbit span:nth-child(2) { width: 3.4rem; height: 3.4rem; right: 16%; top: 22%; }
.hero-orbit span:nth-child(3) { width: 7.2rem; height: 7.2rem; right: 24%; bottom: -18%; }

.stat-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.stat-row strong {
  font-size: 3.6rem;
  line-height: 1;
  color: var(--raes-green-dark);
}

.stat-row span {
  color: var(--raes-muted);
  font-weight: 800;
}

.mini-card {
  position: relative;
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  width: 86%;
  padding: 1rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(47, 107, 63, 0.12);
}

.mini-card i {
  display: grid;
  place-items: center;
  flex: 0 0 2.5rem;
  height: 2.5rem;
  color: var(--raes-green-dark);
  border-radius: 0.9rem;
  background: var(--raes-green-soft);
  font-size: 1.25rem;
}

.mini-card strong,
.mini-card span {
  display: block;
}

.mini-card span {
  color: var(--raes-muted);
  font-size: 0.92rem;
}

.offset-card {
  margin-top: 0.8rem;
  margin-left: auto;
}

.projects-panel {
  padding-bottom: 2rem;
}

.search-panel {
  position: sticky;
  top: 6.15rem;
  z-index: 10;
  padding: 0.8rem;
  border-radius: 1.45rem;
}

.search-group .input-group-text {
  color: var(--raes-green-dark);
  background: rgba(255, 255, 255, 0.74);
  border-color: rgba(47, 107, 63, 0.18);
  border-radius: 1rem 0 0 1rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.loading-state {
  padding: 5rem 0;
}

.list-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
  margin: 2.4rem 0 1rem;
}

.list-heading h2 {
  margin: 0.15rem 0 0;
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 950;
}

.list-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
}

.counter-pill {
  padding: 0.65rem 0.9rem;
  color: var(--raes-green-dark);
  font-weight: 900;
  border-radius: 999px;
  background: rgba(232, 243, 220, 0.9);
}

.project-grid {
  display: grid;
  gap: 1rem;
}

.empty-state {
  margin-top: 2rem;
  padding: 4rem 1.5rem;
  text-align: center;
  border-radius: 2rem;
}

.empty-state i {
  color: var(--raes-green);
  font-size: 3rem;
}

.empty-state h2 {
  margin-top: 1rem;
  font-weight: 950;
}

.empty-state p {
  color: var(--raes-muted);
}

@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }

  .hero-card {
    min-height: auto;
  }
}

@media (max-width: 767.98px) {
  .hero-section {
    padding-top: 0.75rem;
  }

  .hero-copy h1 {
    font-size: clamp(2.2rem, 13vw, 3.9rem);
  }

  .hero-actions .btn {
    width: 100%;
  }

  .search-panel {
    top: 5rem;
    border-radius: 1rem;
  }

  .search-group {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .search-group .btn {
    grid-column: 1 / -1;
    margin-top: 0.6rem;
    border-radius: 0.9rem !important;
  }

  .filters-grid,
  .list-heading {
    grid-template-columns: 1fr;
    display: grid;
  }

  .list-actions,
  .list-actions .btn {
    width: 100%;
  }

  .counter-pill {
    text-align: center;
  }
}
</style>
