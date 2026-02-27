<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import LoginModal from '@/components/modals/LoginModal.vue'
import { useUsersStore } from '@/stores/users'
import { storeToRefs } from 'pinia'

const router = useRouter()

const userStore = useUsersStore()
const { user } = storeToRefs(userStore)

const handleSignOut = () => {
  userStore.signOut().then(() => {
    router.push('/')
  }).catch(console.error)
}

</script>

<template>
  <header class="navbar fixed-top navbar-expand-lg bg-body-tertiary d-print-none">
    <div class="container">
      <RouterLink :to="{ name: 'home' }" class="navbar-brand">
        <img class="bi me-2" height="32" src="@/assets/logo.svg"
             alt="Logo de la Red Abierta Experimental de Semillas" />
        <b class="navbar-brand-text">RAES</b>
      </RouterLink>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto" v-if="user">
          <li class="nav-item me-lg-3 text-end">
            <RouterLink :to="{ name: 'home' }" class="nav-link">Proyectos</RouterLink>
          </li>
          <li class="nav-item me-lg-3 text-end">
            <RouterLink :to="{ name: 'forum-general' }" class="nav-link">Foro General</RouterLink>
          </li>
          <li class="nav-item me-lg-3 text-end">
            <RouterLink :to="{ name: 'what-is-this' }" class="nav-link">¿Qué es?</RouterLink>
          </li>
          <li class="nav-item text-end dropdown">
            <button class="btn btn-sm dropdown-toggle position-relative" data-bs-toggle="dropdown"
                    aria-expanded="false">
              <img :src="user.image" alt="your user profile photo" width="32" height="32" class="rounded-circle">
            </button>
            <ul class="dropdown-menu"
                style="position: absolute; inset: 0 0 auto auto; transform: translate(0px, 40px)">
              <li>
                <RouterLink
                  :to="{ name: 'profile' }"
                  class="dropdown-item">
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
          <li class="nav-item me-lg-2 text-end">
            <RouterLink :to="{ name: 'home' }" class="nav-link">Proyectos</RouterLink>
          </li>
          <li class="nav-item me-lg-2 text-end">
            <RouterLink :to="{ name: 'forum-general' }" class="nav-link">Foro General</RouterLink>
          </li>
          <li class="nav-item me-lg-2 text-end">
            <RouterLink :to="{ name: 'what-is-this' }" class="nav-link">¿Qué es?</RouterLink>
          </li>
          <li>
            <a class="nav-link btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#loginModal"><i
              class="bi bi-arrow-bar-right"></i> Iniciar sesión</a>
          </li>
        </ul>
      </div>
    </div>
  </header>

  <LoginModal></LoginModal>
</template>

<style scoped>
@media (max-width: 768px) {
  .navbar-brand-text {
    display: none;
  }
}
</style>
