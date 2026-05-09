<script setup lang="ts">
import ProjectCard from '@/components/ProjectCard.vue'
import { useProjectStore } from '@/stores/project'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/users'
import { PROJECT_CATEGORIES } from '@/model/Project'
import { computed } from 'vue'

const userStore = useUsersStore()
const { user } = storeToRefs(userStore)

const projectStore = useProjectStore()
const { isLoading, getProjects, filters } = storeToRefs(projectStore)

const featuredProjects = computed(() => getProjects.value.slice(0, 3))

</script>

<template>
  <main>
    <section class="hero-section simple-landing">
      <div class="raes-shell hero-simple">
        <span class="eyebrow"><i class="bi bi-stars me-2"></i>Red abierta de semillas</span>
        <h1>Cultiva, prueba y comparte semillas.</h1>
        <p>
          RAES conecta proyectos de cultivo con personas que quieren participar, aprender y mover semillas entre territorios.
        </p>
        <div class="hero-actions">
          <a href="#projects" class="btn btn-primary btn-lg">Ver proyectos</a>
          <RouterLink :to="{ name: 'how-it-works' }" class="btn btn-outline-primary btn-lg">Cómo funciona</RouterLink>
          <RouterLink :to="{ name: 'project-new' }" class="btn btn-outline-primary btn-lg" v-if="user">Crear proyecto</RouterLink>
        </div>
      </div>
    </section>

    <section class="raes-shell landing-intro">
      <p>
        Puedes unirte a ensayos donde el creador reparte semillas, cada participante cultiva y después se devuelven o comparten semillas resultantes.
      </p>
      <p>
        También hay proyectos de observación: se cultiva siguiendo una pauta común y se comparten datos, fotos y resultados.
      </p>
    </section>

    <section class="raes-shell pillars-panel">
      <div class="pillar-grid">
        <RouterLink :to="{ name: 'how-it-works' }" class="pillar-card glass-panel">
          <i class="bi bi-flower1"></i>
          <h2>Semillas</h2>
          <p>Aporta, recibe y multiplica semillas dentro de proyectos concretos.</p>
        </RouterLink>
        <a href="#projects" class="pillar-card glass-panel">
          <i class="bi bi-clipboard-data"></i>
          <h2>Ensayos</h2>
          <p>Participa en pruebas sencillas con cultivos, observaciones y resultados comparables.</p>
        </a>
        <RouterLink :to="{ name: 'forum-index' }" class="pillar-card glass-panel">
          <i class="bi bi-chat-square-text"></i>
          <h2>Comunidad</h2>
          <p>Pregunta, coordina avances y deja aprendizajes en el foro de cada proyecto.</p>
        </RouterLink>
      </div>
    </section>

    <section class="raes-shell featured-panel" id="featured" v-if="featuredProjects.length > 0">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Proyectos destacados</span>
          <h2>Empieza por aquí</h2>
        </div>
        <a href="#projects" class="btn btn-outline-primary">Ver todos</a>
      </div>
      <div class="featured-grid">
        <RouterLink
          v-for="project in featuredProjects"
          :key="project.id"
          :to="{ name: 'project-detail', params: { id: project.id } }"
          class="featured-card glass-panel"
        >
          <img :src="project.image" :alt="project.title" />
          <div>
            <span class="badge text-bg-light">{{ project.category || 'Proyecto' }}</span>
            <h3>{{ project.title }}</h3>
            <p>{{ project.location || 'Ubicación abierta' }}</p>
            <strong>Ver proyecto <i class="bi bi-arrow-right-short"></i></strong>
          </div>
        </RouterLink>
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

.simple-landing {
  padding: clamp(2rem, 7vw, 5rem) 0 2rem;
}

.hero-simple {
  max-width: 980px;
  text-align: center;
}

.hero-simple h1 {
  margin: 0.7rem auto 1rem;
  font-size: clamp(3rem, 10vw, 7rem);
  line-height: 0.9;
  font-weight: 950;
}

.hero-simple p {
  max-width: 760px;
  margin: 0 auto;
  color: var(--raes-muted);
  font-size: clamp(1.1rem, 2.2vw, 1.35rem);
  line-height: 1.55;
}

.hero-simple .hero-actions {
  justify-content: center;
}

.landing-intro {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding-bottom: 2rem;
}

.landing-intro p {
  margin: 0;
  padding: 1.25rem;
  color: #334137;
  font-size: 1.08rem;
  line-height: 1.65;
  border-left: 4px solid var(--raes-green);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.62);
}

.pillars-panel {
  padding-bottom: 2rem;
}

.pillar-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.pillar-card {
  display: block;
  padding: 1.25rem;
  color: inherit;
  text-decoration: none;
  border-radius: 1.35rem;
}

.pillar-card i {
  color: var(--raes-green-dark);
  font-size: 2rem;
}

.pillar-card h2 {
  margin: 0.65rem 0 0.35rem;
  font-weight: 950;
}

.pillar-card p {
  margin: 0;
  color: var(--raes-muted);
}

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

.how-panel,
.seed-sharing-panel,
.example-flows-panel,
.featured-panel,
.projects-panel {
  padding-bottom: 2rem;
}

.section-heading.centered {
  display: block;
  text-align: center;
  max-width: 620px;
  margin: 0 auto 1rem;
}

.section-heading h2,
.centered h2 {
  margin: 0.15rem 0 0;
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 950;
}

.steps-grid,
.featured-grid,
.example-flow-grid {
  display: grid;
  gap: 1rem;
}

.steps-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.step-card {
  display: block;
  min-height: 100%;
  padding: 1.2rem;
  color: inherit;
  text-decoration: none;
  border-radius: 1.35rem;
}

