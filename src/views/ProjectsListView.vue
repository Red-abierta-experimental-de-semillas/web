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
  <main class="container">
    <!-- Barra de búsqueda -->
    <form v-on:submit.prevent class="mb-2 pt-md-5 pt-3">
      <div class="input-group input-group-lg">
        <input
          type="search"
          class="form-control"
          v-model="filters.searchBar"
          placeholder="Buscar proyectos..."
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
          Filtros <i class="bi bi-filter"></i>
        </button>
      </div>
      <!-- Filtros colapsables -->
      <div class="collapse" id="filtersCollapse">
        <div class="card card-body mt-2">
          <div class="row">
            <div class="col-md-6 mb-2">
              <label class="form-label">Categoría</label>
              <select class="form-select" v-model="filters.category">
                <option :value="null">Todas</option>
                <option v-for="cat in PROJECT_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="col-md-6 mb-2">
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
      </div>
    </form>

    <!-- Loading -->
    <div class="text-center mt-3 mt-md-5" v-if="isLoading">
      <div class="spinner-border text-primary mt-5" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <!-- Lista de proyectos -->
    <div class="mt-3 mt-md-5" v-else-if="getProjects.length > 0">
      <p class="text-muted mb-1 d-flex align-items-center flex-wrap gap-2">
        <small>Total: {{ getProjects.length }}</small>
        <RouterLink
          :to="{ name: 'project-new' }"
          class="btn btn-sm btn-primary ms-auto"
          v-if="user"
        >
          <i class="bi-plus-lg"></i>
          Crear proyecto
        </RouterLink>
      </p>
      <div v-for="project in getProjects" :key="project.id">
        <ProjectCard :project="project" />
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else class="text-center mt-5">
      <h5 class="text-muted">No hay proyectos todavía</h5>
      <p class="text-muted">¡Sé el primero en crear un proyecto experimental!</p>
      <RouterLink
        :to="{ name: 'project-new' }"
        class="btn btn-primary mt-2"
        v-if="user"
      >
        <i class="bi-plus-lg me-1"></i>
        Crear proyecto
      </RouterLink>
    </div>
  </main>
</template>
