<template>
<div class="table-wrapper">
    <div class="posts-header">
        <h2>Listado de mis publicaciones</h2>
        <div class="posts-header__actions">
            <el-button :loading="loading" @click="getOwnerPosts()">Recargar</el-button>
            <el-button type="primary" icon="Plus" @click="router.push({ name: 'postsCreate' })">Nuevo post</el-button>
        </div>
    </div>

    <el-form :model="filters" @submit.prevent="applyFilters" class="posts-filters">
        <el-select v-model="filters.status" placeholder="Estado" clearable>
            <el-option label="Borrador" value="draft" />
            <el-option label="Publicado" value="published" />
        </el-select>
        <el-input v-model="filters.search" placeholder="Buscar por título" clearable />
        <!-- value-format: el backend valida 'date' y no acepta el Date de JavaScript -->
        <el-date-picker v-model="filters.published_from" type="date" placeholder="Publicado desde" value-format="YYYY-MM-DD" />
        <el-date-picker v-model="filters.published_to" type="date" placeholder="Publicado hasta" value-format="YYYY-MM-DD" />

        <div class="posts-filters__actions">
            <el-button type="primary" native-type="submit" :loading="loading">Filtrar</el-button>
            <el-button :disabled="!hasFilters" @click="resetFilters">Limpiar filtros</el-button>
        </div>
    </el-form>

    <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false" class="mb-4" />

    <el-table v-loading="loading" element-loading-text="Cargando..." :data="tableData" style="width: 100%">
        <!-- anchos mínimos: en pantallas chicas la tabla se desplaza en horizontal en vez de aplastarse -->
        <el-table-column fixed prop="id" label="ID" width="60" />
        <el-table-column label="Título" min-width="200">
            <template #default="{ row }">
                <a class="post-title-link" @click.prevent="openDetails(row)" href="#">{{ row.title }}</a>
                <div class="post-excerpt">{{ row.excerpt || 'Sin resumen' }}</div>
            </template>
        </el-table-column>
        <el-table-column label="Categoría" min-width="130">
            <template #default="{ row }">{{ row.category?.name || '—' }}</template>
        </el-table-column>
        <el-table-column label="Estado" min-width="110">
            <template #default="{ row }">
                <el-tag :type="row.status === 'published' ? 'success' : 'info'" disable-transitions>
                    {{ row.status === 'published' ? 'Publicado' : 'Borrador' }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="Publicado el" min-width="160">
            <template #default="{ row }">{{ row.published_at || '—' }}</template>
        </el-table-column>
        <el-table-column prop="updated_at" label="Última actualización" min-width="170" />
        <el-table-column :fixed="isMobile ? false : 'right'" label="Acciones" min-width="300">
            <template #default="{ row }">
                <el-button size="small" icon="Document" @click="openDetails(row)">Detalles</el-button>
                <el-button size="small" type="primary" icon="Edit" @click="editPost(row.url)">Editar</el-button>
                <el-tooltip :content="row.status === 'published' ? 'Abrir en el blog' : 'Borrador: solo lo ves tú con la sesión iniciada'">
                    <el-button size="small" icon="View" @click="viewPost(row.url)">Ver</el-button>
                </el-tooltip>
                <el-popconfirm
                    confirm-button-text="Eliminar"
                    cancel-button-text="Cancelar"
                    confirm-button-type="danger"
                    :icon="WarningFilled"
                    icon-color="var(--ep-color-danger)"
                    :title="`¿Eliminar «${row.title}»?`"
                    width="240"
                    @confirm="deletePost(row)"
                >
                    <template #reference>
                        <el-button size="small" type="danger" plain icon="Delete" :loading="deletingUrl === row.url">Eliminar</el-button>
                    </template>
                </el-popconfirm>
            </template>
        </el-table-column>
        <template #empty>
            <div class="posts-empty">
                <template v-if="hasFilters">Ningún post coincide con los filtros.</template>
                <template v-else>Todavía no tienes publicaciones.</template>
            </div>
        </template>
    </el-table>

    <div class="d-flex justify-center pt-4 mt-5">
        <el-pagination
            background
            :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next, jumper, sizes'"
            :pager-count="isMobile ? 5 : 7"
            :total="total"
            :page-sizes="[10, 20, 30, 50]"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            @current-change="getOwnerPosts()"
            @size-change="applyFilters"
        />
    </div>

    <el-dialog v-model="showPreview" title="Detalles del post" :width="isMobile ? '95%' : '70%'" destroy-on-close>
        <PostPreview v-if="selectedPost" :post="selectedPost" />
        <template #footer>
            <el-button @click="showPreview = false">Cerrar</el-button>
            <el-button icon="View" @click="viewPost(selectedPost?.url)">Ver en el blog</el-button>
            <el-button type="primary" icon="Edit" @click="editPost(selectedPost?.url)">Editar</el-button>
        </template>
    </el-dialog>
</div>
</template>
<script lang="ts" setup>
// el nombre coincide con la ruta: KeepAlive lo usa para conservar la vista (pestañas del admin)
defineOptions({ name: 'PostsIndex' })
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { useAppStore } from '~/stores/app'
import { usePostsStore } from '~/stores/posts'
import PostPreview from '~/components/Admin/PostPreview.vue'

type Post = Record<string, any>

const router = useRouter()
const appStore = useAppStore()
const postsStore = usePostsStore()

const isMobile = computed(() => appStore.isMobile)
const tableData = ref<Post[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const loadError = ref('')
const deletingUrl = ref<string | null>(null)

const emptyFilters = () => ({
    status: '',
    published_from: '',
    published_to: '',
    search: ''
})
const filters = ref(emptyFilters())
const hasFilters = computed(() => Object.values(filters.value).some(value => value))

// solo se mandan los filtros con valor
const activeFilters = () => Object.fromEntries(
    Object.entries(filters.value).filter(([, value]) => value !== null && value !== undefined && value !== '')
)

const getOwnerPosts = async () => {
    loading.value = true
    loadError.value = ''
    try {
        const posts = await postsStore.fetchPosts({
            page: currentPage.value,
            size: pageSize.value,
            filters: activeFilters()
        })
        tableData.value = posts.data
        total.value = Number(posts.total) || 0
    } catch (error: any) {
        const errors = error?.response?.data?.errors
        loadError.value = errors
            ? Object.values(errors).flat().join(' ')
            : 'No se pudieron cargar las publicaciones.'
    } finally {
        loading.value = false
    }
}

// un filtro o tamaño de página nuevo empieza en la primera página
const applyFilters = () => {
    currentPage.value = 1
    getOwnerPosts()
}

const resetFilters = () => {
    filters.value = emptyFilters()
    applyFilters()
}

const editPost = (url?: string) => {
    if (url) router.push({ name: 'EditPost', params: { url } })
}

// abre el post público en otra pestaña (los borradores solo se ven con la sesión iniciada)
const viewPost = (url?: string) => {
    if (!url) return
    window.open(router.resolve({ name: 'ViewPost', params: { url } }).href, '_blank', 'noopener')
}

const showPreview = ref(false)
const selectedPost = ref<Post | null>(null)
const openDetails = (post: Post) => {
    selectedPost.value = post
    showPreview.value = true
}

const deletePost = async (post: Post) => {
    deletingUrl.value = post.url
    try {
        await postsStore.deletePost(post.url)
        ElMessage.success(`«${post.title}» se eliminó`)
        // si era el último de la página, vuelve a la anterior
        if (tableData.value.length === 1 && currentPage.value > 1) {
            currentPage.value--
        }
        await getOwnerPosts()
    } catch (error: any) {
        ElMessage.error(error?.response?.status === 403
            ? 'No tienes permiso para eliminar este post'
            : 'No se pudo eliminar el post')
    } finally {
        deletingUrl.value = null
    }
}

onMounted(getOwnerPosts)
</script>

<style src="../list-page.css"></style>
<style>
.post-title-link {
  color: var(--ep-color-primary);
  font-weight: 600;
  text-decoration: none;
}

.post-title-link:hover {
  text-decoration: underline;
}

.post-excerpt {
  color: var(--ep-text-color-secondary);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