.step-card span {
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  margin-bottom: 1rem;
  color: #fff;
  font-weight: 950;
  border-radius: 999px;
  background: var(--raes-green-dark);
}

.step-card h3,
.featured-card h3 {
  font-weight: 950;
}

.step-card p,
.featured-card p {
  color: var(--raes-muted);
}

.seed-sharing-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr);
  gap: 1rem;
  align-items: center;
  padding: clamp(1.25rem, 4vw, 2rem);
  border-radius: 1.7rem;
}

.seed-sharing-card h2 {
  max-width: 720px;
  margin: 0.2rem 0 0.8rem;
  font-size: clamp(1.9rem, 4vw, 3.2rem);
  line-height: 1;
  font-weight: 950;
}

.seed-sharing-card p {
  max-width: 780px;
  color: var(--raes-muted);
  font-size: 1.06rem;
  line-height: 1.65;
}

.seed-points {
  display: grid;
  gap: 0.7rem;
}

.seed-points span {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  padding: 0.85rem;
  color: #203528;
  font-weight: 850;
  border: 1px solid rgba(47, 107, 63, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.7);
}

.seed-points i {
  color: var(--raes-green-dark);
  font-size: 1.2rem;
}

.example-flow-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.example-flow-card {
  overflow: hidden;
  padding: clamp(1rem, 3vw, 1.4rem);
  border-radius: 1.7rem;
}

.example-header {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.example-number {
  display: grid;
  place-items: center;
  flex: 0 0 2.5rem;
  height: 2.5rem;
  color: #fff;
  font-weight: 950;
  border-radius: 999px;
  background: var(--raes-green-dark);
}

.example-header h3 {
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 2rem);
  font-weight: 950;
}

.example-header p {
  margin: 0.25rem 0 0;
  color: var(--raes-muted);
}

.flow-diagram {
  position: relative;
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
  min-height: 330px;
  border: 1px solid rgba(47, 107, 63, 0.12);
  border-radius: 1.4rem;
  background:
    radial-gradient(circle at 20% 15%, rgba(183, 211, 107, 0.38), transparent 28%),
    radial-gradient(circle at 85% 80%, rgba(47, 107, 63, 0.16), transparent 30%),
    rgba(255, 255, 255, 0.56);
}

.flow-node {
  display: grid;
  place-items: center;
  align-content: center;
  min-height: 5.5rem;
  padding: 0.75rem;
  text-align: center;
  border: 1px solid rgba(47, 107, 63, 0.16);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 14px 30px rgba(31, 74, 45, 0.08);
}

.flow-node i {
  color: var(--raes-green-dark);
  font-size: 1.55rem;
}

.flow-node strong,
.flow-node small {
  display: block;
}

.flow-node small {
  color: var(--raes-muted);
  font-weight: 750;
}

.seed-cycle-diagram {
  grid-template-columns: minmax(110px, 0.72fr) auto minmax(0, 1.4fr);
  grid-template-rows: auto 1fr auto;
  align-items: center;
}

.creator-node {
  grid-row: 1 / 3;
}

.participant-cluster {
  display: grid;
  grid-column: 3;
  grid-row: 1 / 3;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
}

.mix-node {
  grid-column: 1 / -1;
}

.flow-arrow {
  display: grid;
  place-items: center;
  color: var(--raes-green-dark);
  font-size: 2.2rem;
  font-weight: 950;
}

.arrow-back {
  grid-column: 2;
  grid-row: 3;
}

.study-diagram {
  grid-template-rows: auto 1fr auto;
}

.study-lanes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
}

.study-lanes div {
  display: grid;
  gap: 0.45rem;
  padding: 0.75rem;
  border: 1px dashed rgba(47, 107, 63, 0.28);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.65);
}

.study-lanes span {
  color: var(--raes-green-dark);
  font-weight: 950;
}

.study-lanes strong {
  padding: 0.35rem 0.5rem;
  font-size: 0.82rem;
  border-radius: 999px;
  background: var(--raes-green-soft);
}

.featured-panel {
  scroll-margin-top: 7rem;
}

.featured-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.featured-card {
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  border-radius: 1.5rem;
}

.featured-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.featured-card div {
  padding: 1rem;
}

.featured-card strong {
  color: var(--raes-green-dark);
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

.search-group .form-control {
  min-width: 0;
  width: 100%;
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

  .steps-grid,
  .featured-grid,
  .seed-sharing-card,
  .example-flow-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .seed-cycle-diagram,
  .participant-cluster,
  .study-lanes {
    grid-template-columns: 1fr;
  }

  .creator-node,
  .participant-cluster,
  .mix-node,
  .arrow-back {
    grid-column: auto;
    grid-row: auto;
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

  .steps-grid,
  .featured-grid,
  .seed-sharing-card,
  .example-flow-grid,
  .seed-cycle-diagram,
  .participant-cluster,
  .study-lanes {
    grid-template-columns: 1fr;
  }

  .featured-card img {
    height: 160px;
  }

  .search-panel {
    top: 5rem;
    border-radius: 1rem;
  }

  .search-group {
    display: grid;
    grid-template-columns: 3rem minmax(0, 1fr);
    width: 100%;
  }

  .search-group .input-group-text {
    display: flex;
    justify-content: center;
  }

  .search-group .form-control {
    min-height: 3.15rem;
    border-radius: 0 0.9rem 0.9rem 0 !important;
    font-size: 1rem;
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

  .landing-intro,
  .pillar-grid {
    grid-template-columns: 1fr;
  }
}
</style>
