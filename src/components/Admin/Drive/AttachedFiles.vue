<template>
<div class="attached-files">
    <div class="attached-header">
        <h3>Archivos adjuntos</h3>
        <el-button icon="Files" @click="openPicker">Adjuntar del drive</el-button>
    </div>

    <p v-if="!modelValue.length" class="attached-empty">Aún no hay archivos adjuntos.</p>
    <ul v-else class="attached-list">
        <li v-for="(file, index) in modelValue" :key="file.id" class="attached-item">
            <img v-if="file.kind === 'image'" :src="file.url" :alt="file.original_name" class="attached-thumb" />
            <el-icon v-else :size="28" class="attached-icon"><component :is="kindIcon(file.kind)" /></el-icon>
            <span class="attached-name" :title="file.original_name">{{ file.original_name }}</span>
            <span class="attached-size">{{ formatBytes(file.size) }}</span>
            <el-button-group>
                <el-button icon="ArrowUp" size="small" :disabled="index === 0" :aria-label="`Subir ${file.original_name}`" @click="move(index, -1)" />
                <el-button icon="ArrowDown" size="small" :disabled="index === modelValue.length - 1" :aria-label="`Bajar ${file.original_name}`" @click="move(index, 1)" />
                <el-button icon="Close" size="small" :aria-label="`Quitar ${file.original_name}`" @click="remove(index)" />
            </el-button-group>
        </li>
    </ul>

    <el-dialog v-model="pickerVisible" title="Adjuntar del drive" :width="isMobile ? '95%' : '70%'" destroy-on-close>
        <DriveBrowser mode="select" v-model:selected="picked" />
        <template #footer>
            <el-button @click="pickerVisible = false">Cancelar</el-button>
            <el-button type="primary" :disabled="!picked.length" @click="attach">Adjuntar ({{ picked.length }})</el-button>
        </template>
    </el-dialog>
</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import DriveBrowser from './DriveBrowser.vue'
import { useAppStore } from '~/stores/app'
import { formatBytes, kindIcon } from '~/utils/files'
import { mergeAttachments, moveItem } from '~/utils/attachments'

export interface AttachedFile { id: number, original_name: string, extension: string, kind: string, size: number, url: string, created_at: string }

const props = defineProps<{ modelValue: AttachedFile[] }>()
const emit = defineEmits<{ 'update:modelValue': [AttachedFile[]] }>()

const isMobile = computed(() => useAppStore().isMobile)
const pickerVisible = ref(false)
const picked = ref<AttachedFile[]>([])

// La selección del diálogo empieza vacía cada vez que se abre
const openPicker = () => {
  picked.value = []
  pickerVisible.value = true
}

const attach = () => {
  emit('update:modelValue', mergeAttachments(props.modelValue, picked.value))
  pickerVisible.value = false
}

const move = (index: number, delta: -1 | 1) => emit('update:modelValue', moveItem(props.modelValue, index, delta))
const remove = (index: number) => emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
</script>

<style lang="scss" scoped>
.attached-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.attached-empty { color: var(--el-text-color-secondary); }
.attached-list { list-style: none; padding: 0; margin: 0; }
.attached-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.attached-thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; }
.attached-icon { width: 40px; justify-content: center; }
.attached-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attached-size { color: var(--el-text-color-secondary); font-size: 12px; white-space: nowrap; }
</style>
