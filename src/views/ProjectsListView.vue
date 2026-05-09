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

const selectedProjects = computed(() =>
  getProjects.value
    .filter(project => project.title?.trim().length > 8 && project.description?.trim().length > 20)
    .slice(0, 5)
)
</script>

<template>
  <main>
    <section class="landing-hero">
      <div class="raes-shell hero-layout">
        <div class="hero-copy">
          <span class="eyebrow">Red Abierta Experimental de Semillas</span>
          <h1>Cultivar juntas poblaciones diversas.</h1>
          <p>
            Una comunidad para crear proyectos de cultivo, experimentar en muchos huertos a la vez y compartir semillas
            adaptadas a cada territorio.
          </p>
          <div class="hero-actions">
            <a href="#projects" class="btn btn-primary">Apuntarme a un proyecto</a>
            <RouterLink :to="{ name: 'project-new' }" class="btn btn-outline-primary" v-if="user">Crear proyecto</RouterLink>
            <a v-else class="btn btn-outline-primary" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Crear proyecto</a>
            <RouterLink :to="{ name: 'forum-index' }" class="btn btn-link community-link">Ir a los foros</RouterLink>
          </div>
        </div>
        <figure class="hero-image">
          <img src="@/assets/landing-vegetables.jpg" alt="Variedades coloridas de hortalizas y semillas" />
        </figure>
      </div>
    </section>

    <section class="raes-shell mission-section">
      <p>
        La misión es facilitar proyectos colectivos para recuperar variedades, crear nuevas poblaciones diversas y
        aprender qué cultivos funcionan mejor en cada clima, suelo y forma de cultivar.
      </p>
    </section>

    <section class="raes-shell section-links">
      <RouterLink :to="{ name: 'what-is-this' }" class="section-card">
        <img src="@/assets/landing-corn.jpg" alt="" />
        <h2>Entiende la red</h2>
        <p>Qué es, por qué importa la diversidad genética y cómo se coordinan los proyectos.</p>
      </RouterLink>
      <a href="#projects" class="section-card">
        <img src="@/assets/landing-beans.jpg" alt="" />
        <h2>Participa cultivando</h2>
        <p>Únete a ensayos, recibe o aporta semillas, cultiva y comparte resultados.</p>
      </a>
      <RouterLink :to="{ name: 'get-involved' }" class="section-card">
        <img src="@/assets/landing-flowers.jpg" alt="" />
        <h2>Involúcrate</h2>
        <p>Crea proyectos, propón ideas, ayuda en foros o escribe para colaborar.</p>
      </RouterLink>
    </section>

    <section class="raes-shell examples-section">
      <div class="section-heading compact-heading">
        <div>
          <span class="eyebrow">Ejemplos</span>
          <h2>Dos formas sencillas de colaborar</h2>
        </div>
      </div>
      <div class="example-grid">
        <article class="example-card">
          <div class="example-graphic seed-loop" aria-label="Ciclo de semillas">
            <span>Creadora</span><i class="bi bi-arrow-right"></i><span>Huertos</span><i class="bi bi-arrow-repeat"></i><span>Semillas mezcladas</span>
          </div>
          <h3>Multiplicar semillas</h3>
          <p>Alguien reparte semillas, varias personas cultivan, se selecciona y la cosecha vuelve a circular.</p>
        </article>
        <article class="example-card">
          <div class="example-graphic data-loop" aria-label="Ensayo con datos">
            <span>Método</span><i class="bi bi-bar-chart-line"></i><span>Mediciones</span><i class="bi bi-chat-dots"></i><span>Resultados</span>
          </div>
          <h3>Aprender con ensayos</h3>
          <p>El proyecto propone una pauta común y cada participante devuelve datos, fotos y observaciones.</p>
        </article>
      </div>
    </section>

    <section class="raes-shell selected-projects" v-if="selectedProjects.length > 0">
      <div class="section-heading compact-heading">
        <div>
          <span class="eyebrow">Proyectos</span>
          <h2>Una selección para empezar</h2>
        </div>
        <a href="#projects" class="btn btn-outline-primary btn-sm">Ver catálogo</a>
      </div>
      <div class="project-strip">
        <RouterLink
          v-for="project in selectedProjects"
          :key="project.id"
          :to="{ name: 'project-detail', params: { id: project.id } }"
          class="strip-card"
        >
          <img :src="project.image" :alt="project.title" />
          <div>
            <span>{{ project.category || 'Proyecto' }}</span>
            <h3>{{ project.title }}</h3>
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="raes-shell community-cta">
      <div>
        <h2>La comunidad está en los foros.</h2>
        <p>Pregunta, enseña tus avances, busca gente para un proyecto o comparte semillas y aprendizajes.</p>
      </div>
      <RouterLink :to="{ name: 'forum-index' }" class="btn btn-primary">Entrar en los foros</RouterLink>
    </section>

    <section class="raes-shell projects-panel" id="projects">
      <form v-on:submit.prevent class="search-panel glass-panel">
        <div class="input-group search-group">
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
            <span class="eyebrow">Catálogo</span>
            <h2>Proyectos abiertos</h2>
          </div>
          <div class="list-actions">
            <span class="counter-pill">{{ getProjects.length }} resultados</span>
            <RouterLink :to="{ name: 'project-new' }" class="btn btn-primary" v-if="user">
              <i class="bi-plus-lg me-1"></i> Crear proyecto
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
        <RouterLink :to="{ name: 'project-new' }" class="btn btn-primary mt-2" v-if="user">
          <i class="bi-plus-lg me-1"></i> Crear proyecto
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.landing-hero {
  padding: 1.4rem 0 1.8rem;
}

