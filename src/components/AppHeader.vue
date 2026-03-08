<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import LoginModal from '@/components/modals/LoginModal.vue'
import { useUsersStore } from '@/stores/users'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

const router = useRouter()

const userStore = useUsersStore()
const { user } = storeToRefs(userStore)

const handleSignOut = () => {
  userStore.signOut().then(() => {
    router.push('/')
  }).catch(console.error)
}

// Cierra el menú en móvil al cambiar de ruta
watch(
  () => router.currentRoute.value.path,
  () => {
    const navbarCollapse = document.getElementById('navbarSupportedContent')
    if (navbarCollapse?.classList.contains('show')) {
      const toggler = document.querySelector('.navbar-toggler') as HTMLElement
      if (toggler) toggler.click()
    }
  }
)

</script>

<template>
  <header class="fixed-top shadow-sm d-print-none bg-white">
    <!-- Top Row: Banner -->
    <div class="bg-light py-3 border-bottom">
      <div class="container d-flex align-items-center">
        <RouterLink :to="{ name: 'home' }" class="text-decoration-none text-dark d-flex align-items-center">
          <img class="bi me-3" height="48" src="@/assets/logo.svg"
               alt="Logo de la Red Abierta Experimental de Semillas" />
          <h2 class="mb-0 fw-bold d-none d-sm-block text-dark">Red Abierta Experimental de Semillas</h2>
          <h5 class="mb-0 fw-bold d-block d-sm-none text-dark">Red Abierta Experimental de Semillas</h5>
        </RouterLink>
      </div>
    </div>

    <!-- Bottom Row: Navigation -->
    <nav class="navbar navbar-expand-sm py-2">
      <div class="container">
        <!-- Toggler for mobile -->
        <button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-sm-0">
            <li class="nav-item me-sm-3 text-end">
              <RouterLink :to="{ name: 'home' }" class="nav-link fs-6">Proyectos</RouterLink>
            </li>
            <li class="nav-item me-sm-3 text-end">
              <RouterLink :to="{ name: 'forum-index' }" class="nav-link fs-6">Foros</RouterLink>
            </li>
            <li class="nav-item me-sm-3 text-end">
              <RouterLink :to="{ name: 'what-is-this' }" class="nav-link fs-6">¿Qué es?</RouterLink>
            </li>
          </ul>

          <ul class="navbar-nav ms-auto" v-if="user">
            <!-- Dropdown right-aligned on desktop -->
            <li class="nav-item text-end dropdown">
              <button class="btn btn-sm dropdown-toggle position-relative" data-bs-toggle="dropdown"
                      aria-expanded="false">
                <img :src="user.image" alt="your user profile photo" width="32" height="32" class="rounded-circle">
              </button>
              <ul class="dropdown-menu shadow" style="position: absolute; inset: 0 0 auto auto; transform: translate(0px, 40px)">
                <li>
                  <RouterLink :to="{ name: 'profile' }" class="dropdown-item">
                    <i class="bi bi-person" /> Editar perfil
                  </RouterLink>
                </li>
                <li class="dropdown-divider"></li>
                <li>
                  <button class="dropdown-item" @click="handleSignOut">
                    <i class="bi bi-arrow-bar-right" /> Cerrar sesión
                  </button>
                </li>
              </ul>
            </li>
          </ul>
          
          <ul class="navbar-nav ms-auto" v-else>
            <li class="nav-item text-end">
              <a class="btn btn-outline-dark" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">
                <i class="bi bi-box-arrow-in-right"></i> Iniciar sesión
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <LoginModal></LoginModal>
</template>

<style scoped>
</style>
