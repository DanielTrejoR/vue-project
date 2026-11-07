<template>
<el-dialog :model-value="modelValue" :title="`Mover «${name}»`" :width="isMobile ? '95%' : '420px'" destroy-on-close @update:model-value="emit('update:modelValue', $event)" @open="load">
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb-4" />
    <el-tree
        v-loading="loading"
        :data="data"
        node-key="id"
        default-expand-all
        highlight-current
        :expand-on-click-node="false"
        :props="{ label: 'name', disabled: 'disabled' }"
        @node-click="pick"
    >
        <template #default="{ data: node }">
            <span :class="{ 'is-disabled': node.disabled }">{{ node.name }}</span>
        </template>
    </el-tree>
    <template #footer>
        <el-button @click="emit('update:modelValue', false)">Cancelar</el-button>
        <el-button type="primary" :disabled="target === undefined" :loading="saving" @click="confirm">Mover aquí</el-button>
    </template>
</el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAppStore } from '~/stores/app'
import { useDriveStore, apiMessage } from '~/stores/drive'

interface Node { id: number, name: string, disabled?: boolean, children?: Node[] }

// `exclude`: carpeta que se está moviendo; ella y sus descendientes no son destinos válidos
const props = defineProps<{ modelValue: boolean, name: string, exclude?: number | null }>()
const emit = defineEmits<{ 'update:modelValue': [boolean], confirm: [number | null] }>()

const store = useDriveStore()
const isMobile = computed(() => useAppStore().isMobile)
const data = ref<Node[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
// undefined = nada elegido; null = raíz
const target = ref<number | null | undefined>(undefined)

const load = async () => {
    target.value = undefined
    error.value = ''
    loading.value = true
    try {
        const flat = await store.tree()
        const byParent = new Map<number | null, Node[]>()
        for (const f of flat) {
            const list = byParent.get(f.parent_id) ?? []
            list.push({ id: f.id, name: f.name })
            byParent.set(f.parent_id, list)
        }
        const build = (nodes: Node[], blocked: boolean): Node[] => nodes.map(n => {
            const off = blocked || n.id === props.exclude
            return { ...n, disabled: off, children: build(byParent.get(n.id) ?? [], off) }
        })
        // la raíz se representa con id 0
        data.value = [{ id: 0, name: 'Mi drive', children: build(byParent.get(null) ?? [], false) }]
    } catch (e) {
        error.value = apiMessage(e, 'No se pudo cargar las carpetas.')
    } finally {
        loading.value = false
    }
}

const pick = (node: Node) => {
    if (node.disabled) return
    target.value = node.id || null
}

const confirm = () => {
    if (target.value === undefined) return
    emit('confirm', target.value)
}

// el padre avisa cuando termina de mover (éxito o error) para soltar el botón
defineExpose({ setSaving: (v: boolean) => { saving.value = v } })
</script>

<style scoped>
.is-disabled {
    opacity: 0.45;
    cursor: not-allowed;
}
</style>
