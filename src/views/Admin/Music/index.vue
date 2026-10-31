<template>
<div class="table-wrapper">
    <div class="posts-header">
        <h2>Música</h2>
    </div>
    <!-- la pestaña vive en la URL (?tab=) para poder volver a ella -->
    <el-tabs v-model="activeTab">
        <el-tab-pane label="Canciones" name="tracks" lazy>
            <TracksTable />
        </el-tab-pane>
        <el-tab-pane label="Playlists" name="playlists" lazy>
            <PlaylistsTable />
        </el-tab-pane>
    </el-tabs>
</div>
</template>

<script lang="ts" setup>
// el nombre coincide con la ruta: KeepAlive lo usa para conservar la vista (pestañas del admin)
defineOptions({ name: 'MusicIndex' })
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TracksTable from './components/TracksTable.vue'
import PlaylistsTable from './components/PlaylistsTable.vue'

const route = useRoute()
const router = useRouter()

const activeTab = computed({
    get: () => (route.query.tab === 'playlists' ? 'playlists' : 'tracks'),
    set: tab => router.replace({ query: { ...route.query, tab: tab === 'tracks' ? undefined : tab } }),
})
</script>

<style src="../list-page.css"></style>
