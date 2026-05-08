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
        <RouterLink :to="{ name: 'home' }" class="navbar-brand d-flex align-items-center gap-3 me-3">
          <span class="brand-mark">
            <img src="@/assets/logo.svg" alt="Logo de la Red Abierta Experimental de Semillas" />
          </span>
          <span class="brand-copy">
            <strong class="brand-title">Red Abierta Experimental</strong>
            <small>de Semillas</small>
          </span>
        </RouterLink>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Abrir navegación">
          <span class="navbar-toggler-icon"></span>
        </button>

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

  .raes-nav-shell {
    min-height: 4.25rem;
  }

  .brand-mark {
    width: 3rem;
    height: 3rem;
    border-radius: 1rem;
  }

  .brand-copy small {
    font-size: 0.68rem;
  }

  .nav-pills-soft {
    align-items: stretch;
    border-radius: 1.1rem;
  }

  .nav-link,
  .login-button,
  .user-chip {
    width: 100%;
    text-align: center;
    justify-content: center;
  }
}
</style>
