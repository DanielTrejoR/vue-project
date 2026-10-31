<template>
<div class="table-wrapper">
    <div class="posts-header">
        <h2>Categorías y etiquetas</h2>
    </div>
    <!-- la pestaña vive en la URL (?tab=) para poder volver a ella -->
    <el-tabs v-model="activeTab">
        <el-tab-pane label="Categorías" name="categories" lazy>
            <TaxonomyTable kind="categories" />
        </el-tab-pane>
        <el-tab-pane label="Etiquetas" name="tags" lazy>
            <TaxonomyTable kind="tags" />
        </el-tab-pane>
    </el-tabs>
</div>
</template>

<script lang="ts" setup>
// el nombre coincide con la ruta: KeepAlive lo usa para conservar la vista (pestañas del admin)
defineOptions({ name: 'TaxonomiesIndex' })
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TaxonomyTable from './components/TaxonomyTable.vue'

const route = useRoute()
const router = useRouter()

const activeTab = computed({
    get: () => (route.query.tab === 'tags' ? 'tags' : 'categories'),
    set: tab => router.replace({ query: { ...route.query, tab: tab === 'categories' ? undefined : tab } }),
})
</script>

<style src="../list-page.css"></style>
