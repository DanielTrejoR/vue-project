<template>
  <!-- Tarjeta del reproductor, inspirada en el "Mini Music Player" de Muhammed Erdem (diseño de Voicu Apostol).
       Los colores salen de variables CSS que pone cada lado: --player-accent, --player-surface, --player-text,
       --player-muted y --player-line (ver PlayerIndicator del admin y del blog). -->
  <div class="player-card">
    <div class="player-card__cover">
      <div v-if="track?.cover_url" class="player-card__glow" :style="{ backgroundImage: `url(${track.cover_url})` }" />
      <transition name="cover" mode="out-in">
        <img v-if="track?.cover_url" :key="track.cover_url" :src="track.cover_url" alt="" class="player-card__image" />
        <div v-else :key="'sin-portada'" class="player-card__image player-card__image--empty">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiMusicNote" /></svg>
        </div>
      </transition>
    </div>

    <div class="player-card__controls">
      <button type="button" class="player-card__icon" aria-label="Anterior" :disabled="!track" @click="player.prev()">
        <svg viewBox="0 0 24 24"><path :d="mdiSkipPrevious" /></svg>
      </button>
      <button type="button" class="player-card__icon" aria-label="Siguiente" :disabled="!track" @click="player.next()">
        <svg viewBox="0 0 24 24"><path :d="mdiSkipNext" /></svg>
      </button>
      <button
        type="button"
        class="player-card__play"
        :aria-label="player.playing ? 'Pausar' : 'Reproducir'"
        :disabled="!player.hasMusic"
        @click="player.toggle()"
      >
        <svg viewBox="0 0 24 24"><path :d="player.playing ? mdiPause : mdiPlay" /></svg>
      </button>
    </div>

    <div class="player-card__info">
      <div class="player-card__titles">
        <strong class="player-card__title">{{ track?.title ?? 'Sin canción' }}</strong>
        <span class="player-card__artist">{{ track?.artist || player.playlist?.name || '' }}</span>
      </div>
      <span class="player-card__time">{{ formatTime(player.currentTime) }} / {{ formatTime(player.duration) }}</span>
    </div>

    <input
      class="player-card__progress"
      type="range"
      min="0"
      :max="player.duration || 0"
      step="1"
      :value="player.currentTime"
      :style="{ '--progress': `${player.progress * 100}%` }"
      :disabled="!track"
      aria-label="Posición en la canción"
      @input="player.seek(Number(($event.target as HTMLInputElement).value))"
    />

    <p v-if="player.error" class="player-card__error">{{ player.error }}</p>

    <div class="player-card__footer">
      <select
        v-if="player.playlists.length > 1"
        class="player-card__select"
        :value="player.playlistId ?? undefined"
        aria-label="Playlist"
        @change="player.select(Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="playlist in player.playlists" :key="playlist.id" :value="playlist.id">{{ playlist.name }}</option>
      </select>
      <span v-else class="player-card__playlist">{{ player.playlist?.name }}</span>

      <button type="button" class="player-card__icon player-card__icon--small" :aria-expanded="showList" aria-label="Lista de canciones" @click="showList = !showList">
        <svg viewBox="0 0 24 24"><path :d="mdiPlaylistMusic" /></svg>
      </button>
    </div>

    <ol v-if="showList" class="player-card__list">
      <li v-for="(item, i) in player.queue" :key="item.id">
        <button type="button" :class="{ 'is-current': i === player.index }" @click="player.select(player.playlistId!, i)">
          <span class="player-card__list-title">{{ item.title }}</span>
          <span class="player-card__list-time">{{ formatTime(item.duration ?? 0) }}</span>
        </button>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { mdiMusicNote, mdiPause, mdiPlay, mdiPlaylistMusic, mdiSkipNext, mdiSkipPrevious } from '@mdi/js'
import { usePlayerStore } from '~/stores/player'
import { formatTime } from './format-time'

const player = usePlayerStore()
const track = computed(() => player.track)
const showList = ref(false)
</script>

<style scoped>
.player-card {
  --size: 44px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 300px;
  max-width: 100%;
  color: var(--player-text);
  text-align: left;
}

/* portada con su propio color difuminado debajo, como en el diseño original */
.player-card__cover {
  position: relative;
  aspect-ratio: 4 / 3;
}

.player-card__glow {
  position: absolute;
  inset: 18% 8% -6%;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  filter: blur(18px);
  opacity: 0.7;
}

.player-card__image {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  object-fit: cover;
}

.player-card__image--empty {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--player-accent), color-mix(in srgb, var(--player-accent) 35%, #000));
}

.player-card__image--empty svg {
  width: 56px;
  fill: rgb(255 255 255 / 0.85);
}

.player-card__controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.player-card__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--player-muted);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.player-card__icon svg {
  width: 24px;
  fill: currentColor;
}

.player-card__icon:hover:not(:disabled) {
  color: var(--player-accent);
  background: var(--player-line);
}

.player-card__icon--small {
  width: 30px;
  height: 30px;
}

.player-card__icon--small svg {
  width: 20px;
}

.player-card__play {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--player-accent);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--player-accent) 40%, transparent);
  color: #fff;
  cursor: pointer;
  transition: transform 0.15s;
}

.player-card__play svg {
  width: 30px;
  fill: currentColor;
}

.player-card__play:hover:not(:disabled) {
  transform: scale(1.06);
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

.player-card__info {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.player-card__titles {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.player-card__title,
.player-card__artist {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-card__title {
  font-size: 16px;
}

.player-card__artist,
.player-card__time,
.player-card__playlist {
  color: var(--player-muted);
  font-size: 13px;
}

.player-card__time {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

/* barra de progreso: el relleno sale de --progress */
.player-card__progress {
  width: 100%;
  height: 6px;
  margin: 0;
  border-radius: 999px;
  background: linear-gradient(to right, var(--player-accent) var(--progress), var(--player-line) var(--progress));
  appearance: none;
  cursor: pointer;
}

.player-card__progress::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--player-accent);
  appearance: none;
}

.player-card__progress::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 0;
  border-radius: 50%;
  background: var(--player-accent);
}

.player-card__error {
  margin: 0;
  color: #e5484d;
  font-size: 13px;
}

.player-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.player-card__select {
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  border: 1px solid var(--player-line);
  border-radius: 8px;
  background: var(--player-surface);
  color: var(--player-text);
  font: inherit;
  font-size: 13px;
}

.player-card__list {
  max-height: 200px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.player-card__list button {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--player-text);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.player-card__list button:hover,
.player-card__list button.is-current {
  background: var(--player-line);
}

.player-card__list button.is-current {
  color: var(--player-accent);
}

.player-card__list-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-card__list-time {
  flex-shrink: 0;
  color: var(--player-muted);
  font-variant-numeric: tabular-nums;
}

.cover-enter-active,
.cover-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.cover-enter-from,
.cover-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
