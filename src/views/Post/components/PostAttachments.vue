<template>
    <section v-if="files.length" class="mt-6">
        <h2 class="text-h6 font-weight-bold mb-2">Archivos adjuntos</h2>
        <v-list lines="two" border rounded="lg">
            <v-list-item v-for="file in files" :key="file.id" :title="file.original_name">
                <template #prepend>
                    <v-icon :icon="iconFor(file.kind)" class="mr-2" />
                </template>
                <template #subtitle>
                    {{ (file.extension || '').toUpperCase() }} · {{ formatBytes(file.size) }}
                </template>
                <template #append>
                    <v-btn
                        :href="`${file.url}?download=1`"
                        target="_blank"
                        rel="noopener"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi mdi-download"
                    >Descargar</v-btn>
                </template>
            </v-list-item>
        </v-list>
    </section>
</template>

<script setup lang="ts">
import { formatBytes } from '~/utils/files'

interface AttachmentFile {
    id: number
    original_name: string
    extension: string | null
    size: number
    kind: string
    url: string
}

defineProps<{ files: AttachmentFile[] }>()

// Íconos MDI por tipo (registrados en src/plugins/icons.ts)
const icons: Record<string, string> = {
    pdf: 'mdi mdi-file-pdf-box',
    document: 'mdi mdi-file-document-outline',
    archive: 'mdi mdi-folder-zip-outline',
    audio: 'mdi mdi-file-music-outline',
    video: 'mdi mdi-file-video-outline',
    other: 'mdi mdi-file-outline',
}
const iconFor = (kind: string) => icons[kind] ?? icons.other
</script>
