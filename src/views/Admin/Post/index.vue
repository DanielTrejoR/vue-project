<template>
<div class="table-wrapper">
    <h2>Listado de mis publicaciones</h2>
    <div>
        <div class="d-flex justify-end pb-2 mb-1">
            <el-button :color="theme" :loading="loading" type="primary" @click="getOwnerPosts()">Recargar publicaciones</el-button>
        </div>
        <div class="">
            <el-form :model="filters" @submit.prevent="getOwnerPosts" class="posts-filters">
                <el-select v-model="filters.status" placeholder="Estado" clearable>
                    <el-option label="Borrador" value="draft" />
                    <el-option label="Publicado" value="published" />
                </el-select>
                <el-input v-model="filters.search" placeholder="Buscar por título" clearable />
                <el-date-picker v-model="filters.published_from" type="date" placeholder="Desde" />
                <el-date-picker v-model="filters.published_to" type="date" placeholder="Hasta" />

                <div class="posts-filters__actions">
                    <el-button :loading="loading" :color="theme" @click="getOwnerPosts">Filtrar</el-button>
                    <el-button :loading="loading" :color="theme" @click="resetFilters">Limpiar Filtros</el-button>
                </div>
            </el-form>
        </div>
        <el-table v-loading="loading" element-loading-text="Cargando..." :style="{ opacity: loading ? 0.7 : 1 }" :data="tableData" style="width: 100%">
            <!-- anchos mínimos: en pantallas chicas la tabla se desplaza en horizontal en vez de aplastarse -->
            <el-table-column fixed prop="id" label="ID" width="60" />
            <el-table-column prop="title" label="Titulo" min-width="160" />
            <el-table-column prop="excerpt" label="Extracto" min-width="200" show-overflow-tooltip />
            <el-table-column prop="created_at" label="Creado el:" min-width="140" />
            <el-table-column prop="updated_at" label="Ultima actualizacón" min-width="150" />
            <el-table-column label="Estatus " min-width="100">
                <template #default="scope">
                    {{ scope.row.status === 'draft' ? 'Borrador' : 'Publicado' }}
                </template>
            </el-table-column>
            <el-table-column prop="published_at" label="Publicado el: " min-width="140" />
            <el-table-column :fixed="isMobile ? false : 'right'" label="Operations" min-width="280">
            <template #default="scope">
                <el-button :color="theme" type="primary" size="small" @click="handleClick(scope.row)">
                    Detalles
                </el-button>
                <el-button :color="theme" type="primary" size="small" @click="editPost(scope.row.url)">Edit</el-button>
                <el-button :color="theme" type="primary" size="small">Ver</el-button>
                <el-popconfirm
                    confirm-button-text="Yes"
                    cancel-button-text="No"
                    :icon="InfoFilled"
                    icon-color="#626AEF"
                    title="Are you sure to delete this?"
                    @confirm="deletePost(scope.row.url)"
                    @cancel="cancelEvent"
                >
                    <template #reference>
                    <el-button>Delete</el-button>
                    </template>
                </el-popconfirm>
            </template>
            </el-table-column>
        </el-table>
        <div class="d-flex justify-center pt-4 mt-5">
            <ElPagination 
                background 
                :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next, jumper, sizes'"
                :pager-count="isMobile ? 5 : 7"
                :total="Number(paginator.total)"
                :page-sizes="[10, 20, 30, 50]"
                :size="size"
                v-model:current-page="paginator.current_page"
                :page-size="paginator.per_page"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
            />
        </div>
    </div>
    <div>
        <el-dialog v-model="showPreview" title="Vista previa del post" :width="isMobile ? '95%' : '80%'">
            <PostPreview :post="postForm" />
        </el-dialog>
    </div>
</div>
</template>
<script lang="ts" setup>
import { onMounted, ref, inject, computed } from 'vue';
import store  from '~/store';
import BaseModal from '~/components/Admin/BaseModal.vue';
import type { ComponentSize } from 'element-plus'
import { number } from 'echarts';
import router from "~/router";
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { url } from 'inspector';
const size = ref<ComponentSize>('default')
const isMobile = computed(() => store.state.app.device === 'mobile')
const tableData = ref([]);
const postForm = ref(null);
const showModal = ref(false);
const showPreview = ref(false);
const emitter = inject('emitter');
const loading = ref(false)
const paginator = ref({
    data: []
})
const perPage = ref(20)
const sizePage = ref(20)
const theme = computed(() => store.state.settings?.theme || '#1890ff');

const handleClick = (post: any) => {
    postForm.value = post;
    showPreview.value = true;
    
}
const filters = ref({
    status: '',
    published_from: '',
    published_to: '',
    search: ''
})

const editPost = (postId: string) => {
    router.push({ name: 'EditPost', params: {url: postId}});
    
}

const getOwnerPosts = async (page: number, size: number) => {
    loading.value = true;
    try {
        page = perPage.value;
        size = sizePage.value;
        const filtersPage = cleanFilters(filters.value);
        console.log(filtersPage)
        const posts = await store.dispatch('posts/fetchPosts', {
            page: page,
            size: size,
            filters: filtersPage
        });
        tableData.value = posts.data;
        paginator.value = posts;
    } catch (error) {
        console.log(error)
    }finally {
        loading.value = false
    }
}

const cleanFilters = (filters: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== null && v !== undefined && v !== '';
    })
  );
}

const handleSizeChange = async (size: number) => { 
    sizePage.value = size
    getOwnerPosts(perPage.value, sizePage.value);
}

const handlePageChange = async (page: number) => {
  loading.value = true
  try {
    perPage.value = page
    getOwnerPosts(perPage.value, sizePage.value);
  } catch (error) {
    console.error(error.status)
  } finally {
    loading.value = false
  }
}

const deletePost = async (urlKey: string) => {
  try {
    loading.value = true;
    ElMessage.success('Post eliminado correctamente');
    const deletePostByKey = await store.dispatch('posts/deletePost', urlKey);
    if (deletePostByKey){
        getOwnerPosts(1, 10);
    }
    loading.value = false;
    // refrescar lista
  } catch (error) {
    console.log(error)
    loading.value = false;

  }
};

const cancelEvent = () => {
    ElMessage.success('Tu post sigue a salvo');

}

const resetFilters = () => {
    filters.value = {
        status: '',
        published_from: '',
        published_to: '',
        search: ''
    }
    getOwnerPosts(perPage.value, sizePage.value);

}

onMounted(() => {
    getOwnerPosts(perPage.value, sizePage.value);
});
</script>

<style>
.el-loading-mask {
  transition: opacity 0.3s ease-in-out;
}

.posts-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.posts-filters .ep-date-editor.ep-input {
  width: 100%;
}

.posts-filters__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.posts-filters__actions .ep-button + .ep-button {
  margin-left: 0;
}
</style>