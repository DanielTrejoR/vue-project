<template>
<div class="table-wrapper drive-page">
    <div class="posts-header">
        <div>
            <h2>Drive</h2>
            <p class="muted">Tus carpetas y archivos privados. Puedes adjuntarlos a tus posts.</p>
        </div>
    </div>
    <DriveBrowser mode="manage" />
</div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'DriveIndex' })
import DriveBrowser from '~/components/Admin/Drive/DriveBrowser.vue'
</script>

<style src="../list-page.css"></style>
<style scoped>
.drive-page .posts-header {
    text-align: left;
}
</style>
