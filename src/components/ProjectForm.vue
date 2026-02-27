<script setup lang="ts">
import { ref } from 'vue'
import ImageSelector from '@/components/ImageSelector.vue'
import { PROJECT_CATEGORIES, PROJECT_STATUS_LABELS, type ProjectStatus } from '@/model/Project'

export type ProjectFormButton = {
  text: string
  class: string
  action: string
  isSubmit?: boolean
  handler: () => void
}

interface Props {
  modelValue: {
    title: string
    description: string
    image: string
    category: string | null
    location: string | null
    volunteersNeeded: number
    volunteerRequirements: string | null
    status?: ProjectStatus
    tags: string[]
  }
  buttons: ProjectFormButton[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'action'])

const newTag = ref('')

function addTag() {
  if (newTag.value.trim() && !props.modelValue.tags.includes(newTag.value.trim())) {
    const updated = { ...props.modelValue, tags: [...props.modelValue.tags, newTag.value.trim()] }
    emit('update:modelValue', updated)
    newTag.value = ''
  }
}

function removeTag(tag: string) {
  const updated = { ...props.modelValue, tags: props.modelValue.tags.filter(t => t !== tag) }
  emit('update:modelValue', updated)
}

function updateField(field: string, value: unknown) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function handleAction(action: string) {
  emit('action', action)
}

</script>

<template>
  <form @submit.prevent>
    <!-- Título -->
    <div class="mb-3">
      <label for="projectTitle" class="form-label">Título del proyecto *</label>
      <input
        type="text"
        class="form-control"
        id="projectTitle"
        :value="modelValue.title"
        @input="updateField('title', ($event.target as HTMLInputElement).value)"
        required
        placeholder="Ej: Mejora de tomates resistentes a la sequía"
      />
    </div>

    <!-- Descripción -->
    <div class="mb-3">
      <label for="projectDescription" class="form-label">Descripción / Introducción *</label>
      <textarea
        class="form-control"
        id="projectDescription"
        rows="6"
        :value="modelValue.description"
        @input="updateField('description', ($event.target as HTMLTextAreaElement).value)"
        required
        placeholder="Describe el objetivo del proyecto, la metodología y los resultados esperados..."
      ></textarea>
    </div>

    <!-- Imagen -->
    <div class="mb-3">
      <label class="form-label">Imagen de portada</label>
      <div v-if="modelValue.image" class="mb-2">
        <img :src="modelValue.image" class="img-thumbnail" style="max-height: 200px" alt="Preview" />
      </div>
      <ImageSelector @finished="updateField('image', $event)" />
    </div>

    <!-- Categoría -->
    <div class="mb-3">
      <label for="projectCategory" class="form-label">Categoría</label>
      <select
        class="form-select"
        id="projectCategory"
        :value="modelValue.category || ''"
        @change="updateField('category', ($event.target as HTMLSelectElement).value || null)"
      >
        <option value="">Seleccionar categoría...</option>
        <option v-for="cat in PROJECT_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <!-- Ubicación -->
    <div class="mb-3">
      <label for="projectLocation" class="form-label">Ubicación</label>
      <input
        type="text"
        class="form-control"
        id="projectLocation"
        :value="modelValue.location || ''"
        @input="updateField('location', ($event.target as HTMLInputElement).value || null)"
        placeholder="Ej: Madrid, España"
      />
    </div>

    <!-- Voluntarios necesarios -->
    <div class="mb-3">
      <label for="projectVolunteers" class="form-label">Número de voluntarios necesarios</label>
      <input
        type="number"
        class="form-control"
        id="projectVolunteers"
        min="0"
        :value="modelValue.volunteersNeeded"
        @input="updateField('volunteersNeeded', parseInt(($event.target as HTMLInputElement).value) || 0)"
        placeholder="0 = sin límite"
      />
      <div class="form-text">Introduce 0 si no hay límite de voluntarios.</div>
    </div>

    <!-- Requisitos para voluntarios -->
    <div class="mb-3">
      <label for="projectRequirements" class="form-label">¿Qué se les pide a los voluntarios?</label>
      <textarea
        class="form-control"
        id="projectRequirements"
        rows="3"
        :value="modelValue.volunteerRequirements || ''"
        @input="updateField('volunteerRequirements', ($event.target as HTMLTextAreaElement).value || null)"
        placeholder="Ej: Disponer de un huerto de al menos 10m², experiencia previa en cultivo de tomates..."
      ></textarea>
    </div>

    <!-- Estado (Solo al editar un proyecto) -->
    <div class="mb-3" v-if="modelValue.status">
      <label for="projectStatus" class="form-label">Estado del proyecto</label>
      <select
        class="form-select"
        id="projectStatus"
        :value="modelValue.status"
        @change="updateField('status', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="(label, value) in PROJECT_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
      </select>
    </div>

    <!-- Tags -->
    <div class="mb-4">
      <label class="form-label">Etiquetas</label>
      <div class="input-group mb-2">
        <input
          type="text"
          class="form-control"
          v-model="newTag"
          @keyup.enter="addTag"
          placeholder="Añadir etiqueta..."
        />
        <button class="btn btn-outline-secondary" type="button" @click="addTag">
          <i class="bi bi-plus"></i>
        </button>
      </div>
      <div>
        <span
          class="badge text-bg-primary me-1 mb-1"
          v-for="tag in modelValue.tags"
          :key="tag"
          style="cursor: pointer"
          @click="removeTag(tag)"
        >
          {{ tag }} <i class="bi bi-x"></i>
        </span>
      </div>
    </div>

    <!-- Botones -->
    <div class="d-flex gap-2 flex-wrap">
      <button
        v-for="button in buttons"
        :key="button.action"
        :type="button.isSubmit ? 'submit' : 'button'"
        :class="'btn ' + button.class"
        @click="handleAction(button.action)"
      >
        {{ button.text }}
      </button>
    </div>
  </form>
</template>
