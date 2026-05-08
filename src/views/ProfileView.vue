<script setup lang="ts">

import { useUsersStore } from '@/stores/users'
import { storeToRefs } from 'pinia'
import ImageSelectorModal from '@/components/modals/ImageSelectorModal.vue'
import { useToasterStore } from '@/stores/toaster'

const toaster = useToasterStore()
const userStore = useUsersStore()
const { user } = storeToRefs(userStore)

function onImageChanged(image: string) {
  if (user.value) {
    user.value.image = image
  }
}

function ensureEmailNotifications() {
  if (!user.value) return
  if (!user.value.emailNotifications) {
    user.value.emailNotifications = {
      notifyForumPosts: true,
      notifyNewProjects: true,
      notifyProjectUpdates: true
    }
  }
}

function unsubscribeAll() {
  if (!user.value) return
  ensureEmailNotifications()
  user.value.emailNotifications.notifyForumPosts = false
  user.value.emailNotifications.notifyNewProjects = false
  user.value.emailNotifications.notifyProjectUpdates = false
}

function subscribeAll() {
  if (!user.value) return
  ensureEmailNotifications()
  user.value.emailNotifications.notifyForumPosts = true
  user.value.emailNotifications.notifyNewProjects = true
  user.value.emailNotifications.notifyProjectUpdates = true
}

function onSave() {
  ensureEmailNotifications()
  userStore.save().then(() => {
    toaster.success({ text: 'Tu perfil se ha actualizado correctamente' })
  }).catch((reason) => {
    console.log(reason)
    toaster.error({ text: 'Ha ocurrido un error al guardar tu perfil' })
  })
}

</script>

<template>
  <main class="raes-shell profile-page">
    <div class="profile-header">
      <div>
        <span class="eyebrow">Cuenta RAES</span>
        <h1>Editar perfil</h1>
        <p>Actualiza tu identidad pública y cómo quieres recibir avisos por email.</p>
      </div>
      <button class="btn btn-primary" v-if="user" @click="onSave">Guardar cambios</button>
    </div>

    <section class="profile-card card" v-if="user">
      <div class="card-body profile-avatar-grid">
        <img class="img-fluid object-fit-cover img-profile" :src="user.image" alt="Avatar de usuario" />
        <div>
          <span class="eyebrow">Avatar</span>
          <h2>Tu foto de perfil</h2>
          <p class="text-muted">Lo ideal es una foto cuadrada, aunque podrás recortarla durante el proceso.</p>
          <button class="btn btn-outline-secondary"
                  data-bs-toggle="modal"
                  data-bs-target="#profileImageSelectorModal">Cambiar imagen
          </button>
        </div>
      </div>
    </section>

    <section class="profile-card card" v-if="user">
      <div class="card-body">
        <span class="eyebrow">Datos públicos</span>
        <h2>Información personal</h2>
        <div class="row mt-3">
          <div class="col">
            <div class="mb-3">
              <label for="displayNameInput" class="form-label">Nombre público</label>
              <input class="form-control" id="displayNameInput" placeholder="Nombre completo o alias" v-model="user.name">
            </div>
            <div class="mb-3">
              <label for="locationInput" class="form-label">Ubicación</label>
              <input class="form-control" id="locationInput" placeholder="Ciudad, País" v-model="user.location">
            </div>
            <div class="mb-3">
              <label for="experienceInput" class="form-label">Experiencia con plantas y cultivos</label>
              <textarea class="form-control" id="experienceInput" rows="3" placeholder="Cuéntanos sobre tu experiencia..." v-model="user.experience"></textarea>
            </div>
            <div class="mb-3">
              <label for="interestsInput" class="form-label">Intereses principales</label>
              <textarea class="form-control" id="interestsInput" rows="2" placeholder="Agroecología, mejora de tomates, conservación de semillas antiguas..." v-model="user.interests"></textarea>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="profile-card card" v-if="user">
      <div class="card-body">
        <div class="notification-heading">
          <div>
            <span class="eyebrow">Notificaciones</span>
            <h2>Suscripciones por email</h2>
            <p class="text-muted mb-0">Elige qué avisos quieres recibir. Puedes desuscribirte de todo cuando quieras.</p>
          </div>
          <div class="notification-actions">
            <button class="btn btn-sm btn-outline-secondary" @click="subscribeAll">Suscribirme a todo</button>
            <button class="btn btn-sm btn-outline-danger" @click="unsubscribeAll">Desuscribirme de todo</button>
          </div>
        </div>

        <div class="notification-list" v-if="user.emailNotifications">
          <label class="notification-item">
            <input class="form-check-input" type="checkbox" v-model="user.emailNotifications.notifyForumPosts">
            <span>
              <strong>Mensajes nuevos en foros de mis proyectos</strong>
              <small>Recibe un email cuando alguien escriba en el foro de un proyecto del que eres miembro.</small>
            </span>
          </label>
          <label class="notification-item">
            <input class="form-check-input" type="checkbox" v-model="user.emailNotifications.notifyProjectUpdates">
            <span>
              <strong>Ediciones en proyectos de los que soy miembro</strong>
              <small>Avisos cuando se actualice la información de un proyecto en el que participas.</small>
            </span>
          </label>
          <label class="notification-item">
            <input class="form-check-input" type="checkbox" v-model="user.emailNotifications.notifyNewProjects">
            <span>
              <strong>Proyectos nuevos en RAES</strong>
              <small>Un aviso cuando se publique un proyecto nuevo en la red.</small>
            </span>
          </label>
        </div>
      </div>
    </section>

    <ImageSelectorModal id="profileImageSelectorModal" @finished="onImageChanged" />
  </main>
</template>

<style scoped>
.profile-page {
  padding-bottom: 3rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1.25rem;
}

.eyebrow {
  display: inline-flex;
  color: var(--raes-green-dark);
  font-size: 0.78rem;
  font-weight: 950;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.profile-header h1 {
  margin: 0.35rem 0;
  font-size: clamp(2.2rem, 6vw, 4rem);
  font-weight: 950;
  line-height: 0.95;
}

.profile-header p {
  color: var(--raes-muted);
  margin: 0;
}

.profile-card {
  margin-bottom: 1rem;
  border-radius: 1.6rem;
}

.profile-card .card-body {
  padding: clamp(1.1rem, 3vw, 1.6rem);
}

.profile-avatar-grid {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 1.2rem;
  align-items: center;
}

.img-profile {
  width: 160px;
  height: 160px;
  border-radius: 1.4rem;
  box-shadow: 0 18px 42px rgba(31, 74, 45, 0.14);
}

.notification-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
  margin-bottom: 1rem;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.notification-list {
  display: grid;
  gap: 0.7rem;
}

.notification-item {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid rgba(47, 107, 63, 0.12);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.62);
  cursor: pointer;
}

.notification-item input {
  margin-top: 0.25rem;
  flex: 0 0 auto;
}

.notification-item strong,
.notification-item small {
  display: block;
}

.notification-item small {
  color: var(--raes-muted);
  margin-top: 0.2rem;
}

@media (max-width: 767.98px) {
  .profile-header,
  .notification-heading,
  .profile-avatar-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .profile-header .btn,
  .notification-actions,
  .notification-actions .btn {
    width: 100%;
  }

  .img-profile {
    width: 120px;
    height: 120px;
  }
}
</style>
