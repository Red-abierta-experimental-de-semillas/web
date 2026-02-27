<script setup lang="ts">

import { ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import type { User } from '@/model/User'

const route = useRoute()

const usersStore = useUsersStore()

const user: Ref<User | null> = ref(null)
usersStore.getUserById(route.params.id as string).then((value) => user.value = value)

</script>

<template>
  <div class="container" v-if="user">
    <div class="row pt-5">
      <div class="col-md-3">
        <img v-bind:src="user.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'" class="img-fluid user-img rounded" alt="..." />
      </div>
      <div class="col-md-9">
        <h1 class="mt-3 mt-md-0">{{ user.name }}</h1>
        <p class="text-muted mb-2"><i class="bi bi-person-badge me-2"></i> Miembro de la red</p>
        <p class="text-muted mb-4" v-if="user.location">
          <i class="bi bi-geo-alt me-2"></i> {{ user.location }}
        </p>

        <div v-if="user.experience" class="mb-4">
          <h5 class="fw-bold">Experiencia</h5>
          <p style="white-space: pre-line">{{ user.experience }}</p>
        </div>

        <div v-if="user.interests" class="mb-4">
          <h5 class="fw-bold">Intereses</h5>
          <p style="white-space: pre-line">{{ user.interests }}</p>
        </div>
        
        <div v-if="!user.experience && !user.interests && !user.location" class="mb-4 text-muted fst-italic">
          Este usuario aún no ha completado la información de su perfil.
        </div>

        <div v-if="user.email" class="mb-4 mt-5">
          <h5 class="fw-bold border-bottom pb-2">Contacto</h5>
          <p><a :href="'mailto:' + user.email" class="btn btn-outline-primary"><i class="bi bi-envelope me-2"></i> Enviar email</a></p>
        </div>
      </div>
    </div>
  </div>
  <div class="container text-center mt-5 py-5 text-muted" v-else>
    <div class="spinner-border mb-3" role="status"></div>
    <h4>Cargando perfil...</h4>
  </div>
</template>

<style scoped>
.user-img {
  width: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .user-img {
    width: 100%;
    height: 30vh;
    object-fit: cover;
  }
}
</style>