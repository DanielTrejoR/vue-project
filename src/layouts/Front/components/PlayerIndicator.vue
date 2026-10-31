<template>
  <v-menu v-if="player.hasMusic" location="bottom end" origin="top end" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn icon v-bind="props" :aria-label="label" :title="label">
        <PlayerBars v-if="player.track" :playing="player.playing" />
        <v-icon v-else icon="mdi mdi-music-note" />
      </v-btn>
    </template>
    <v-card rounded="lg" width="332" max-width="calc(100vw - 24px)" class="pa-4">
      <MusicPlayerCard class="player-theme" />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import MusicPlayerCard from '~/components/MusicPlayer/MusicPlayerCard.vue'
import PlayerBars from '~/components/MusicPlayer/PlayerBars.vue'
import { usePlayerStore } from '~/stores/player'

const player = usePlayerStore()
onMounted(() => player.load())

const label = computed(() => {
  if (!player.track) return 'Reproductor'
  return `${player.playing ? 'Sonando' : 'En pausa'}: ${player.track.title}`
})
</script>

<style scoped>
/* colores de la tarjeta con el tema de Vuetify (claro, oscuro y el color elegido) */
.player-theme {
  --player-accent: rgb(var(--v-theme-primary));
  --player-surface: rgb(var(--v-theme-surface));
  --player-text: rgb(var(--v-theme-on-surface));
  --player-muted: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  --player-line: rgba(var(--v-theme-on-surface), 0.08);
}
</style>
