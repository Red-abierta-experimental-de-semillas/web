<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useToasterStore } from '@/stores/toaster'
import ProjectForm, { type ProjectFormButton } from '@/components/ProjectForm.vue'
import type { CreateProjectDto } from '@/dtos/projects/CreateProjectDto'

const router = useRouter()
const projectStore = useProjectStore()
const toaster = useToasterStore()

const formData = ref({
  title: '',
  description: '',
  image: '',
  category: null as string | null,
  location: null as string | null,
  volunteersNeeded: 0,
  volunteerRequirements: null as string | null,
  tags: [] as string[]
})

const buttons: ProjectFormButton[] = [
  {
    text: 'Cancelar',
    class: 'btn-light',
    action: 'cancel',
    handler: onCancel
  },
  {
    text: 'Crear proyecto',
    class: 'btn-primary',
    action: 'save',
    isSubmit: true,
    handler: onSave
  }
]

function onCancel() {
  router.push({ name: 'projects' })
}

function onSave() {
  const dto: CreateProjectDto = {
    title: formData.value.title,
    description: formData.value.description,
    image: formData.value.image,
    category: formData.value.category,
    location: formData.value.location,
    volunteersNeeded: formData.value.volunteersNeeded,
    volunteerRequirements: formData.value.volunteerRequirements,
    tags: formData.value.tags
  }

  projectStore.create(dto)
    .then((project) => {
      toaster.success({ text: 'Proyecto creado con éxito' })
      router.push({ name: 'project-detail', params: { id: project.id } })
    })
    .catch((reason) => {
      toaster.error({ text: 'Error al crear el proyecto.\n' + reason })
      console.error(reason)
    })
}

function onAction(action: string) {
  const b = buttons.find(b => b.action === action)
  if (b) b.handler()
}

</script>

<template>
  <div class="container pt-5">
    <h1 class="mb-5">Nuevo proyecto</h1>
    <ProjectForm v-model="formData" :buttons="buttons" @action="onAction" />
  </div>
</template>
