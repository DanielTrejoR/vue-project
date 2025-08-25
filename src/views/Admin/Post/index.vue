<template>
<div class="table-wrapper mr-10">
    <h2>Listado de mis publicaciones</h2>
    <div>
        <div class="d-flex justify-end pb-2 mb-1">
            <el-button :style="{backgroundColor: theme, borderColor: theme}" :loading="loading" type="primary" @click="getOwnerPosts()">Recargar publicaciones</el-button>
        </div>
        <div class="">
            <el-form :model="filters" inline @submit.prevent="getOwnerPosts" class="d-flex justify-center flex-column">
                <div class="pb-4">
                    <el-select v-model="filters.status" placeholder="Estado" clearable class="pb-3">
                        <el-option label="Borrador" value="draft" />
                        <el-option label="Publicado" value="published" />
                    </el-select>
                    <el-input v-model="filters.search" placeholder="Buscar por título" clearable />
                </div>
                <div class="d-flex justify-start">
                    <el-date-picker v-model="filters.published_from" type="date" placeholder="Desde" class="mr-5" />
                    
                    <el-date-picker v-model="filters.published_to" type="date" placeholder="Hasta" />
                </div>

                <div >
                    <el-button type="primary" @click="getOwnerPosts">Filtrar</el-button>
                    <el-button type="primary" @click="resetFilters">Limpiar Filtros</el-button>
                </div>
            </el-form>
        </div>
        <el-table v-loading="loading" element-loading-text="Cargando..." :style="{ opacity: loading ? 0.7 : 1 }" :data="tableData" style="width: 100%">
            <el-table-column fixed prop="id" label="ID" />
            <el-table-column prop="title" label="Titulo" />
            <el-table-column prop="excerpt" label="Extracto" />
            <el-table-column prop="created_at" label="Creado el:" />
            <el-table-column prop="updated_at" label="Ultima actualizacón" />
            <el-table-column label="Estatus ">
                <template #default="scope">
                    {{ scope.row.status === 'draft' ? 'Borrador' : 'Publicado' }}
                </template>
            </el-table-column>
            <el-table-column prop="published_at" label="Publicado el: " />
            <el-table-column fixed="right" label="Operations" >
            <template #default="scope">
                <el-button link type="primary" size="small" @click="handleClick(scope.row)">
                    Detalles
                </el-button>
                <el-button link type="primary" size="small" @click="editPost(scope.row.url)">Edit</el-button>
                <el-button link type="primary" size="small">Ver</el-button>
            </template>
            </el-table-column>
        </el-table>
        <div class="d-flex justify-center pt-4 mt-5">
            <ElPagination 
                background 
                layout="total, prev, pager, next, jumper, sizes"
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
        <el-dialog v-model="showPreview" title="Vista previa del post" width="80%">
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

const size = ref<ComponentSize>('default')
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
    console.error(error)
  } finally {
    loading.value = false
  }
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
</style>