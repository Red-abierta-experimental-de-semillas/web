<script setup lang="ts">
import ImageSelector from '@/components/ImageSelector.vue'

const props = defineProps<{
  id: string
}>()

const emit = defineEmits(['finished'])

function onFinished(imageStr: string) {
  emit('finished', imageStr)
  // Cerrar el modal mediante el botón de cierre al terminar de recortar
  const closeBtn = document.getElementById(`${props.id}CloseBtn`);
  if (closeBtn) {
    closeBtn.click();
  }
}
</script>

<template>
  <div class="modal fade" :id="props.id" tabindex="-1" :aria-labelledby="`${props.id}Label`" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" :id="`${props.id}Label`">Seleccionar imagen</h1>
          <button :id="`${props.id}CloseBtn`" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <ImageSelector @finished="onFinished" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
