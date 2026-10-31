<template>
<div>
    <div class="posts-header">
        <p class="muted">{{ hint }}</p>
        <div class="posts-header__actions">
            <el-button :loading="loading" @click="load">Recargar</el-button>
            <el-button type="primary" icon="Plus" @click="openForm()">{{ isCategory ? 'Nueva categoría' : 'Nueva etiqueta' }}</el-button>
        </div>
    </div>

    <el-input v-model="search" placeholder="Buscar por nombre" clearable class="taxonomy-search" />

    <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false" class="mb-4" />

    <el-table v-loading="loading" :data="filtered" style="width: 100%">
        <el-table-column label="Nombre" min-width="180">
            <template #default="{ row }">
                <RouterLink :to="blogLink(row)" target="_blank" class="post-title-link">{{ row.name }}</RouterLink>
            </template>
        </el-table-column>
        <el-table-column label="URL" prop="url" min-width="160" />
        <el-table-column label="Posts" prop="posts_count" min-width="80" align="center" />
        <el-table-column :fixed="isMobile ? false : 'right'" label="Acciones" min-width="200">
            <template #default="{ row }">
                <el-button size="small" icon="EditPen" @click="openForm(row)">Renombrar</el-button>
                <!-- una categoría con posts pide antes a cuál pasan; lo demás se confirma aquí mismo -->
                <el-button v-if="isCategory && row.posts_count" size="small" type="danger" plain icon="Delete" @click="openMove(row)">Borrar</el-button>
                <el-popconfirm
                    v-else
                    :title="confirmText(row)"
                    confirm-button-text="Borrar"
                    cancel-button-text="Cancelar"
                    confirm-button-type="danger"
                    width="250"
                    @confirm="remove(row)"
                >
                    <template #reference>
                        <el-button size="small" type="danger" plain icon="Delete" :loading="busyId === row.id">Borrar</el-button>
                    </template>
                </el-popconfirm>
            </template>
        </el-table-column>
        <template #empty>
            <div class="posts-empty">{{ search ? 'Nada coincide con la búsqueda.' : 'Todavía no hay ninguna.' }}</div>
        </template>
    </el-table>

    <el-dialog v-model="showForm" :title="editing ? `Renombrar «${editing.name}»` : (isCategory ? 'Nueva categoría' : 'Nueva etiqueta')" :width="isMobile ? '95%' : '420px'" destroy-on-close>
        <el-form @submit.prevent="save">
            <el-form-item :error="nameError">
                <el-input v-model="name" placeholder="Nombre" maxlength="60" show-word-limit autofocus />
            </el-form-item>
            <p v-if="editing" class="muted dialog-hint">La URL cambia con el nombre; los enlaces viejos dejarán de funcionar.</p>
        </el-form>
        <template #footer>
            <el-button @click="showForm = false">Cancelar</el-button>
            <el-button type="primary" :loading="saving" @click="save">Guardar</el-button>
        </template>
    </el-dialog>

    <el-dialog v-model="showMove" :title="`Borrar «${moving?.name ?? ''}»`" :width="isMobile ? '95%' : '420px'" destroy-on-close>
        <p class="dialog-hint">Tiene {{ moving?.posts_count }} post(s). Elige a qué categoría pasan antes de borrarla.</p>
        <el-select v-model="moveTo" placeholder="Categoría de destino" class="w-full">
            <el-option v-for="item in moveOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <template #footer>
            <el-button @click="showMove = false">Cancelar</el-button>
            <el-button type="danger" :disabled="!moveTo" :loading="busyId === moving?.id" @click="moving && remove(moving)">Mover y borrar</el-button>
        </template>
    </el-dialog>
</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '~/stores/app'
import { useTaxonomiesStore } from '~/stores/taxonomies'

type Item = Record<string, any>

const props = defineProps<{ kind: 'categories' | 'tags' }>()

const appStore = useAppStore()
const store = useTaxonomiesStore()

const isMobile = computed(() => appStore.isMobile)
const isCategory = computed(() => props.kind === 'categories')
const hint = computed(() => isCategory.value
    ? 'Cada post tiene una categoría. También se crean al escribir una nueva desde el editor.'
    : 'Un post puede tener varias etiquetas. También se crean al escribirlas desde el editor.')

const items = ref<Item[]>([])
const loading = ref(false)
const loadError = ref('')
const search = ref('')
const busyId = ref<number | null>(null)

const filtered = computed(() => {
    const term = search.value.trim().toLowerCase()
    return term ? items.value.filter(item => item.name.toLowerCase().includes(term)) : items.value
})

const blogLink = (item: Item) => isCategory.value
    ? { name: 'CategoryPosts', params: { category: item.url } }
    : { name: 'TagsPosts', params: { tag: item.url } }

const confirmText = (item: Item) => item.posts_count
    ? `¿Borrar «${item.name}»? Se quitará de ${item.posts_count} post(s).`
    : `¿Borrar «${item.name}»?`

const errorText = (error: any) => {
    const errors = error?.response?.data?.errors
    return errors ? Object.values(errors).flat().join(' ') : 'No se pudo guardar el cambio'
}

const load = async () => {
    loading.value = true
    loadError.value = ''
    try {
        items.value = await store.list(props.kind)
    } catch {
        loadError.value = 'No se pudo cargar la lista.'
    } finally {
        loading.value = false
    }
}

// crear y renombrar comparten el diálogo
const showForm = ref(false)
const editing = ref<Item | null>(null)
const name = ref('')
const nameError = ref('')
const saving = ref(false)

const openForm = (item: Item | null = null) => {
    editing.value = item
    name.value = item?.name ?? ''
    nameError.value = ''
    showForm.value = true
}

const save = async () => {
    saving.value = true
    nameError.value = ''
    try {
        const { message } = editing.value
            ? await store.rename(props.kind, editing.value.id, name.value)
            : await store.create(props.kind, name.value)
        ElMessage.success(message)
        showForm.value = false
        await load()
    } catch (error: any) {
        nameError.value = error?.response?.data?.errors?.name?.[0] ?? errorText(error)
    } finally {
        saving.value = false
    }
}

const showMove = ref(false)
const moving = ref<Item | null>(null)
const moveTo = ref<number | null>(null)
const moveOptions = computed(() => items.value.filter(item => item.id !== moving.value?.id))

const openMove = (item: Item) => {
    moving.value = item
    moveTo.value = null
    showMove.value = true
}

const remove = async (item: Item) => {
    busyId.value = item.id
    try {
        const { message } = await store.remove(props.kind, item.id, isCategory.value ? moveTo.value : null)
        ElMessage.success(message)
        showMove.value = false
        await load()
    } catch (error) {
        ElMessage.error(errorText(error))
    } finally {
        busyId.value = null
    }
}

onMounted(load)
</script>

<style src="../../list-page.css"></style>
<style scoped>
.muted {
    margin: 0;
    color: var(--ep-text-color-secondary);
    font-size: 14px;
}

.taxonomy-search {
    display: flex;
    max-width: 320px;
    margin-bottom: 12px;
}

.post-title-link {
    color: var(--ep-color-primary);
    font-weight: 600;
    text-decoration: none;
}

.dialog-hint {
    margin: 0 0 12px;
    font-size: 13px;
}
</style>
