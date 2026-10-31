<template>
  <el-popover v-if="player.hasMusic" placement="bottom-end" :width="332" trigger="click" popper-class="player-popper">
    <template #reference>
      <button type="button" class="player-indicator" :class="{ 'is-playing': player.playing }" :aria-label="label" :title="label">
        <PlayerBars v-if="player.track" :playing="player.playing" />
        <el-icon v-else :size="20"><Headset /></el-icon>
      </button>
    </template>
    <MusicPlayerCard class="player-theme" />
  </el-popover>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Headset } from '@element-plus/icons-vue'
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
.player-indicator {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.player-indicator:hover {
  background: var(--ep-fill-color-light);
}

.player-indicator.is-playing {
  color: var(--ep-color-primary);
}

/* colores de la tarjeta con las variables de Element Plus (siguen el tema y el modo oscuro) */
.player-theme {
  --player-accent: var(--ep-color-primary);
  --player-surface: var(--ep-bg-color-overlay);
  --player-text: var(--ep-text-color-primary);
  --player-muted: var(--ep-text-color-secondary);
  --player-line: var(--ep-fill-color-light);
  padding: 6px 4px 4px;
}
</style>