.hero-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(280px, 1.1fr);
  gap: clamp(1.25rem, 4vw, 3rem);
  align-items: center;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  color: var(--raes-green-dark);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.hero-copy h1 {
  max-width: 650px;
  margin: 0.65rem 0 0.85rem;
  font-size: clamp(1.9rem, 4.4vw, 3.25rem);
  line-height: 0.98;
  font-weight: 900;
}

.hero-copy p,
.mission-section p {
  color: var(--raes-muted);
  font-size: clamp(0.98rem, 1.6vw, 1.13rem);
  line-height: 1.62;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
  margin-top: 1.25rem;
}

.community-link {
  color: var(--raes-green-dark);
  font-weight: 850;
  text-decoration: none;
}

.hero-image {
  margin: 0;
  overflow: hidden;
  border-radius: 1.2rem;
  box-shadow: 0 24px 70px rgba(31, 74, 45, 0.16);
}

.hero-image img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.mission-section {
  padding: 0.5rem 0 1.6rem;
}

.mission-section p {
  max-width: 900px;
  margin: 0 auto;
  color: #2d3f32;
  text-align: center;
}

.section-links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  padding-bottom: 2rem;
}

.section-card {
  display: block;
  padding: 1rem;
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  border: 1px solid rgba(47, 107, 63, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.58);
}

.section-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  margin: -1rem -1rem 0.85rem;
  width: calc(100% + 2rem);
}

.section-card h2,
.example-card h3,
.community-cta h2 {
  margin: 0 0 0.35rem;
  font-size: 1.15rem;
  font-weight: 900;
}

.section-card p,
.example-card p,
.community-cta p {
  margin: 0;
  color: var(--raes-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

.examples-section,
.selected-projects,
.projects-panel {
  padding-bottom: 2rem;
}

.compact-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
  margin-bottom: 0.9rem;
}

.compact-heading h2,
.list-heading h2 {
  margin: 0.15rem 0 0;
  font-size: clamp(1.35rem, 3vw, 2rem);
  font-weight: 900;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.example-card {
  padding: 1rem;
  border: 1px solid rgba(47, 107, 63, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.56);
}

.example-graphic {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.85rem;
  padding: 0.8rem;
  border-radius: 0.9rem;
  background: var(--raes-green-soft);
}

.example-graphic span {
  padding: 0.55rem;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 850;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.78);
}

.example-graphic i {
  color: var(--raes-green-dark);
}

.project-strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(220px, 280px);
  gap: 0.9rem;
  overflow-x: auto;
  padding-bottom: 0.4rem;
}

.strip-card {
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  border: 1px solid rgba(47, 107, 63, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.66);
}

.strip-card img {
  width: 100%;
  height: 145px;
  object-fit: cover;
}

.strip-card div {
  padding: 0.85rem;
}

.strip-card span {
  color: var(--raes-green-dark);
  font-size: 0.78rem;
  font-weight: 850;
}

.strip-card h3 {
  margin: 0.2rem 0 0;
  font-size: 1rem;
  font-weight: 900;
  line-height: 1.25;
}

.community-cta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: #203528;
  color: white;
}

.community-cta p { color: rgba(255, 255, 255, 0.78); }

.search-panel {
  padding: 0.9rem;
  border-radius: 1rem;
}

.search-panel .form-control,
.search-panel .input-group-text,
.search-panel .btn {
  font-size: 0.95rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.loading-state { padding: 2rem; }

.list-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
  margin: 1.6rem 0 1rem;
}

.list-actions {
  display: flex;
  gap: 0.65rem;
  align-items: center;
}

.counter-pill {
  padding: 0.55rem 0.75rem;
  color: var(--raes-green-dark);
  font-size: 0.88rem;
  font-weight: 850;
  border-radius: 999px;
  background: rgba(232, 243, 220, 0.9);
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  border-radius: 1.5rem;
}

.empty-state i {
  color: var(--raes-green);
  font-size: 2.6rem;
}

.empty-state p { color: var(--raes-muted); }

@media (max-width: 1000px) {
  .hero-layout,
  .project-grid {
    grid-template-columns: 1fr;
  }

  .section-links {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .landing-hero { padding-top: 0.8rem; }

  .hero-layout,
  .section-links,
  .example-grid,
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy h1 { font-size: clamp(1.75rem, 7.4vw, 2.2rem); }

  .hero-actions,
  .community-cta,
  .list-heading,
  .compact-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions .btn,
  .community-cta .btn {
    width: 100%;
  }

  .example-graphic {
    grid-template-columns: 1fr;
  }

  .example-graphic i {
    transform: rotate(90deg);
    justify-self: center;
  }

  .list-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .counter-pill { text-align: center; }
}
</style>
