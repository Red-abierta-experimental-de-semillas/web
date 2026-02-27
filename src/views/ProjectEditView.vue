<script setup lang="ts">
import ProjectForm, { type ProjectFormButton } from '@/components/ProjectForm.vue'
import { useProjectStore } from '@/stores/project'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type Project, type ProjectStatus } from '@/model/Project'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'
import { useToasterStore } from '@/stores/toaster'
import type { UpdateProjectDto } from '@/dtos/projects/UpdateProjectDto'

const route = useRoute()
const router = useRouter()

const toaster = useToasterStore()
const projectStore = useProjectStore()

const formData = ref<{
  title: string
  description: string
  image: string
  category: string | null
  location: string | null
  volunteersNeeded: number
  volunteerRequirements: string | null
  status: ProjectStatus
  tags: string[]
} | null>(null)

let originalProject: Project | null = null

watch(
  (): Project[] => projectStore.projects,
  (projectsResult) => {
    originalProject = projectsResult.find((p: Project) => p.id === route.params.id) || null
    if (originalProject) {
      formData.value = {
        title: originalProject.title,
        description: originalProject.description,
        image: originalProject.image,
        category: originalProject.category,
        location: originalProject.location,
        volunteersNeeded: originalProject.volunteersNeeded,
        volunteerRequirements: originalProject.volunteerRequirements,
        status: originalProject.status,
        tags: [...(originalProject.tags || [])]
      }
    }
  },
  { immediate: true }
)

const buttons: ProjectFormButton[] = [
  {
    text: 'Guardar',
    class: 'btn-primary',
    action: 'save',
    isSubmit: true,
    handler: onSave
  },
  {
    text: 'Cancelar',
    class: 'btn-light',
    action: 'cancel',
    handler: onCancel
  }
]

function onDeleteConfirmed() {
  const id = route.params.id as string
  projectStore.delete(id)
    .then(() => {
      toaster.success({ text: 'Proyecto eliminado con éxito.' })
      router.push({ name: 'projects' })
    })
    .catch((reason) => {
      console.error(reason)
      toaster.error({ text: 'Error al eliminar el proyecto.' })
    })
}

function onSave() {
  if (!formData.value) return
  const id = route.params.id as string

  const dto: UpdateProjectDto = {
    title: formData.value.title,
    description: formData.value.description,
    image: formData.value.image,
    category: formData.value.category,
    location: formData.value.location,
    volunteersNeeded: formData.value.volunteersNeeded,
    volunteerRequirements: formData.value.volunteerRequirements,
    status: formData.value.status,
    tags: formData.value.tags
  }

  projectStore.update(id, dto)
    .then(() => {
      toaster.success({ text: 'Proyecto actualizado' })
      router.push({ name: 'project-detail', params: { id } })
    })
    .catch(console.error)
}

function onCancel() {
  router.push({ name: 'project-detail', params: { id: route.params.id } })
}

function onAction(action: string) {
  const b = buttons.find(b => b.action === action)
  if (b) b.handler()
}

</script>

<template>
  <div class="container pt-5">
    <h1 class="mb-5">Editar proyecto</h1>
    <button class="btn btn-danger float-end" data-bs-toggle="modal" data-bs-target="#deleteProjectModal">
      <i class="bi-trash" /> Eliminar
    </button>

    <ProjectForm v-if="formData" v-model="formData" :buttons="buttons" @action="onAction" />

    <ConfirmationModal :id="'deleteProjectModal'" @confirmed="onDeleteConfirmed"></ConfirmationModal>
  </div>
</template>
