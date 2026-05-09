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
  <header class="fixed-top d-print-none raes-header">
    <nav class="navbar navbar-expand-md">
      <div class="container raes-nav-shell">
        <button class="navbar-toggler mobile-menu-toggle" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Abrir navegación">
          <span class="navbar-toggler-icon"></span>
        </button>

        <RouterLink :to="{ name: 'home' }" class="navbar-brand d-flex align-items-center gap-3 me-3">
          <span class="brand-mark">
            <img src="@/assets/logo.svg" alt="Logo de la Red Abierta Experimental de Semillas" />
          </span>
          <span class="brand-copy">
            <strong class="brand-title">Red Abierta Experimental</strong>
            <small>de Semillas</small>
          </span>
        </RouterLink>

        <div class="mobile-auth-slot">
          <button v-if="user" class="btn user-chip mobile-user-button" data-bs-toggle="dropdown" aria-expanded="false">
            <img :src="user.image" alt="Foto de perfil" width="34" height="34" class="rounded-circle">
          </button>
          <ul v-if="user" class="dropdown-menu dropdown-menu-end shadow">
            <li><RouterLink :to="{ name: 'profile' }" class="dropdown-item"><i class="bi bi-person me-2" />Editar perfil</RouterLink></li>
            <li><hr class="dropdown-divider"></li>
            <li><button class="dropdown-item" @click="handleSignOut"><i class="bi bi-arrow-bar-right me-2" />Cerrar sesión</button></li>
          </ul>
          <a v-else class="btn btn-outline-dark login-button mobile-login-button" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">
            <i class="bi bi-box-arrow-in-right"></i><span>Entrar</span>
          </a>
        </div>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mx-md-auto my-3 my-md-0 nav-pills-soft">
            <li class="nav-item">
              <RouterLink :to="{ name: 'home' }" class="nav-link">Proyectos</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink :to="{ name: 'forum-index' }" class="nav-link">Foros</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink :to="{ name: 'what-is-this' }" class="nav-link">¿Qué es?</RouterLink>
            </li>
          </ul>

          <ul class="navbar-nav ms-md-auto" v-if="user">
            <li class="nav-item dropdown">
              <button class="btn user-chip dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown"
                      aria-expanded="false">
                <img :src="user.image" alt="Foto de perfil" width="34" height="34" class="rounded-circle">
                <span class="d-md-none d-lg-inline">Mi cuenta</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <RouterLink :to="{ name: 'profile' }" class="dropdown-item">
                    <i class="bi bi-person me-2" />Editar perfil
                  </RouterLink>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button class="dropdown-item" @click="handleSignOut">
                    <i class="bi bi-arrow-bar-right me-2" />Cerrar sesión
                  </button>
                </li>
              </ul>
            </li>
          </ul>

          <ul class="navbar-nav ms-md-auto" v-else>
            <li class="nav-item">
              <a class="btn btn-outline-dark login-button" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">
                <i class="bi bi-box-arrow-in-right me-1"></i> Iniciar sesión
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
.raes-header {
  padding: 0.75rem 0;
  background: linear-gradient(180deg, rgba(255, 250, 240, 0.9), rgba(255, 250, 240, 0.64));
  border-bottom: 1px solid rgba(47, 107, 63, 0.12);
  backdrop-filter: blur(18px);
}

.raes-nav-shell {
  min-height: 4.35rem;
}

.mobile-auth-slot {
  display: none;
}

.navbar-brand {
  color: var(--raes-ink);
  min-width: 0;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.25rem;
  background: linear-gradient(145deg, #ffffff, var(--raes-green-soft));
  box-shadow: 0 14px 36px rgba(47, 107, 63, 0.15);
}

.brand-mark img {
  width: 2.35rem;
  height: 2.35rem;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.02;
}

.brand-title {
  font-size: clamp(1.05rem, 2vw, 1.42rem);
}

.brand-copy small {
  color: var(--raes-muted);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav-pills-soft {
  gap: 0.25rem;
  padding: 0.35rem;
  border: 1px solid rgba(47, 107, 63, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.52);
}

.nav-link {
  color: var(--raes-muted);
  border-radius: 999px;
  padding: 0.55rem 0.95rem !important;
  font-weight: 800;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--raes-green-dark) !important;
  background: rgba(232, 243, 220, 0.95);
}

.user-chip,
.login-button {
  min-height: 2.7rem;
}

.user-chip img {
  object-fit: cover;
  border: 2px solid rgba(47, 107, 63, 0.22);
}

.navbar-toggler {
  border: 0;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0.9rem;
}

@media (max-width: 767.98px) {
  .raes-header {
    padding: 0.35rem 0;
  }

  .navbar .raes-nav-shell {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.55rem;
    min-height: 3.75rem;
    align-items: center;
  }

  .mobile-menu-toggle {
    display: inline-flex;
    grid-column: 1;
    grid-row: 1;
  }

  .navbar-brand {
    grid-column: 2;
    grid-row: 1;
    justify-content: center;
    margin: 0 !important;
  }

  .mobile-auth-slot {
    display: flex;
    grid-column: 3;
    grid-row: 1;
    justify-content: end;
    position: relative;
  }

  .navbar-collapse {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .navbar-collapse > .navbar-nav.ms-md-auto {
    display: none;
  }

  .brand-mark {
    width: 2.65rem;
    height: 2.65rem;
    border-radius: 0.9rem;
  }

  .brand-mark img {
    width: 2rem;
    height: 2rem;
  }

  .brand-title {
    font-size: 0.95rem;
  }

  .brand-copy small {
    font-size: 0.68rem;
  }

  .nav-pills-soft {
    align-items: stretch;
    border-radius: 1.1rem;
  }

  .nav-link {
    width: 100%;
    text-align: center;
    justify-content: center;
  }

  .mobile-login-button {
    min-height: 2.4rem;
    padding: 0.35rem 0.65rem;
    font-size: 0.86rem;
    border-radius: 0.8rem;
  }

  .mobile-user-button {
    min-height: 2.4rem;
    padding: 0.15rem;
  }
}
</style>
