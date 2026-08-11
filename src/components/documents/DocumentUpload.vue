<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'

withDefaults(
  defineProps<{
    uploading?: boolean
  }>(),
  { uploading: false }
)

const emit = defineEmits<{ upload: [file: File] }>()

const inputRef = ref<HTMLInputElement | null>(null)

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) emit('upload', file)
  if (inputRef.value) inputRef.value.value = ''
}
</script>

<template>
  <div>
    <input
      ref="inputRef"
      type="file"
      accept=".pdf,.txt,.md,.doc,.docx"
      class="hidden"
      data-testid="file-input"
      @change="onFileChange"
    />
    <BaseButton :loading="uploading" data-testid="upload-btn" @click="inputRef?.click()">
      <UploadCloud class="h-4 w-4" />
      Enviar documento (≤ 20MB)
    </BaseButton>
  </div>
</template>
