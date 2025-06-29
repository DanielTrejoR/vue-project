<template>
<div class="table-wrapper">
    <h2>Listado de mis publicaciones</h2>
    <div>
        <div class="float-right pb-3">
            <el-button :loading="loading" type="primary" @click="getOwnerPosts">Recargar publicaciones</el-button>
        </div>
        <el-table v-loading="loading" :data="tableData" style="width: 100%">
            <el-table-column fixed prop="id" label="ID" />
            <el-table-column prop="title" label="Titulo" />
            <el-table-column prop="excerpt" label="Extracto" />
            <el-table-column prop="created_at" label="Creado el:" />
            <el-table-column prop="updated_at" label="Ultima actualizacón" />
            <el-table-column prop="published_at" label="Publicado el: " />
            <el-table-column fixed="right" label="Operations" >
            <template #default="scope">
                <el-button link type="primary" size="small" @click="handleClick(scope.row)">
                    Detalles
                </el-button>
                <el-button link type="primary" size="small">Edit</el-button>
                <el-button link type="primary" size="small">Ver</el-button>
            </template>
            </el-table-column>
        </el-table>
    </div>
    <div>
        <BaseModal ref="openModal">
            <h3>Extracto: {{ postInfo.excerpt }}</h3>
            <p>Cuerpo: <span v-html="postInfo.body"></span></p>
            <p>Publicado el: {{ postInfo.published_at }}</p>
            <p>Pertenece a la categoria: {{ postInfo.category.name }}</p>
            <p>Fotos:</p>
            <div v-if="postInfo.photos.length < 1">
                Sin fotos
            </div>
            <div v-else>
                <el-image
                    v-for="(image, index) in postInfo.photos"
                    :key="index"
                    :src="image.url"
                    style="width: 200px; height: 200px; margin-right: 10px;"
                    fit="cover"
                />
            </div>
            <p>Etiquetas de la publicacion:</p>
            <div>
                <el-tag v-for="tag in postInfo.tags" :key="tag.id" type="info">{{ tag.name }}</el-tag>
            </div>
        </BaseModal>
    </div>
</div>
</template>
<script lang="ts" setup>
import { onMounted, ref, inject } from 'vue';
import store  from '~/store';
import BaseModal from '~/components/Admin/BaseModal.vue';

const tableData = ref([]);
const postInfo = ref(null);
const showModal = ref(false);
const emitter = inject('emitter');
const loading = ref(false)
const handleClick = (postId: any) => {
    postInfo.value = postId;
    showModal.value = true;
    emitter.emit('openBaseModal', postId);
    
}
const getOwnerPosts = async () => {
    loading.value = true;
    try {
        store.dispatch('admin/fetchPosts').then((res) => {
            tableData.value = res.data.data
            
        }).catch((err) => {
            console.log(err);
            
        }).finally( () => {
            loading.value = false;
        })
    } catch (error) {
        
    }
}

onMounted(() => {
    getOwnerPosts();
});
</script>